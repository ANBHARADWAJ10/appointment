
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');


const uploadDir = path.join(__dirname, '..', 'uploads', 'signatures');
fs.mkdirSync(uploadDir, { recursive: true });


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});


router.post('/', upload.single('signature'), async (req, res) => {
  try {
    const {
      salutation, firstName, middleName, lastName,
      dob, gender, contact, email, department, role,
      employeeType, dateOfJoining, address, panNo,
      bloodGroup, experience, qualification,
      startTime, endTime
    } = req.body;

    const existing = await Employee.findOne({
      $or: [{ email }, { contact }]
    });
    if (existing) {
      return res.status(400).json({ error: 'Employee already exists with same email or contact' });
    }

    const newEmployee = new Employee({
      salutation,
      firstName,
      middleName,
      lastName,
      dob,
      gender,
      contact,
      email,
      department,
      role,
      employeeType,
      dateOfJoining,
      address,
      panNo,
      bloodGroup,
      experience,
      qualification,
      startTime,
      endTime,
      signature: req.file ? `/uploads/signatures/${req.file.filename}` : null,
      isActive: true
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);

  } catch (err) {
    console.error('Error saving employee:', err);
    res.status(500).json({ error: 'Server error while saving employee' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
