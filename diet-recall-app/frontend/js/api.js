const API_BASE_URL = 'http://localhost:5000/api';

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Default values for initial local state
const DEFAULT_LOCAL_FOODS = [
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

const DEFAULT_LOCAL_PROFILE = {
  name: 'Health Enthusiast',
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 220,
  fatGoal: 65,
  waterGoal: 2500
};

// Check if LocalStorage is empty, and seed it if needed
if (!localStorage.getItem('nutra_foods')) {
  localStorage.setItem('nutra_foods', JSON.stringify(DEFAULT_LOCAL_FOODS));
}
if (!localStorage.getItem('nutra_recalls')) {
  localStorage.setItem('nutra_recalls', JSON.stringify([]));
}
if (!localStorage.getItem('nutra_profile')) {
  localStorage.setItem('nutra_profile', JSON.stringify(DEFAULT_LOCAL_PROFILE));
}

// Global variable representing backend connection state
let isBackendConnected = false;

// Function to check backend connection status
async function checkBackendConnection() {
  try {
    const response = await fetch(API_BASE_URL.replace('/api', '/'), { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(1500) // Timeout after 1.5s
    });
    if (response.ok) {
      isBackendConnected = true;
      return true;
    }
  } catch (e) {
    // Fail silently, fallback activates
  }
  isBackendConnected = false;
  return false;
}

// Local Storage Fallback Mock Database Methods
const localDb = {
  getFoods: () => JSON.parse(localStorage.getItem('nutra_foods')),
  addFood: (food) => {
    const foods = JSON.parse(localStorage.getItem('nutra_foods'));
    const newFood = { id: 'local_' + Date.now(), ...food, servings: 1 };
    foods.push(newFood);
    localStorage.setItem('nutra_foods', JSON.stringify(foods));
    return newFood;
  },
  getRecalls: () => JSON.parse(localStorage.getItem('nutra_recalls')),
  addRecall: (recall) => {
    const recalls = JSON.parse(localStorage.getItem('nutra_recalls'));
    const newRecall = {
      id: 'local_recall_' + Date.now(),
      date: getLocalDateString(),
      createdAt: new Date().toISOString(),
      ...recall
    };
    recalls.push(newRecall);
    localStorage.setItem('nutra_recalls', JSON.stringify(recalls));
    return newRecall;
  },
  getProfile: () => JSON.parse(localStorage.getItem('nutra_profile')),
  saveProfile: (profile) => {
    localStorage.setItem('nutra_profile', JSON.stringify(profile));
    return profile;
  }
};

// Unified API client that switches between online (Express backend) and offline (localStorage)
const API = {
  // Connection status getter
  isConnected: () => isBackendConnected,
  
  // Verify backend connectivity
  initializeConnection: async (callback) => {
    await checkBackendConnection();
    if (callback) callback(isBackendConnected);
  },

  // Foods
  getFoods: async () => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/foods`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.getFoods();
  },

  addFood: async (food) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/foods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(food)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.addFood(food);
  },

  // Recalls
  getRecalls: async () => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/recalls`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.getRecalls();
  },

  addRecall: async (recall) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/recalls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recall)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.addRecall(recall);
  },

  // Profile
  getProfile: async () => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.getProfile();
  },

  saveProfile: async (profile) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('API error, falling back to local DB', e);
      }
    }
    return localDb.saveProfile(profile);
  }
};

window.API = API;
