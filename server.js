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

if (!mongoURI) {
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

console.log("✅ Mongo URI Loaded");

// ===== Cron Jobs =====
const removeDeletedAdminsFromDb = require("./cron/deletedadmins");
const removeDeletedDoctors = require("./cron/deleteddoctor");

// ===== Routes =====
const confirmationRoutes = require("./routes/confirmationsroutes");
const doctorsRoutes = require("./routes/doctorsroutes");
const { router: adminRoutes } = require("./routes/adminroutes");
const { router: superadminRoutes } = require("./routes/superadminroutes");
const patientRoutes = require("./routes/patientroutes");
const employeeRoutes = require("./routes/employeeRoutes"); // ✅ Employee Route

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Static Files =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== File Upload Test Endpoint (Optional) =====
const upload = multer({ dest: "uploads/test/" });
app.post("/test-upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  console.log("📸 Test upload file:", req.file);
  res.send("File uploaded successfully: " + req.file.path);
});

// ===== API Routes =====
app.use("/api/confirmations", confirmationRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/employees", employeeRoutes); // ✅ Employee API linked

// ===== Web Pages =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get("/superadmin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "superadmin.html"));
});

// ===== MongoDB Connect & Start Server =====
mongoose.connect(mongoURI)

  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(port, () => {
      console.log(`🚀 Server running at: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===== Cron Schedules =====
// Runs every hour
cron.schedule("0 * * * *", () => {
  console.log("⏰ Running hourly cleanup: removeDeletedAdminsFromDb");
  removeDeletedAdminsFromDb();
});

// Runs every minute
cron.schedule("* * * * *", () => {
  console.log("⏰ Running minutely cleanup: removeDeletedDoctors");
  removeDeletedDoctors();
});

// ===== Organizations API =====
const organizations = require("./organizations.json");

app.get("/api/organization/:id", (req, res) => {
  const org = organizations.find((o) => o.id === req.params.id);
  if (org) {
    res.json(org);
  } else {
    res.status(404).json({ message: "Organization not found" });
  }
});

// ===== 404 Fallback =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
