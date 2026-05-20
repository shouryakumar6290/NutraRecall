const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const DEFAULT_FOODS = [
  { id: 'f1', name: 'Oats (1 cup, cooked)', calories: 150, carbs: 27, protein: 6, fat: 2.5, category: 'grains', servings: 1 },
  { id: 'f2', name: 'Eggs (2 large, boiled)', calories: 140, carbs: 1, protein: 12, fat: 10, category: 'protein', servings: 1 },
  { id: 'f3', name: 'Apple (1 medium)', calories: 95, carbs: 25, protein: 0.5, fat: 0.3, category: 'fruits', servings: 1 },
  { id: 'f4', name: 'Chicken Breast (150g, grilled)', calories: 250, carbs: 0, protein: 46, fat: 5, category: 'protein', servings: 1 },
  { id: 'f5', name: 'Brown Rice (1 cup, cooked)', calories: 215, carbs: 45, protein: 5, fat: 1.8, category: 'grains', servings: 1 },
  { id: 'f6', name: 'Salmon (150g, baked)', calories: 300, carbs: 0, protein: 34, fat: 18, category: 'protein', servings: 1 },
  { id: 'f7', name: 'Banana (1 medium)', calories: 105, carbs: 27, protein: 1.3, fat: 0.4, category: 'fruits', servings: 1 },
  { id: 'f8', name: 'Whole Milk (1 cup)', calories: 150, carbs: 12, protein: 8, fat: 8, category: 'dairy', servings: 1 },
  { id: 'f9', name: 'Greek Yogurt (1 cup)', calories: 130, carbs: 6, protein: 15, fat: 4, category: 'dairy', servings: 1 },
  { id: 'f10', name: 'Almonds (1 oz / 28g)', calories: 164, carbs: 6, protein: 6, fat: 14, category: 'fats', servings: 1 },
  { id: 'f11', name: 'Mixed Salad (1 bowl)', calories: 30, carbs: 6, protein: 1, fat: 0.2, category: 'vegetables', servings: 1 },
  { id: 'f12', name: 'Olive Oil (1 tbsp)', calories: 119, carbs: 0, protein: 0, fat: 13.5, category: 'fats', servings: 1 },
  { id: 'f13', name: 'White Bread (2 slices)', calories: 150, carbs: 28, protein: 4, fat: 1.5, category: 'grains', servings: 1 },
  { id: 'f14', name: 'Avocado (1/2 medium)', calories: 160, carbs: 8.5, protein: 2, fat: 15, category: 'fats', servings: 1 },
  { id: 'f15', name: 'Coffee (Black, 1 cup)', calories: 2, carbs: 0, protein: 0.2, fat: 0, category: 'beverages', servings: 1 },
  { id: 'f16', name: 'Green Tea (1 cup)', calories: 2, carbs: 0, protein: 0.2, fat: 0, category: 'beverages', servings: 1 },
  { id: 'f17', name: 'Orange Juice (1 cup)', calories: 110, carbs: 26, protein: 2, fat: 0.5, category: 'beverages', servings: 1 },
  { id: 'f18', name: 'Whey Protein (1 scoop)', calories: 120, carbs: 3, protein: 24, fat: 1.5, category: 'protein', servings: 1 },
  { id: 'f19', name: 'Peanut Butter (1 tbsp)', calories: 94, carbs: 3, protein: 4, fat: 8, category: 'fats', servings: 1 },
  { id: 'f20', name: 'Sweet Potato (1 medium, baked)', calories: 100, carbs: 23, protein: 2, fat: 0.2, category: 'vegetables', servings: 1 }
];

const DEFAULT_PROFILE = {
  name: 'User',
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 220,
  fatGoal: 65,
  waterGoal: 2500 // ml
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb = {
        foods: DEFAULT_FOODS,
        recalls: [],
        profile: DEFAULT_PROFILE
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, resetting to default:', err);
    return { foods: DEFAULT_FOODS, recalls: [], profile: DEFAULT_PROFILE };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}

module.exports = {
  getFoods: () => {
    const db = readDb();
    return db.foods;
  },
  addFood: (food) => {
    const db = readDb();
    const newFood = {
      id: 'custom_' + Date.now(),
      ...food,
      servings: 1
    };
    db.foods.push(newFood);
    writeDb(db);
    return newFood;
  },
  getRecalls: () => {
    const db = readDb();
    return db.recalls;
  },
  addRecall: (recall) => {
    const db = readDb();
    const newRecall = {
      id: 'recall_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...recall
    };
    db.recalls.push(newRecall);
    writeDb(db);
    return newRecall;
  },
  getProfile: () => {
    const db = readDb();
    return db.profile || DEFAULT_PROFILE;
  },
  saveProfile: (profile) => {
    const db = readDb();
    db.profile = { ...db.profile, ...profile };
    writeDb(db);
    return db.profile;
  }
};
