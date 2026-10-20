
const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Render provides PORT automatically; use 3000 locally.
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Basic API test
app.get("/api", (req, res) => {
    res.json({
        message: "TaskFlow API is running!",
        status: "success"
    });
});

// Authentication APIs
app.use("/api/auth", authRoutes);

// Task CRUD APIs
app.use("/api/tasks", taskRoutes);

// Start server after MongoDB connects
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`TaskFlow server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
