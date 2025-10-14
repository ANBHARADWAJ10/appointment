const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');

// ====================== File Upload Setup ======================
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

// ====================== GET All Employees ======================
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// ====================== ADD New Employee ======================
router.post('/', upload.single('signature'), async (req, res) => {
  try {
    const {
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
      endTime
    } = req.body;

    // Check for duplicate email/contact
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

// ====================== UPDATE Employee (Edit) ======================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Error updating employee' });
  }
});


// ====================== DELETE Employee ======================
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

// ====================== EXPORT ROUTER ======================
module.exports = router;
