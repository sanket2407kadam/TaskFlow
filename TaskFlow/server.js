
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to TaskFlow API!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`TaskFlow server running at http://localhost:${PORT}`);
});
