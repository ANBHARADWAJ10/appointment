const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // ✅ Add email
  password: { type: String, required: true },  
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
  status: { type: String, default: "active" },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

doctorSchema.index({ firstName: 1, lastName: 1 }, { unique: true });


doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


doctorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};




module.exports = mongoose.model('Doctor', doctorSchema);
