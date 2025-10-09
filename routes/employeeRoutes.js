const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).lean();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create employee
router.post('/', async (req, res) => {
  try {
    console.log("Received payload:", req.body); // << debug log

    const payload = req.body || {};
    if (!payload.firstName || !payload.lastName || !payload.department) {
      return res.status(400).json({ error: 'firstName, lastName and department are required' });
    }

    const doc = {
      salutation: payload.salutation || '',
      firstName: payload.firstName,
      middleName: payload.middleName || '',
      lastName: payload.lastName,
      dob: payload.dob ? new Date(payload.dob) : null,
      gender: payload.gender || '',
      contact: payload.contact || '',
      email: payload.email || '',
      department: payload.department,
      role: payload.role || '',
      type: payload.type || '',
      dateOfJoining: payload.dateOfJoining ? new Date(payload.dateOfJoining) : null,
      address: payload.address || '',
      panNo: payload.panNo || '',
      bloodGroup: payload.bloodGroup || '',
      isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true
    };

    // Handle Admin department
    if (payload.department === 'Admin') {
      if (!payload.password) {
        return res.status(400).json({ error: 'Password required for Admin' });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(payload.password, salt);
      doc.admin = { passwordHash: hash };
    }

    // Handle Doctor department
    if (payload.department === 'Doctor') {
      doc.doctor = {
        specialization: payload.specialization || '',
        experience: payload.experience || '',
        qualification: payload.qualification || '',
        availability: payload.availability || {}
      };
    }

    console.log("Employee document to create:", doc); // << debug log

    const created = await Employee.create(doc);
    console.log("Created employee:", created);

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


module.exports = router;