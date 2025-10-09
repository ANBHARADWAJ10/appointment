const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  //  age: {
  //   years: { type: Number, required: true },
  //   months: { type: Number, default: 0 },
  //   days: { type: Number, default: 0 }
  // },
  gender: { type: String },
  blood: { type: String },
 contact: { type: String },
  symptoms: { type: String, default: "" },
  department: { type: String }, 
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, 
});

module.exports = mongoose.model("Patient", patientSchema);