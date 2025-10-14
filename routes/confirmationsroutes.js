const express = require("express");
const router = express.Router();
const Confirmation = require("../models/confirmation");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

// ✅ POST: Create new confirmation
router.post("/", async (req, res) => {
  try {
    const { patientData, doctorData, dateData, referralData } = req.body;
    console.log("Received confirmation data:", { patientData, doctorData, dateData, referralData });

    if (!patientData || !doctorData || !dateData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ name: doctorData.name });
    if (!doctor) {
      return res.status(400).json({ error: "Selected doctor does not exist." });
    }

    // Check if slot already taken for that doctor
    const existingConfirmations = await Confirmation.find({ doctor: doctor._id });
    const slotTaken = existingConfirmations.some(
      (conf) => conf.date?.date === dateData.date && conf.date?.time === dateData.time
    );
    if (slotTaken) {
      return res.status(400).json({ error: "This time slot is already booked for this doctor." });
    }

    // Create and save patient
    const patient = new Patient(patientData);
    await patient.save();

    // Create and save confirmation
    const confirmation = new Confirmation({
      patient: patient._id,
      doctor: doctor._id,
      doctorName: doctor.name,
      date: {
        date: dateData.date,
        time: dateData.time,
      },
      status: "confirmed",
      referralData: referralData || {},
    });

    await confirmation.save();

    // Populate doctor and patient info
    const populatedConfirmation = await Confirmation.findById(confirmation._id)
      .populate("doctor")
      .populate("patient")
      .lean();

    res.status(201).json(populatedConfirmation);
  } catch (error) {
    console.error("Error creating confirmation:", error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ GET: Fetch all confirmations
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status === "cancelled" ? { $in: ["cancelled", "canceled"] } : status;
    }

    const confirmations = await Confirmation.find(filter)
      .populate({ path: "doctor", select: "name specialty experience education image" })
      .populate({ path: "patient", select: "firstName middleName lastName age gender blood contact" })
      .lean();

    const formatted = confirmations.map((c) => ({
      _id: c._id,
      doctorData: {
        name: c.doctor?.name || c.doctorName,
        specialty: c.doctor?.specialty || "",
        qualification: c.doctor?.qualification || "",
        experience: c.doctor?.experience || "",
        availability: c.doctor?.availability || "",
      },
      patientData: c.patient
        ? {
            firstName: c.patient.firstName || "",
            middleName: c.patient.middleName || "",
            lastName: c.patient.lastName || "",
            age: c.patient.age || "",
            gender: c.patient.gender || "",
            blood: c.patient.blood || "",
            contact: c.patient.contact || "",
          }
        : null,
      dateData: c.date || { date: "", time: "" },
      status: c.status || "pending",
      referralData: c.referralData || { referredBy: "" },
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching confirmations:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET: Booked slots
router.get("/booked-slots", async (req, res) => {
  const { doctorName, date } = req.query;
  try {
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const confirmations = await Confirmation.find({ doctor: doctor._id });
    const bookedTimes = confirmations
      .filter((c) => c.date?.date === date)
      .map((c) => c.date.time);

    res.json({ bookedTimes });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT: Update or reschedule appointment
router.put("/:id", async (req, res) => {
  try {
    const { action, date, time, patientData, doctorName, referralData } = req.body;
    const confirmation = await Confirmation.findById(req.params.id)
      .populate("doctor")
      .populate("patient");

    if (!confirmation) {
      return res.status(404).json({ error: "Confirmation not found" });
    }

    // Reschedule
    if (action === "reschedule" || action === "revisit") {
      if (!date || !time) return res.status(400).json({ error: "Date and time required." });

      const existing = await Confirmation.find({
        doctor: confirmation.doctor._id,
        _id: { $ne: confirmation._id },
      });

      const slotTaken = existing.some(
        (conf) => conf.date?.date === date && conf.date?.time === time
      );
      if (slotTaken)
        return res.status(400).json({ error: "This time slot is already booked for this doctor." });

      confirmation.date = { date, time };
      confirmation.status = action === "reschedule" ? "rescheduled" : "revisited";
      await confirmation.save();

      const populated = await Confirmation.findById(confirmation._id)
        .populate("doctor")
        .populate("patient");

      return res.json({ message: `Appointment ${confirmation.status}`, confirmation: populated });
    }

    // Cancel
    if (action === "cancel") {
      confirmation.status = "cancelled";
      await confirmation.save();

      const populated = await Confirmation.findById(confirmation._id)
        .populate("doctor")
        .populate("patient");

      return res.json({ message: "Appointment cancelled", confirmation: populated });
    }

    // Edit patient/doctor/referral
    if (action === "edit") {
      if (patientData) {
        const patient = await Patient.findById(confirmation.patient);
        if (patient) {
          Object.assign(patient, patientData);
          await patient.save();
        }
      }

      if (doctorName) {
        const doctor = await Doctor.findOne({ name: doctorName });
        if (!doctor) return res.status(400).json({ error: "Doctor not found" });
        confirmation.doctor = doctor._id;
        confirmation.doctorName = doctor.name;
      }

      if (date && time) {
        confirmation.date = { date, time };
      }

      if (referralData) {
        confirmation.referralData = { ...confirmation.referralData, ...referralData };
      }

      await confirmation.save();

      const populated = await Confirmation.findById(confirmation._id)
        .populate("doctor")
        .populate("patient");

      return res.json({ message: "Appointment updated", confirmation: populated });
    }

    res.status(400).json({ error: "Invalid action or missing data" });
  } catch (error) {
    console.error("ERROR in PUT /api/confirmations/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST: Create standalone patient
router.post("/patients", async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating standalone patient:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
