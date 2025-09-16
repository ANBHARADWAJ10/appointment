const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  name:{ type: String,required:true }, 
  age:{ type: Number,required:true },
  contact:{ type: String,required:true }, 
  gender:{ type: String,required:true },
  testName: { type: String, required: true },
  result: { type: String, required: true },
  unit: String,
  referenceRange: String,
  normalRange: String,
  reportDate: { type: Date, default: Date.now },
 
});

module.exports = mongoose.model("LabReport", labReportSchema);
