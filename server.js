// ===== Imports =====
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const cron = require("node-cron");

dotenv.config();

// ===== App Setup =====
const app = express();
const port = process.env.PORT || 3022;
const mongoURI = process.env.DATABASE_URL;

// ===== Cron Jobs =====
const removeDeletedAdminsFromDb = require("./cron/deletedadmins");
const removeDeletedDoctors = require("./cron/deleteddoctor");

// ===== Routes =====
const confirmationRoutes = require("./routes/confirmationsroutes");
const doctorsRoutes = require("./routes/doctorsroutes");
const { router: adminRoutes } = require('./routes/adminroutes');
const { router: superadminRoutes } = require('./routes/superadminroutes');
const patientRoutes = require("./routes/patientroutes"); 


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(CORS());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Static Files =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== File Upload Test =====
const upload = multer({ dest: "uploads/" });
app.post("/test-upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  console.log("Test upload file:", req.file);
  res.send("File uploaded: " + req.file.path);
});

// ===== API Routes =====
app.use("/api/confirmations", confirmationRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/patients", patientRoutes); 

app.post('/test-upload', upload.single('photo'), (req, res) => {
  console.log('Test upload file:', req.file);
  if (req.file) {
    res.send('File uploaded: ' + req.file.path);
  } else {
    res.status(400).send('No file uploaded');
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});


app.get("/superadmin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "superadmin.html"));
});


mongoose.connect(mongoURI).then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});


cron.schedule('0 * * * *', () => {
  console.log('cron')
  removeDeletedAdminsFromDb();  
})

cron.schedule('* * * * *', () => {
  console.log('cron')
  removeDeletedDoctors();
})
const organizations = require("./organizations.json");

app.get("/api/organization/:id", (req, res) => {
  const org = organizations.find(o => o.id === req.params.id);
  if (org) {
    res.json(org);
  } else {
    res.status(404).json({ message: "Organization not found" });
  }
});
