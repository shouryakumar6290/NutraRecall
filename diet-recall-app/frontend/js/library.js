// Food Library Controller
const FoodLibrary = {
  foods: [],

  init: async function() {
    this.setupEventListeners();
    await this.refreshLibrary();
  },

  setupEventListeners: function() {
    // Search input
    document.getElementById('library-search-input').addEventListener('input', (e) => {
      this.filterLibrary(e.target.value);
    });

    // Form submission for adding custom foods
    document.getElementById('add-food-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  },

  refreshLibrary: async function() {
    try {
      this.foods = await window.API.getFoods();
      this.renderLibraryList(this.foods);
    } catch (e) {
      console.error('Error refreshing library:', e);
    }
  },

  renderLibraryList: function(list) {
    const container = document.getElementById('library-list-container');
    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-search"></i>
          <p>No food items found matching your query.</p>
        </div>
      `;
      return;
    }

    list.forEach(food => {
      const card = document.createElement('div');
      card.className = 'glass-panel widget-card';
      card.style.padding = '18px';
      card.style.gap = '10px';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span style="font-weight:600; font-size:15px; color:white; line-height:1.3;">${food.name}</span>
          <span class="tag-badge tag-${food.category || 'snack'}" style="margin:0;">${food.category || 'other'}</span>
        </div>
        <div style="font-size: 20px; font-weight:700; color:var(--primary); margin: 6px 0 2px 0;">
          ${food.calories} <span style="font-size:11px; color:var(--text-secondary); font-weight:400; text-transform:uppercase;">kcal</span>
        </div>
        <div style="display:flex; gap:12px; font-size:11px; color:var(--text-secondary); border-top:1px solid rgba(255, 255, 255, 0.03); padding-top:10px;">
          <div>P: <strong>${food.protein}g</strong></div>
          <div>C: <strong>${food.carbs}g</strong></div>
          <div>F: <strong>${food.fat}g</strong></div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  filterLibrary: function(query) {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      this.renderLibraryList(this.foods);
      return;
    }

    const filtered = this.foods.filter(food => 
      food.name.toLowerCase().includes(cleanQuery) || 
      (food.category && food.category.toLowerCase().includes(cleanQuery))
    );
    this.renderLibraryList(filtered);
  },

  handleFormSubmit: async function() {
    const name = document.getElementById('lib-food-name').value.trim();
    const calories = parseFloat(document.getElementById('lib-food-calories').value);
    const protein = parseFloat(document.getElementById('lib-food-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('lib-food-carbs').value) || 0;
    const fat = parseFloat(document.getElementById('lib-food-fat').value) || 0;
    const category = document.getElementById('lib-food-category').value;

    if (!name || isNaN(calories)) {
      alert('Please fill out the food name and calorie value.');
      return;
    }

    const payload = {
      name,
      calories,
      protein,
      carbs,
      fat,
      category
    };

    try {
      await window.API.addFood(payload);
      alert('Food item added to database successfully!');
      
      // Reset Form
      document.getElementById('add-food-form').reset();
      
      // Refresh list
      await this.refreshLibrary();
      
      // Re-initialize lists in recall wizard since database changed
      if (window.DietRecallWizard) {
        await window.DietRecallWizard.loadFoodCatalog();
      }
    } catch (e) {
      alert('Failed to add custom food: ' + e.message);
    }
  }
};

window.FoodLibrary = FoodLibrary;
