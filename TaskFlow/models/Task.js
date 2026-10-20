
const mongoose = require("mongoose");

// Task Schema
const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"]
        },

        description: {
            type: String,
            default: "",
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending"
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        dueDate: {
            type: Date,
            default: null
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Task must belong to a user"]
        }
    },
    {
        timestamps: true
    }
);

// Export the Mongoose model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
