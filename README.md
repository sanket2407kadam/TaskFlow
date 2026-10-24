# 🚀 TaskFlow — Task Management System

A modern, responsive task management web application designed to help users organize their daily tasks, manage priorities, and track progress efficiently.

🔗 **Live Demo:** https://taskflow-mx7s.onrender.com

💻 **GitHub Repository:** https://github.com/sanket2407kadam/TaskFlow

---

## ✨ Features

- 🔐 **User Authentication** — Secure registration and login.
- 🔑 **JWT Authentication** — Token-based authentication for protected routes.
- 📋 **Task Management** — Create, view, update, and delete tasks.
- 🎯 **Priority Management** — Organize tasks by Low, Medium, and High priority.
- 📊 **Task Tracking** — Track Pending, In Progress, and Completed tasks.
- 👤 **Profile Management** — View and update personal profile information.
- 🗄️ **Database Integration** — Store user and task information in MongoDB.
- 🌙 **Modern Dark UI** — Attractive dashboard with a dark theme and colorful accents.
- 📱 **Responsive Design** — Designed to work across desktop and mobile screens.

---

## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript
- Bootstrap
- Tailwind CSS
- Bootstrap Icons

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Authentication & Security**
- JSON Web Token (JWT)
- bcryptjs

**Tools & Deployment**
- Git and GitHub
- Postman
- MongoDB Compass
- Render

---

## 📂 Project Structure

```text
TaskFlow/
├── config/
│   └── db.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── public/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── profile.html
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sanket2407kadam/TaskFlow.git
```

### 2. Navigate to the Project Folder

```bash
cd TaskFlow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_secure_secret_key
```

Replace the example JWT secret with a strong, private secret. Configure `MONGODB_URI` for your local MongoDB instance or your hosted database.

**Important:** Never upload your actual `.env` file or JWT secret to GitHub.

### 5. Start the Application

For development:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

### 6. Open in Your Browser

```text
http://localhost:3000
```

Make sure MongoDB is running and your environment variables are configured correctly.

---

## 🔒 Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected task API routes.
- User-specific task access.
- Environment variables for sensitive configuration.

---

## 🌐 Live Application

Try TaskFlow here:

👉 https://taskflow-mx7s.onrender.com

If the hosted application takes a little time to respond, the hosting service may be starting the application after a period of inactivity.

---

## 👨‍💻 Developer

**Sanket Kadam**

- GitHub: https://github.com/sanket2407kadam
- LinkedIn: https://linkedin.com/in/sanket-kadam2004

---

## 🎯 Project Goal

TaskFlow was built to gain practical experience in full-stack web development, REST API development, authentication, database integration, CRUD operations, and deployment.

**Built with 💙 and a passion for learning and building real-world applications.**

⭐ If you find this project useful, consider giving the repository a star!
