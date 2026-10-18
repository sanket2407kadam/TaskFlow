
$(document).ready(function () {
    const taskModal = new bootstrap.Modal(
        document.getElementById("taskModal")
    );

    let tasks = [];

    try {
        const savedTasks = JSON.parse(
            localStorage.getItem("taskflow-demo-tasks") || "[]"
        );

        tasks = Array.isArray(savedTasks) ? savedTasks : [];
    } catch {
        tasks = [];
    }

    function saveTasks() {
        localStorage.setItem(
            "taskflow-demo-tasks",
            JSON.stringify(tasks)
        );
    }

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

    function renderTasks() {
        const search = $("#searchTask").val().toLowerCase().trim();
        const filter = $("#filterStatus").val();

        const filteredTasks = tasks.filter(function (task) {
            const matchesSearch =
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search);

            const matchesStatus =
                filter === "All" || task.status === filter;

            return matchesSearch && matchesStatus;
        });

        $("#totalTasks").text(tasks.length);
        $("#pendingTasks").text(
            tasks.filter(t => t.status === "Pending").length
        );
        $("#progressTasks").text(
            tasks.filter(t => t.status === "In Progress").length
        );
        $("#completedTasks").text(
            tasks.filter(t => t.status === "Completed").length
        );

        $("#emptyMessage").toggle(filteredTasks.length === 0);

        if (tasks.length === 0) {
            $("#emptyMessage").text("No tasks yet. Add your first task!");
        } else if (filteredTasks.length === 0) {
            $("#emptyMessage").text("No tasks match your search or filter.");
        }

        $("#taskContainer").html(
            filteredTasks.map(function (task) {
                const safeTitle = escapeHTML(task.title);
                const safeDescription = escapeHTML(task.description);
                const safePriority = escapeHTML(task.priority);
                const safeStatus = escapeHTML(task.status);
                const safeDate = escapeHTML(task.dueDate || "No due date");

                const statusClass = task.status.replace(/\s+/g, "-");

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
                            <button class="btn btn-sm btn-outline-primary edit-task"
                                data-id="${task.id}">
                                <i class="bi bi-pencil"></i> Edit
                            </button>

                            <button class="btn btn-sm btn-outline-danger delete-task"
                                data-id="${task.id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </article>
                `;
            }).join("")
        );
    }

    function resetForm() {
        $("#taskForm")[0].reset();
        $("#taskId").val("");
        $("#modalTitle").text("Create New Task");
    }

    $("#openTaskForm").on("click", function () {
        resetForm();
        taskModal.show();
    });

    $("#taskForm").on("submit", function (event) {
        event.preventDefault();

        const title = $("#taskTitle").val().trim();

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const taskId = $("#taskId").val();

        const taskData = {
            id: taskId || (
                window.crypto && crypto.randomUUID
                    ? crypto.randomUUID()
                    : Date.now().toString()
            ),
            title: title,
            description: $("#taskDescription").val().trim(),
            priority: $("#taskPriority").val(),
            status: $("#taskStatus").val(),
            dueDate: $("#taskDueDate").val()
        };

        if (taskId) {
            tasks = tasks.map(function (task) {
                return task.id === taskId ? taskData : task;
            });
        } else {
            tasks.unshift(taskData);
        }

        saveTasks();
        renderTasks();
        taskModal.hide();
        resetForm();
    });

    $("#taskContainer").on("click", ".edit-task", function () {
        const task = tasks.find(
            t => t.id === $(this).attr("data-id")
        );

        if (!task) return;

        $("#taskId").val(task.id);
        $("#taskTitle").val(task.title);
        $("#taskDescription").val(task.description);
        $("#taskPriority").val(task.priority);
        $("#taskStatus").val(task.status);
        $("#taskDueDate").val(task.dueDate);

        $("#modalTitle").text("Edit Task");
        taskModal.show();
    });

    $("#taskContainer").on("click", ".delete-task", function () {
        const taskId = $(this).attr("data-id");

        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        tasks = tasks.filter(task => task.id !== taskId);

        saveTasks();
        renderTasks();
    });

    $("#searchTask, #filterStatus").on("input change", renderTasks);

    renderTasks();
});
