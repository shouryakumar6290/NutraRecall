NutraRecall - 24-Hour Diet Recall Web Application
NutraRecall is a visually premium, feature-rich 24-Hour Diet Recall web application. It guides users through an interactive, formal step-by-step dietary assessment interview, tracks daily calorie and macronutrient targets, logs water intake, manages a searchable food database catalog, and uses a feedback system to provide dietary tips.

🚀 Getting Started
NutraRecall is designed with a dual-mode system (smart connectivity fallback). This means it runs perfectly even if you don't have Node.js/npm installed on your machine!

Mode A: Zero-Installation Client Mode (Offline DB)
Navigate into the frontend/ folder.
Double-click index.html to open the application directly in any browser.
The app will detect the server is offline and automatically activate Local Storage Fallback Mode.
All features (Wizard, Dashboard tracking, custom food creations, water tracking, and historical logs) will work immediately, saving data inside your browser's local memory.
Mode B: Connected Full-Stack Mode (Online JSON DB)
If you have Node.js installed and want to run it as a full-stack client-server app:

Open a terminal, and change directory to backend/:
cd backend
Install dependencies:
npm install
Start the Express server:
npm start
The server will launch on port 5000.
Open index.html in your browser. The connection badge in the sidebar footer will light up green: "Connected to DB".
Data will now automatically sync to the backend API and persist inside backend/db.json.
📂 Project Architecture
diet-recall-app/
├── README.md                  # This documentation guide
├── backend/                   # Node.js + Express API Backend
│   ├── package.json           # Server dependencies & scripts
│   ├── database.js            # Light JSON-file DB CRUD helper
│   ├── db.json                # Generated JSON database file
│   └── server.js              # Express app hosting REST API routes
└── frontend/                  # Premium Client Interface
    ├── index.html             # Main Single-Page HTML shell
    ├── css/
    │   ├── style.css          # Design variables, layouts, and animations
    │   ├── dashboard.css      # Progress rings, macro bars, and water widgets
    │   └── recall.css         # Multi-step recall wizard forms and lists
    └── js/
        ├── api.js             # API Client Router with LocalStorage fallback logic
        ├── app.js             # Main SPA Controller, Nav router, Profile, History
        ├── dashboard.js       # SVG progress circle, water state, log aggregators
        ├── library.js         # Food library catalog display and additions
        └── recall.js          # Stepper wizard logic, quick-list parse, forgotten items
🛠️ Features Implemented
Stunning Glassmorphism Design: Custom dark-themed layout built using pure Vanilla CSS. Includes modern typography, visual depth shadows, neon brand gradients, and active UI glow effects.
Interactive 24-Hour Recall Wizard:
Step 1 (Quick List): Enter general food logs. Split by lines/commas and auto-build details fields.
Step 2 (Details Probe): Refine entries. Edit meal category, serving sizes, and meal times. Search foods from the autocomplete list.
Step 3 (Forgotten Foods Probe): Multi-selection checklist to add commonly forgotten items (water, late-night snacks, condiments, alcohol).
Step 4 (Summary Review): Displays aggregated totals before saving.
Interactive Dashboard:
Calorie Tracker: Dynamic circular SVG progress ring updating consumed vs target calories.
Macronutrients: Segmented progress tracks matching Carbs, Protein, and Fats.
Hydration Tracker: Animating SVG water glass reflecting logged amounts.
Daily Journal table: Automatically displays today's logs chronologically.
Smart Dietary Tips: Dynamically analyzes today's logs and provides tailored health advice (e.g., protein increases, calorie warnings, or dehydration alerts).
Food Catalog Library: Search the database of standard ingredients or register custom food items.
Goal Target Customization: Dynamically update daily target calories, water, and macro limits on the Settings page.
