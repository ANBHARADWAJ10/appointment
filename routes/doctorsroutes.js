const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const Doctor = require("../models/doctor");
const Confirmation = require("../models/confirmation");
const DateModel = require("../models/date");
const { deleteDoctor, getDoctors, getDoctorById } = require("../controllers/doctorcontroller");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // 🔒 move to .env


router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, specialty, ...rest } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "A doctor with this email already exists." });
    }

    const doctor = new Doctor({
      firstName,
      lastName,
      specialty,
      email,
      password,
      ...rest,
      name: `Dr. ${firstName} ${lastName}`,
    });

    await doctor.save();
    res.status(201).json({ message: "Doctor registered successfully", doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Doctor
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found." });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor", email: doctor.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        status: doctor.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get("/", getDoctors);
router.delete("/:id", deleteDoctor);

router.get("/:id", getDoctorById);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doctor_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Doctor availability by date
router.get("/:doctorId/availability", async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    let start, end;
    if (doctor.availabilityByDate && doctor.availabilityByDate.get(date)) {
      start = doctor.availabilityByDate.get(date).start;
      end = doctor.availabilityByDate.get(date).end;
    } else {
      [start, end] = (doctor.availability || "9:00 AM - 5:00 PM").split("-").map((s) => s.trim());
    }

    const confirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");
    const booked = confirmations
      .filter(
        (c) =>
          c.date &&
          c.date.date === date &&
          c.status !== "canceled" &&
          c.status !== "cancelled"
      )
      .map((c) => c.date.time);

    res.json({ start, end, booked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:doctorId/availability", async (req, res) => {
  const { doctorId } = req.params;
  const { date, start, end } = req.body;
  if (!date || !start || !end)
    return res.status(400).json({ error: "date, start, and end are required" });

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.availabilityByDate.set(date, { start, end });
    await doctor.save();

    res.json({ message: "Availability updated", date, start, end });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update doctor info (photo + data)
router.put("/:doctorId", upload.single("photo"), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;

    if (updateData.phone) {
      const phonePattern = /^[6-9][0-9]{9}$/;
      if (!phonePattern.test(updateData.phone)) {
        return res
          .status(400)
          .json({ error: "Phone number must be 10 digits and start with 6, 7, 8, or 9." });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "") delete updateData[key];
    });

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true });
    if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(updatedDoctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

// Permanently delete a doctor
// router.delete("/:doctorId", async (req, res) => {
//   try {
//     const { doctorId } = req.params;

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ error: "Doctor not found" });
//     }

//     const confirmations = await Confirmation.find({ doctor: doctorId });
//     const dateIds = confirmations.map((c) => c.date).filter(Boolean);

//     await Confirmation.deleteMany({ doctor: doctorId });
//     if (dateIds.length > 0) {
//       await DateModel.deleteMany({ _id: { $in: dateIds } });
//     }

//     await Doctor.findByIdAndDelete(doctorId);

//     res.json({ message: "Doctor deleted permanently" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete doctor" });
//   }
// });




module.exports = router;
