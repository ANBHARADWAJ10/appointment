const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const router = express.Router();
const bcrypt = require("bcrypt");
const { encrypt } = require("../utils/encryption");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, contact } = req.body;
        if (!username || !email || !password || !contact) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const exists = await Admin.findOne({ username });
        if (exists) return res.status(400).json({ error: "Username already registered. Please try any name." });
        const encryptedPassword = encrypt(password);
        const admin = new Admin({
            username,
            email,
            password,
            encryptedPassword,
            role: 1,
            contact,
        });
        await admin.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let admin;
        admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ error: "Invalid credentials" });
        if (admin.isDeleted) return res.status(401).json({ error: "Account has been deleted" });
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
        await Admin.findByIdAndUpdate(admin._id, { status: "active" });
        const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, role: admin.role, name: admin.username });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token not provided" });
        const decryptToken = jwt.verify(token, JWT_SECRET);
        const { id, username, role } = decryptToken;
        await Admin.findByIdAndUpdate(id, { status: "inactive" });
        res.json({ message: `${username} logged out successfully` });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/resetPassword", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedPassword = encrypt(password);
        const updated = await Admin.findOneAndUpdate({ username }, { password: hashedPassword, encryptedPassword }, { new: true });

        if (!updated) return res.status(404).json({ error: "Username does not exist" });
        res.status(201).json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

router.put("/updateProfile", authMiddleware, async (req, res) => {
    try {
        const { id, username, email, contact } = req.body;
        if (!id || !username || !email || !contact) return res.status(400).json({ error: "Missing id, username, email, or contact" });

        const existing = await Admin.findOne({ email, _id: { $ne: id } });
        if (existing) return res.status(400).json({ error: "Email already registered" });

        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        admin.username = username;
        admin.email = email;
        admin.contact = contact;
        await admin.save();
        res.json({ success: true, username, email, contact });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/getAdminProfile", async (req, res) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.id;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { router, authMiddleware };
