const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true},
  qualification: { type: String, required:true },

  availability: { type: String, required: true },
    
  availabilityByDate: {
    type: Map,
    of: new mongoose.Schema({ start: String, end: String }, { _id: false }),
    default: {}
  },
  education: { type: String },
  image: { type: String },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

doctorSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

module.exports = mongoose.model('Doctor', doctorSchema);
