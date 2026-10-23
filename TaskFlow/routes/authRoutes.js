
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Validate email format
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Generate JWT token safely
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from environment variables");
    }

    // Use a valid default if JWT_EXPIRES_IN is not configured.
    // Examples: 60, "15m", "1h", "7d"
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    return jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

// ===============================
// REGISTER A NEW USER
// POST /api/auth/register
// ===============================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Name, email, and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 50) {
            return res.status(400).json({
                message: "Name must contain 2 to 50 characters."
            });
        }

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes."
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful. You can now log in.",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Unable to register. Please try again."
        });
    }
});

// ===============================
// LOG IN
// POST /api/auth/login
// ===============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (!user.password) {
            console.error("Login failed: password hash is missing for user.");
            return res.status(500).json({
                message: "Unable to authenticate this account."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Unable to log in. Please try again."
        });
    }
});

// ===============================
// GET LOGGED-IN USER PROFILE
// GET /api/auth/me
// ===============================
router.get("/me", authMiddleware, async (req, res) => {
    try {
        // The existing auth middleware should set req.user.id.
        const user = await User.findById(req.user.id)
            .select("name email createdAt");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully.",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Profile error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve profile."
        });
    }
});

// ===============================
// UPDATE LOGGED-IN USER PROFILE
// PUT /api/auth/me
// ===============================
router.put("/me", authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                message: "Name and email are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 50) {
            return res.status(400).json({
                message: "Name must contain 2 to 50 characters."
            });
        }

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail,
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email address is already registered."
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    name: cleanName,
                    email: cleanEmail
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("name email createdAt");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: updatedUser._id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email address is already registered."
            });
        }

        console.error("Profile update error:", error.message);

        return res.status(500).json({
            message: "Unable to update profile."
        });
    }
});

module.exports = router;
