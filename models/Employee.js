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

  admin: {
    passwordHash: String
  },

  doctor: {
    specialization: String,
    experience: String,
    qualification: String,
    availability: { start: String, end: String }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
