# SkillSwap 🎓

A simple full-stack web application designed for students to exchange skills. Connect with others, list the skills you can teach, and browse what others want to learn!

## 🚀 Features
- **User Authentication**: Simple login and signup flow.
- **Profile Management**: Add or remove skills you want to teach or learn.
- **Browse Students**: Search through a directory of students and see their skillsets.
- **Skill Swap Requests**: Send, accept, or reject requests to swap skills with other students.

## 🛠 Tech Stack
- **Frontend**: React (Create React App), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local or In-Memory via `mongodb-memory-server`)

## 💻 How to Run Locally

To get this project up and running locally on your machine, you need to start both the backend and frontend servers in separate terminals.

### 1. Start the Backend
Open your first terminal window:

```bash
cd backend
npm install
node server.js
```
*Note: The backend automatically spawns an in-memory database if no local MongoDB is detected, so no setup is required!*

### 2. Start the Frontend
Open a second terminal window:

```bash
cd frontend
npm install
npm start
```
*This will automatically open your default web browser to `http://localhost:3000`.*

---
Built as a clean and minimal MVP project.
