const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  gender: String,
  blood: String,
  contact: String,
  symptoms: { type: String, default: "" },
});

module.exports = mongoose.model("Patient", patientSchema); 
