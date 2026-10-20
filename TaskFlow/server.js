
const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Basic API test
app.get("/api", (req, res) => {
    res.json({
        message: "TaskFlow API is running!"
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

        app.listen(PORT, () => {
            console.log(
                `TaskFlow server running at http://localhost:${PORT}`
            );
            console.log("MongoDB connected successfully!");
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
