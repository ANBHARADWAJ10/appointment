const Doctor = require("../models/doctor");

const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    await Doctor.findByIdAndUpdate(doctorId, {
      isDeleted: true,
       status: "deleted",
      updatedAt: new Date()
    });

    res.status(200).json({ message: "Doctor will be removed after 7 days" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7*24*60* 60 * 1000);

    const doctors = await Doctor.find({
      $or: [
        { isDeleted: false }, 
        {
          isDeleted: true,
          updatedAt: { $gte: oneWeekAgo } 
        }
      ]
    });

    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { deleteDoctor, getDoctors, getDoctorById };
