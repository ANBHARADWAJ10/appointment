const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
  salutation: String,
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  dob: Date,
  gender: String,
  contact: String,
  email: String,
  department: { type: String, enum: ['Admin','Doctor',''], required: true },
  role: String,
  type: String,
  dateOfJoining: Date,
  address: String,
  panNo: String,
  bloodGroup: String,
  isActive: { type: Boolean, default: true },

  // ✅ NEW FIELD
  signature: String, // file path or Base64 string of uploaded signature

  admin: {
    passwordHash: String
  },

  doctor: {
    specialization: String,
    experience: String,
    qualification: String,
    // ✅ keep times in AM/PM format
    availability: { 
      start: String, // e.g. "09:30 AM"
      end: String    // e.g. "05:30 PM"
    }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
