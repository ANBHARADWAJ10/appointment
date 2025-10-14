const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  salutation: { type: String },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  contact: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  role: { type: String },
  employeeType: { type: String },
  dateOfJoining: { type: Date },
  address: { type: String },
  panNo: { type: String },
  bloodGroup: { type: String },
  experience: { type: String },
  qualification: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  signature: { type: String },
  isActive: { type: Boolean, default: true },
  isDelete:{type:Boolean, default:false}
}, { timestamps: true });

module.exports = mongoose.model('employee', employeeSchema);
﻿
