
$(document).ready(function () {
    // 1. Check login token
    const token = sessionStorage.getItem("taskflowToken");

    if (!token) {
        window.location.replace("/login.html");
        return;
    }

    const taskModalElement = document.getElementById("taskModal");

    if (!taskModalElement) {
        console.error("Task modal not found in index.html");
        return;
    }

    const taskModal = new bootstrap.Modal(taskModalElement);

    let tasks = [];
    let sessionExpired = false;

    // 2. Centralized API request with JWT authentication
    async function apiRequest(url, options = {}) {
        const currentToken = sessionStorage.getItem("taskflowToken");

        if (!currentToken) {
            redirectToLogin();
            throw new Error("Please log in to continue.");
        }

        const headers = {
            ...(options.headers || {}),
            Authorization: "Bearer " + currentToken
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            redirectToLogin();
            throw new Error("Your session has expired. Please log in again.");
        }

        return response;
    }

    function redirectToLogin() {
        sessionExpired = true;

        sessionStorage.removeItem("taskflowToken");
        sessionStorage.removeItem("taskflowUser");

        window.location.replace("/login.html");
    }

    async function readResponse(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    // 3. Safely display user-provided text
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    // 4. Load tasks for the authenticated user
    async function loadTasks() {
        try {
            const response = await apiRequest("/api/tasks");

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Failed to load tasks.");
            }

            if (!Array.isArray(data)) {
                throw new Error("Unexpected response from the server.");
            }

            tasks = data;
            renderTasks();

        } catch (error) {
            if (sessionExpired) return;

            console.error("Error loading tasks:", error);

            $("#taskContainer").empty();
            $("#emptyMessage")
                .text(error.message || "Unable to load tasks.")
                .show();
        }
    }

    // 5. Render tasks and dashboard statistics
    function renderTasks() {
        const search = String($("#searchTask").val() || "")
            .toLowerCase()
            .trim();

        const filter = $("#filterStatus").val() || "All";

        const filteredTasks = tasks.filter(function (task) {
            const title = String(task.title || "").toLowerCase();
            const description = String(task.description || "").toLowerCase();

            const matchesSearch =
                title.includes(search) || description.includes(search);

            const matchesStatus =
                filter === "All" || task.status === filter;

            return matchesSearch && matchesStatus;
        });

        $("#totalTasks").text(tasks.length);

        $("#pendingTasks").text(
            tasks.filter(task => task.status === "Pending").length
        );

        $("#progressTasks").text(
            tasks.filter(task => task.status === "In Progress").length
        );

        $("#completedTasks").text(
            tasks.filter(task => task.status === "Completed").length
        );

        if (tasks.length === 0) {
            $("#emptyMessage")
                .text("No tasks yet. Add your first task!")
                .show();
        } else if (filteredTasks.length === 0) {
            $("#emptyMessage")
                .text("No tasks match your search or filter.")
                .show();
        } else {
            $("#emptyMessage").hide();
        }

        $("#taskContainer").html(
            filteredTasks.map(function (task) {
                const safeTitle = escapeHTML(task.title);
                const safeDescription = escapeHTML(task.description);
                const safePriority = escapeHTML(task.priority);
                const safeStatus = escapeHTML(task.status);
                const safeId = escapeHTML(task._id);

                const dueDate = task.dueDate
                    ? String(task.dueDate).slice(0, 10)
                    : "No due date";

                const safeDate = escapeHTML(dueDate);

                const statusClass = String(task.status || "")
                    .replace(/\s+/g, "-");

                return `
                    <article class="task-card">
                        <h5>${safeTitle}</h5>

                        <p class="task-description">
                            ${safeDescription || "No description provided."}
                        </p>

                        <div class="task-meta">
                            <span class="task-badge priority-${safePriority}">
                                ${safePriority} Priority
                            </span>

                            <span class="task-badge status-${statusClass}">
                                ${safeStatus}
                            </span>
                        </div>

                        <p class="small text-secondary">
                            <i class="bi bi-calendar-event"></i>
                            ${safeDate}
                        </p>

                        <div class="task-actions">
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary edit-task"
                                data-id="${safeId}">
                                <i class="bi bi-pencil"></i> Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger delete-task"
                                data-id="${safeId}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </article>
                `;
            }).join("")
        );
    }

    // 6. Reset task form
    function resetForm() {
        $("#taskForm")[0].reset();
        $("#taskId").val("");
        $("#modalTitle").text("Create New Task");
    }

    function getTaskById(id) {
        return tasks.find(task => task._id === id);
    }

    // 7. Open create-task modal
    $("#openTaskForm").on("click", function () {
        resetForm();
        taskModal.show();
    });

    // 8. Create or update a task
    $("#taskForm").on("submit", async function (event) {
        event.preventDefault();

        const title = $("#taskTitle").val().trim();

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const taskId = $("#taskId").val();

        const taskData = {
            title: title,
            description: $("#taskDescription").val().trim(),
            priority: $("#taskPriority").val(),
            status: $("#taskStatus").val(),
            dueDate: $("#taskDueDate").val() || null
        };

        const submitButton = $(this).find('[type="submit"]');
        submitButton.prop("disabled", true);

        try {
            const url = taskId
                ? `/api/tasks/${encodeURIComponent(taskId)}`
                : "/api/tasks";

            const response = await apiRequest(url, {
                method: taskId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            const result = await readResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Unable to save task.");
            }

            await loadTasks();

            if (sessionExpired) return;

            taskModal.hide();
            resetForm();

        } catch (error) {
            if (sessionExpired) return;

            console.error("Error saving task:", error);
            alert(error.message || "Unable to save task.");
        } finally {
            submitButton.prop("disabled", false);
        }
    });

    // 9. Edit task
    $("#taskContainer").on("click", ".edit-task", function () {
        const task = getTaskById($(this).attr("data-id"));

        if (!task) return;

        $("#taskId").val(task._id);
        $("#taskTitle").val(task.title);
        $("#taskDescription").val(task.description || "");
        $("#taskPriority").val(task.priority);
        $("#taskStatus").val(task.status);

        $("#taskDueDate").val(
            task.dueDate ? String(task.dueDate).slice(0, 10) : ""
        );

        $("#modalTitle").text("Edit Task");
        taskModal.show();
    });

    // 10. Delete task
    $("#taskContainer").on("click", ".delete-task", async function () {
        const taskId = $(this).attr("data-id");

        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            const response = await apiRequest(
                `/api/tasks/${encodeURIComponent(taskId)}`,
                { method: "DELETE" }
            );

            const result = await readResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete task.");
            }

            await loadTasks();

        } catch (error) {
            if (sessionExpired) return;

            console.error("Error deleting task:", error);
            alert(error.message || "Unable to delete task.");
        }
    });

    // 11. Search and status filtering
    $("#searchTask, #filterStatus").on("input change", renderTasks);

    // 12. Logout
    $("#logoutButton").on("click", function () {
        sessionStorage.removeItem("taskflowToken");
        sessionStorage.removeItem("taskflowUser");

        window.location.replace("/login.html");
    });

    // 13. Load tasks on dashboard startup
    loadTasks();
});
