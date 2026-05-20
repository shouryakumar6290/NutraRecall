// Dashboard View Controller
const Dashboard = {
  profile: null,
  recalls: [],
  waterIntake: 0, // ml
  todayDateStr: '',

  init: async function() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.todayDateStr = `${year}-${month}-${day}`;

    this.loadWaterState();
    this.setupEventListeners();
    await this.refreshData();
  },

  setupEventListeners: function() {
    // Water tracker button click bindings
    document.querySelectorAll('.water-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount);
        this.addWater(amount);
      });
    });

    // Reset water button
    document.getElementById('reset-water-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.waterIntake = 0;
      this.saveWaterState();
      this.updateWaterUI();
    });
  },

  loadWaterState: function() {
    const key = `nutra_water_${this.todayDateStr}`;
    const stored = localStorage.getItem(key);
    this.waterIntake = stored ? parseInt(stored) : 0;
  },

  saveWaterState: function() {
    const key = `nutra_water_${this.todayDateStr}`;
    localStorage.setItem(key, this.waterIntake.toString());
  },

  addWater: function(amount) {
    this.waterIntake += amount;
    this.saveWaterState();
    this.updateWaterUI();
  },

  // Refresh statistics by fetching DB state
  refreshData: async function() {
    try {
      this.profile = await window.API.getProfile();
      this.recalls = await window.API.getRecalls();

      this.updateNutritionAnalytics();
      this.updateWaterUI();
      this.renderRecentLogs();
    } catch (e) {
      console.error('Error refreshing dashboard data:', e);
    }
  },

  // Update calories ring, macros progress bars and trigger AI insights
  updateNutritionAnalytics: function() {
    // 1. Get today's recalls (filter recalls that match today's date)
    const todayRecalls = this.recalls.filter(r => r.date === this.todayDateStr);
    
    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    // Calculate aggregated nutrient sums
    todayRecalls.forEach(recall => {
      consumedCalories += recall.totals.calories;
      consumedProtein += recall.totals.protein;
      consumedCarbs += recall.totals.carbs;
      consumedFat += recall.totals.fat;
    });

    // 2. Set DOM totals text
    document.getElementById('cal-consumed').textContent = consumedCalories;
    document.getElementById('cal-goal').textContent = this.profile.calorieGoal;
    
    // 3. Update Circular Progress Ring
    const circle = document.getElementById('calorie-circle-bar');
    const radius = 70; // From circle r="70"
    const circumference = 2 * Math.PI * radius; // Approx 440
    
    let percent = consumedCalories / this.profile.calorieGoal;
    if (isNaN(percent)) percent = 0;
    if (percent > 1) percent = 1; // Cap visualization fill at 100%

    const offset = circumference - (percent * circumference);
    circle.style.strokeDashoffset = offset;

    // Calculate percentage display text
    const displayPercent = Math.round((consumedCalories / this.profile.calorieGoal) * 100) || 0;
    document.getElementById('cal-percent').textContent = `${displayPercent}%`;

    // 4. Update macro progress bars
    this.updateProgressBar('carbs', consumedCarbs, this.profile.carbsGoal);
    this.updateProgressBar('protein', consumedProtein, this.profile.proteinGoal);
    this.updateProgressBar('fat', consumedFat, this.profile.fatGoal);

    // 5. Generate and display feedback insights
    this.generateInsights(consumedCalories, consumedProtein, consumedCarbs, consumedFat, todayRecalls);
  },

  updateProgressBar: function(macroId, consumed, goal) {
    document.getElementById(`${macroId}-consumed`).textContent = `${Math.round(consumed)}g`;
    document.getElementById(`${macroId}-goal`).textContent = `${goal}g`;
    
    let percent = (consumed / goal) * 100;
    if (isNaN(percent)) percent = 0;
    if (percent > 100) percent = 100; // Cap visual fill
    
    document.getElementById(`${macroId}-progress-fill`).style.width = `${percent}%`;
  },

  updateWaterUI: function() {
    const goal = this.profile.waterGoal || 2500;
    document.getElementById('water-consumed').textContent = `${this.waterIntake} ml`;
    document.getElementById('water-goal').textContent = `${goal} ml`;

    let percent = (this.waterIntake / goal) * 100;
    if (isNaN(percent)) percent = 0;
    if (percent > 100) percent = 100; // Cap water height

    document.getElementById('water-fluid-element').style.height = `${percent}%`;
  },

  // AI-inspired Insights engine
  generateInsights: function(calories, protein, carbs, fat, recalls) {
    const insightsContainer = document.getElementById('insights-list-container');
    insightsContainer.innerHTML = '';

    const insights = [];

    // Let's analyze calories
    if (calories === 0) {
      insights.push({
        icon: '💡',
        text: 'Your diet recall for today is empty. Navigate to the "Diet Recall" tab to log your meals!'
      });
    } else {
      const calRatio = calories / this.profile.calorieGoal;
      if (calRatio < 0.6) {
        insights.push({
          icon: '⚠️',
          text: `Calorie intake is currently low (${Math.round(calRatio*100)}% of goal). Ensure you are eating enough to sustain energy levels.`
        });
      } else if (calRatio > 1.1) {
        insights.push({
          icon: '🍕',
          text: `You have exceeded your calorie goal for today by ${Math.round((calRatio-1)*100)}%. Monitor portion sizes in your next logs.`
        });
      } else {
        insights.push({
          icon: '✅',
          text: `Great calorie control today! You are at ${Math.round(calRatio*100)}% of your target.`
        });
      }

      // Protein analysis
      const protRatio = protein / this.profile.proteinGoal;
      if (protRatio < 0.5) {
        insights.push({
          icon: '🥩',
          text: `Protein intake is low. Consider incorporating eggs, grilled chicken breast, Greek yogurt, or tofu into your meals.`
        });
      } else if (protRatio >= 0.9) {
        insights.push({
          icon: '💪',
          text: `Awesome protein intake! Getting sufficient protein supports muscle recovery and keeps you feeling full.`
        });
      }

      // Check meal types distribution
      const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
      recalls.forEach(r => {
        r.foods.forEach(f => {
          mealCounts[f.mealType]++;
        });
      });

      if (mealCounts.snack > mealCounts.breakfast + mealCounts.lunch + mealCounts.dinner) {
        insights.push({
          icon: '🍏',
          text: 'Logging high snack frequency. Mindful eating starts with structured meals. Try larger whole-food breakfast/lunches.'
        });
      }
    }

    // Hydration check
    const waterRatio = this.waterIntake / this.profile.waterGoal;
    if (waterRatio < 0.4) {
      insights.push({
        icon: '💧',
        text: 'Your hydration levels are low. Keep a bottle nearby and drink at least 250ml of water every hour.'
      });
    } else if (waterRatio >= 1.0) {
      insights.push({
        icon: '🌊',
        text: 'Exceptional hydration today! Meeting your daily water goal keeps your metabolism active.'
      });
    }

    // Render insights list
    insights.forEach(insight => {
      const el = document.createElement('div');
      el.className = 'insight-item';
      el.innerHTML = `
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-text">${insight.text}</div>
      `;
      insightsContainer.appendChild(el);
    });
  },

  // Render recent recall history logs in the table
  renderRecentLogs: function() {
    const tableBody = document.getElementById('recent-logs-table-body');
    tableBody.innerHTML = '';

    // Filter today's items to show a checklist on the dashboard
    const todayRecalls = this.recalls.filter(r => r.date === this.todayDateStr);
    
    // Collect all foods logged today
    const loggedFoods = [];
    todayRecalls.forEach(recall => {
      recall.foods.forEach(food => {
        loggedFoods.push(food);
      });
    });

    if (loggedFoods.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
            No food items logged for today yet.
          </td>
        </tr>
      `;
      return;
    }

    // Sort by time
    loggedFoods.sort((a, b) => a.time.localeCompare(b.time));

    loggedFoods.forEach(food => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="log-date">${food.time}</td>
        <td>${food.name}</td>
        <td><span class="tag-badge tag-${food.mealType}">${food.mealType}</span></td>
        <td>${food.portion} serving(s)</td>
        <td><strong>${Math.round(food.calories * food.portion)} kcal</strong></td>
      `;
      tableBody.appendChild(tr);
    });
  }
};

window.Dashboard = Dashboard;
