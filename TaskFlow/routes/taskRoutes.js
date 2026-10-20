
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// All task endpoints require authentication
router.use(authMiddleware);

// GET: Fetch tasks belonging to the logged-in user
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json(tasks);

    } catch (error) {
        console.error("Fetch tasks error:", error);

        return res.status(500).json({
            message: "Unable to load tasks."
        });
    }
});

// POST: Create a task for the logged-in user
router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required."
            });
        }

        // Validate optional fields
        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "Description must be text."
            });
        }

        if (
            status !== undefined &&
            !["Pending", "In Progress", "Completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid task status."
            });
        }

        if (
            priority !== undefined &&
            !["Low", "Medium", "High"].includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid task priority."
            });
        }

        let parsedDueDate = null;

        if (dueDate) {
            parsedDueDate = new Date(dueDate);

            if (Number.isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid due date."
                });
            }
        }

        const task = await Task.create({
            title: title.trim(),
            description: description || "",
            status: status || "Pending",
            priority: priority || "Medium",
            dueDate: parsedDueDate,
            user: req.user.id
        });

        return res.status(201).json(task);

    } catch (error) {
        console.error("Create task error:", error);

        return res.status(400).json({
            message: error.message || "Unable to create task."
        });
    }
});

// PUT: Update a task owned by the logged-in user
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const allowedFields = [
            "title",
            "description",
            "status",
            "priority",
            "dueDate"
        ];

        const updates = {};

        // Accept only approved task fields
        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update."
            });
        }

        // Validate title
        if (
            Object.prototype.hasOwnProperty.call(updates, "title")
        ) {
            if (
                typeof updates.title !== "string" ||
                !updates.title.trim()
            ) {
                return res.status(400).json({
                    message: "Task title cannot be empty."
                });
            }

            updates.title = updates.title.trim();
        }

        // Validate description
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "description"
            ) &&
            typeof updates.description !== "string"
        ) {
            return res.status(400).json({
                message: "Description must be text."
            });
        }

        // Validate status
        if (
            Object.prototype.hasOwnProperty.call(updates, "status") &&
            !["Pending", "In Progress", "Completed"].includes(
                updates.status
            )
        ) {
            return res.status(400).json({
                message: "Invalid task status."
            });
        }

        // Validate priority
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "priority"
            ) &&
            !["Low", "Medium", "High"].includes(updates.priority)
        ) {
            return res.status(400).json({
                message: "Invalid task priority."
            });
        }

        // Validate due date
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "dueDate"
            )
        ) {
            if (updates.dueDate === "" || updates.dueDate === null) {
                updates.dueDate = null;
            } else {
                const parsedDueDate = new Date(updates.dueDate);

                if (Number.isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({
                        message: "Invalid due date."
                    });
                }

                updates.dueDate = parsedDueDate;
            }
        }

        // Ownership condition prevents editing another user's task
        const task = await Task.findOneAndUpdate(
            {
                _id: id,
                user: req.user.id
            },
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        return res.status(200).json(task);

    } catch (error) {
        console.error("Update task error:", error);

        return res.status(400).json({
            message: error.message || "Unable to update task."
        });
    }
});

// DELETE: Delete a task owned by the logged-in user
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }

        const task = await Task.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully."
        });

    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            message: "Unable to delete task."
        });
    }
});

module.exports = router;
