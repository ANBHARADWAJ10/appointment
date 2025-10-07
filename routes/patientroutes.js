const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const Confirmation = require("../models/confirmation");

router.post("/", async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const patients = await Patient.find().populate('doctor'); 
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post("/", async (req, res) => {
  try {
   
    const patientDoc = await Patient.create(req.body.patient);

    const confirmationData = {
      patient: patientDoc._id,
      doctor: req.body.confirmation.doctorId,
      doctorName: req.body.confirmation.doctorName,
      date: req.body.confirmation.dateId,
      status: req.body.confirmation.status || 'confirmed',
      referralData: {
        referredBy: req.body.confirmation.referredBy || ""
      }
    };
    const confirmationDoc = await Confirmation.create(confirmationData);

    res.status(201).json({ patient: patientDoc, confirmation: confirmationDoc });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
