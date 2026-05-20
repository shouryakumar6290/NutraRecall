const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serving a basic backend status page
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'NutraRecall Backend API is running',
    version: '1.0.0'
  });
});

// GET /api/foods - Get food list
app.get('/api/foods', (req, res) => {
  try {
    const foods = db.getFoods();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve foods database' });
  }
});

// POST /api/foods - Add custom food
app.post('/api/foods', (req, res) => {
  try {
    const { name, calories, carbs, protein, fat, category } = req.body;
    if (!name || calories === undefined || carbs === undefined || protein === undefined || fat === undefined) {
      return res.status(400).json({ error: 'Missing required food fields' });
    }
    const newFood = db.addFood({
      name,
      calories: Number(calories),
      carbs: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
      category: category || 'other'
    });
    res.status(201).json(newFood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add custom food' });
  }
});

// GET /api/recalls - Get all diet recalls
app.get('/api/recalls', (req, res) => {
  try {
    const recalls = db.getRecalls();
    res.json(recalls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recall logs' });
  }
});

// POST /api/recalls - Save a diet recall
app.post('/api/recalls', (req, res) => {
  try {
    const { foods, forgottenChecked, totals, notes, date } = req.body;
    if (!foods || !Array.isArray(foods)) {
      return res.status(400).json({ error: 'Invalid or missing foods array' });
    }
    const newRecall = db.addRecall({
      foods,
      forgottenChecked: forgottenChecked || [],
      totals: totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      notes: notes || '',
      date: date || new Date().toISOString().split('T')[0]
    });
    res.status(201).json(newRecall);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save diet recall' });
  }
});

// GET /api/profile - Get profile goals
app.get('/api/profile', (req, res) => {
  try {
    const profile = db.getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST /api/profile - Save profile goals
app.post('/api/profile', (req, res) => {
  try {
    const { name, calorieGoal, proteinGoal, carbsGoal, fatGoal, waterGoal } = req.body;
    const updated = db.saveProfile({
      name: name || 'User',
      calorieGoal: Number(calorieGoal) || 2000,
      proteinGoal: Number(proteinGoal) || 120,
      carbsGoal: Number(carbsGoal) || 220,
      fatGoal: Number(fatGoal) || 65,
      waterGoal: Number(waterGoal) || 2500
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
