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
const { router: adminRoutes } = require("./routes/adminroutes");
const { router: superadminRoutes } = require("./routes/superadminroutes");
const labAppointmentsRoutes = require("./routes/labappointmentsroutes");
const patientTestRoutes = require("./routes/patienttestroutes");
const reportRoutes = require("./routes/reportroutes");
const labTestRoutes = require("./routes/labtestroutes");
const employeeRoutes = require("./routes/employeeRoutes");

// ===== Middleware =====
app.use(cors());
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
app.use("/api/employees", employeeRoutes);
app.use("/api/labAppointments", labAppointmentsRoutes);
app.use("/api/patientTests", patientTestRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/labtests", labTestRoutes);

// ===== Frontend Pages =====
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);
app.get("/superadmin", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "superadmin.html"))
);

// ===== Organizations Sample API =====
const organizations = require("./organizations.json");
app.get("/api/organization/:id", (req, res) => {
  const org = organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ message: "Organization not found" });
  res.json(org);
});

// ===== MongoDB Connection =====
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(port, () =>
      console.log(` Server running at http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== MongoDB Connection Events =====
mongoose.connection.on("disconnected", () => {
  console.warn(" MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

// ===== Cron Jobs =====
// Runs every hour on the hour
cron.schedule("0 * * * *", async () => {
  console.log(" Running hourly admin cleanup");
  await removeDeletedAdminsFromDb();
});

cron.schedule("0 * * * *", async () => {
  console.log(" Running hourly doctor cleanup");
  await removeDeletedDoctors();
});
