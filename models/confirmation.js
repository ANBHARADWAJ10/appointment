const mongoose = require('mongoose');

const confirmationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  date: { type: mongoose.Schema.Types.ObjectId, ref: 'Date', required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'pending', 'rescheduled', 'revisited', 'cancelled'], 
    default: 'confirmed' 
  },
  referralData: {
    referredBy: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model('Confirmation', confirmationSchema);
