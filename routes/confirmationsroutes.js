const express = require("express");
const router = express.Router();
const Confirmation = require("../models/confirmation");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const DateModel = require("../models/date");


router.post("/", async (req, res) => {
  try {
    const { patientData, doctorData, dateData, referralData } = req.body;
    console.log("Received data:", { patientData, doctorData, dateData, referralData });

    let doctor = await Doctor.findOne({ name: doctorData.name });
    if (!doctor) {
      return res.status(400).json({ error: "Selected doctor does not exist. Please select an existing doctor." });
    }
    console.log("Found doctor:", doctor.name);

    const existingConfirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");
    const slotTaken = existingConfirmations.some(
      (conf) => conf.date.date === dateData.date && conf.date.time === dateData.time
    );
    if (slotTaken) {
      return res.status(400).json({ error: "This time slot is already booked for this doctor." });
    }

  
    const patient = new Patient(patientData);
    await patient.save();
    console.log("Patient saved:", patient.name);

   
    let date = await DateModel.findOne({ date: dateData.date, time: dateData.time });
    if (!date) {
      date = new DateModel(dateData);
      await date.save();
    }
    console.log("Date saved:", date.date, date.time);

    
    const confirmation = new Confirmation({
      patient: patient._id,
      doctor: doctor._id,
      doctorName: doctor.name,
      date: date._id,
      status: "confirmed",
      referralData: { referredBy: referralData?.referredBy || "" },
    });
    await confirmation.save();

    const populatedConfirmation = await Confirmation.findById(confirmation._id)
      .populate("doctor")
      .populate("patient")
      .populate("date")
      .lean();

    res.status(201).json(populatedConfirmation);
  } catch (error) {
    console.error("Error creating confirmation:", error);
    res.status(400).json({ error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && status !== "all") {
      if (status === "cancelled") {
        filter.status = { $in: ["cancelled", "canceled"] };
      } else {
        filter.status = status;
      }
    }

    const confirmations = await Confirmation.find(filter)
      .populate({ path: "doctor", select: "name specialty experience education image" })
      .populate({ path: "patient", select: "name age gender blood contact" })
      .populate({ path: "date", select: "date time" })
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
            name: c.patient.name || "",
            age: c.patient.age || "",
            gender: c.patient.gender || "",
            blood: c.patient.blood || "",
            contact: c.patient.contact || "",
          }
        : null,
      dateData: c.date
        ? { date: c.date.date || "", time: c.date.time || "" }
        : null,
      status: c.status || "pending",
      referralData: c.referralData || { referredBy: "" },
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching confirmations:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/booked-slots", async (req, res) => {
  const { doctorName, date } = req.query;
  try {
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const confirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");
    const bookedTimes = confirmations
      .filter((c) => c.date.date === date)
      .map((c) => c.date.time);

    res.json({ bookedTimes });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { action, date, time, patientData, doctorName, referralData } = req.body;
    console.log("PUT /api/confirmations/:id", req.params.id, "body:", req.body);

    const confirmation = await Confirmation.findById(req.params.id)
      .populate("date")
      .populate("doctor");

    if (!confirmation) {
      return res.status(404).json({ error: "Confirmation not found" });
    }


    if (action === "reschedule") {
      if (!date || !time) return res.status(400).json({ error: "Date and time are required for rescheduling." });

      const existing = await Confirmation.find({
        doctor: confirmation.doctor._id,
        _id: { $ne: confirmation._id },
      }).populate("date");

      const slotTaken = existing.some((conf) => conf.date?.date === date && conf.date?.time === time);
      if (slotTaken) return res.status(400).json({ error: "This time slot is already booked for this doctor." });

      let dateDoc = await DateModel.findOne({ date, time });
      if (!dateDoc) {
        dateDoc = new DateModel({ date, time });
        await dateDoc.save();
      }

      confirmation.date = dateDoc._id;
      confirmation.status = "rescheduled";
      await confirmation.save();

      const populated = await Confirmation.findById(confirmation._id).populate("doctor").populate("patient").populate("date");
      return res.json({ message: "Appointment rescheduled", confirmation: populated });
    }




if (action === "revisit") {
  if (!date || !time) 
    return res.status(400).json({ error: "Date and time are required for revisiting." });

  const existing = await Confirmation.find({
    doctor: confirmation.doctor._id,
    _id: { $ne: confirmation._id },
  }).populate("date");

  const slotTaken = existing.some((conf) => conf.date?.date === date && conf.date?.time === time);
  if (slotTaken) 
    return res.status(400).json({ error: "This time slot is already booked for this doctor." });

  let dateDoc = await DateModel.findOne({ date, time });
  if (!dateDoc) {
    dateDoc = new DateModel({ date, time });
    await dateDoc.save();
  }

  confirmation.date = dateDoc._id;
  confirmation.status = "revisited";   
  await confirmation.save();

  const populated = await Confirmation.findById(confirmation._id)
    .populate("doctor")
    .populate("patient")
    .populate("date");

  return res.json({ message: "Appointment revisited", confirmation: populated });
}


    if (action === "cancel") {
      confirmation.status = "cancelled";
      await confirmation.save();

      const populated = await Confirmation.findById(confirmation._id).populate("doctor").populate("patient").populate("date");
      return res.json({ message: "Appointment cancelled", confirmation: populated });
    }

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
        let dateDoc = await DateModel.findOne({ date, time });
        if (!dateDoc) {
          dateDoc = new DateModel({ date, time });
          await dateDoc.save();
        }
        confirmation.date = dateDoc._id;
      }

      if (referralData) {
        confirmation.referralData = { ...confirmation.referralData, ...referralData };
      }

      await confirmation.save();
      const populated = await Confirmation.findById(confirmation._id).populate("doctor").populate("patient").populate("date");
      return res.json({ message: "Appointment updated", confirmation: populated });
    }

    res.status(400).json({ error: "Invalid action or missing data" });
  } catch (error) {
    console.error("ERROR in PUT /api/confirmations/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
