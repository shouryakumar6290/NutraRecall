# 🥗 NutraRecall

### Premium 24-Hour Diet Recall Web Application

*A modern, interactive web application for conducting professional 24-hour dietary assessments with nutrition tracking, hydration monitoring, and smart dietary insights.*

<p align="center">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white">
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white">
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge">
</p>

⭐ **If you like this project, don't forget to star the repository!**

---

## 📖 Overview

**NutraRecall** is a premium **24-Hour Diet Recall** web application that enables users to record, analyze, and monitor their dietary intake through an interactive step-by-step recall interview.

It supports both **Offline** and **Online** modes while tracking calories, macronutrients, hydration, and generating personalized dietary recommendations through a modern Glassmorphism interface.

---

## ✨ Features

- 🎨 Premium Glassmorphism User Interface
- 📝 Interactive 4-Step Recall Wizard
- 🔥 Daily Calorie Tracker
- 🥩 Macronutrient Monitoring
- 💧 Water Intake Tracker
- 📅 Daily Food Journal
- 🍎 Searchable Food Library
- ➕ Custom Food Management
- ⚙️ Personalized Nutrition Goals
- 🧠 Smart Dietary Recommendations
- 💾 Offline Local Storage Support
- 🌐 Online JSON Database Support

---

## 🚀 Getting Started

### 💻 Offline Mode

No installation required.

1. Open the `frontend` folder.
2. Launch `index.html`.
3. NutraRecall automatically switches to **Local Storage Mode**.
4. All features work perfectly without Node.js.

---

### 🌐 Full-Stack Mode

```bash
cd backend
npm install
npm start
```

Open `frontend/index.html`.

The application automatically connects to the Express server and stores data inside:

```text
backend/db.json
```

---

## 📂 Project Structure

```text
diet-recall-app/
├── README.md                  # Project documentation
├── backend/                   # Node.js + Express Backend
│   ├── package.json           # Dependencies & scripts
│   ├── database.js            # JSON database helper
│   ├── db.json                # Persistent JSON database
│   └── server.js              # Express server & REST API
└── frontend/                  # Client-side application
    ├── index.html             # Main application
    ├── css/
    │   ├── style.css          # Global styles & layout
    │   ├── dashboard.css      # Dashboard components
    │   └── recall.css         # Recall wizard styling
    └── js/
        ├── api.js             # API & LocalStorage handler
        ├── app.js             # Main SPA controller
        ├── dashboard.js       # Dashboard logic
        ├── library.js         # Food library management
        └── recall.js          # 24-Hour Recall Wizard
```

---

## 🛠 Tech Stack

| Frontend | Backend | Storage |
|----------|---------|----------|
| HTML5 | Node.js | Local Storage |
| CSS3 | Express.js | JSON Database |
| JavaScript | REST API | db.json |

---

## 🌟 Highlights

✔ Dual Offline & Online Architecture

✔ Privacy-First Design

✔ Interactive Nutrition Dashboard

✔ Calorie & Macronutrient Tracking

✔ Hydration Monitoring

✔ Smart Dietary Insights

✔ Custom Food Library

✔ Responsive Single Page Application

✔ Modern Glassmorphism UI

---

## 👨‍💻 Developed By

**Shourya Kumar**

Made with ❤️ using **HTML, CSS, JavaScript, Node.js & Express.js**

---

<div align="center">

### ⭐ Star this Repository if you found it useful!

**Happy Coding! 🚀**

</div>
