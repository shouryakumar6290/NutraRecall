// Diet Recall Wizard Controller
const DietRecallWizard = {
  currentStep: 1,
  totalSteps: 4,
  foodsList: [], // Loaded food catalog
  wizardFoods: [], // Foods being logged in current recall
  forgottenChecked: [], // Commonly forgotten categories checked
  
  // Initialize wizard elements & events
  init: async function() {
    this.setupEventListeners();
    await this.loadFoodCatalog();
    this.resetWizard();
  },

  // Load food catalog from API for autocomplete
  loadFoodCatalog: async function() {
    try {
      this.foodsList = await window.API.getFoods();
    } catch (e) {
      console.error('Failed to load food catalog in recall wizard:', e);
    }
  },

  resetWizard: function() {
    this.currentStep = 1;
    this.wizardFoods = [];
    this.forgottenChecked = [];
    
    // Reset inputs
    document.getElementById('quick-list-input').value = '';
    document.getElementById('recall-notes').value = '';
    
    // Clear list grids
    document.getElementById('food-row-list').innerHTML = '';
    
    // Reset forgotten cards
    document.querySelectorAll('.forgotten-card').forEach(card => {
      card.classList.remove('checked');
    });

    this.updateStepUI();
  },

  setupEventListeners: function() {
    // Navigation buttons
    document.getElementById('recall-next-btn').addEventListener('click', () => this.nextStep());
    document.getElementById('recall-prev-btn').addEventListener('click', () => this.prevStep());
    
    // Step 1: Add suggestion chip clicks
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const textarea = document.getElementById('quick-list-input');
        const val = textarea.value.trim();
        textarea.value = val ? val + '\n' + chip.textContent : chip.textContent;
        textarea.focus();
      });
    });

    // Add manual food row button
    document.getElementById('add-empty-row-btn').addEventListener('click', () => this.addFoodRow());

    // Forgotten food cards click
    document.querySelectorAll('.forgotten-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        card.classList.toggle('checked');
        if (card.classList.contains('checked')) {
          if (!this.forgottenChecked.includes(id)) {
            this.forgottenChecked.push(id);
            // Suggest inserting a row for this forgotten food
            this.handleForgottenFoodPrompt(id, card.querySelector('.forgotten-title').textContent);
          }
        } else {
          this.forgottenChecked = this.forgottenChecked.filter(item => item !== id);
        }
      });
    });
  },

  // Update Stepper Headers and Step Views visibility
  updateStepUI: function() {
    // Update step visibility
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`wizard-step-${i}`);
      if (i === this.currentStep) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }

      // Update header dots
      const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
      if (indicator) {
        if (i === this.currentStep) {
          indicator.classList.add('active');
          indicator.classList.remove('completed');
        } else if (i < this.currentStep) {
          indicator.classList.remove('active');
          indicator.classList.add('completed');
        } else {
          indicator.classList.remove('active', 'completed');
        }
      }
    }

    // Update progress connector line
    const progressFill = document.querySelector('.stepper-progress-fill');
    const percent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    progressFill.style.width = `${percent}%`;

    // Update navigation buttons
    const prevBtn = document.getElementById('recall-prev-btn');
    const nextBtn = document.getElementById('recall-next-btn');

    if (this.currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (this.currentStep === this.totalSteps) {
      nextBtn.textContent = 'Submit Recall';
      nextBtn.className = 'btn btn-primary';
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.className = 'btn btn-secondary';
    }
  },

  nextStep: function() {
    if (this.currentStep === 1) {
      this.processQuickList();
      if (this.wizardFoods.length === 0) {
        alert('Please enter at least one food or beverage you consumed.');
        return;
      }
    } else if (this.currentStep === 2) {
      // Validate that portion sizes and fields are filled
      if (this.wizardFoods.length === 0) {
        alert('Please add at least one food item.');
        return;
      }
    } else if (this.currentStep === 3) {
      this.prepareSummary();
    } else if (this.currentStep === this.totalSteps) {
      this.submitRecall();
      return;
    }

    this.currentStep++;
    this.updateStepUI();
  },

  prevStep: function() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepUI();
    }
  },

  // Step 1 -> Step 2 Processing
  processQuickList: function() {
    const rawText = document.getElementById('quick-list-input').value;
    // Split by lines or commas
    const lines = rawText.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);
    
    // Seed our wizard foods from the list
    if (lines.length > 0) {
      lines.forEach(item => {
        // Check if item is already added to avoid double adding when toggling steps
        const exists = this.wizardFoods.some(wf => wf.rawName.toLowerCase() === item.toLowerCase());
        if (!exists) {
          // Attempt auto-match in foods database!
          const cleanItem = item.toLowerCase();
          const match = this.foodsList.find(f => {
            const cleanFoodName = f.name.toLowerCase();
            return cleanFoodName.includes(cleanItem) || cleanItem.includes(cleanFoodName);
          });
          
          if (match) {
            this.addFoodRow(item, match);
          } else {
            this.addFoodRow(item);
          }
        }
      });
    }
  },

  // Add a details row for editing
  addFoodRow: function(rawName = '', selectedFoodObj = null) {
    const container = document.getElementById('food-row-list');
    const rowId = 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    // Create data object
    const newFoodRow = {
      rowId: rowId,
      rawName: rawName || (selectedFoodObj ? selectedFoodObj.name : ''),
      foodId: selectedFoodObj ? selectedFoodObj.id : null,
      name: selectedFoodObj ? selectedFoodObj.name : rawName,
      mealType: 'breakfast',
      time: '08:00',
      portion: 1.0,
      calories: selectedFoodObj ? selectedFoodObj.calories : 0,
      carbs: selectedFoodObj ? selectedFoodObj.carbs : 0,
      protein: selectedFoodObj ? selectedFoodObj.protein : 0,
      fat: selectedFoodObj ? selectedFoodObj.fat : 0,
      category: selectedFoodObj ? selectedFoodObj.category : 'other'
    };

    // Push to state
    this.wizardFoods.push(newFoodRow);

    // Create DOM card
    const card = document.createElement('div');
    card.className = 'food-row-card';
    card.id = rowId;
    card.innerHTML = `
      <div class="food-row-header">
        <span class="food-row-title">${rawName || 'Custom Food Item'}</span>
        <button type="button" class="remove-food-btn" title="Remove item"><i class="fas fa-trash-alt"></i></button>
      </div>
      <div class="food-fields-grid">
        <div class="form-group search-wrapper">
          <label>Food Item Name</label>
          <input type="text" class="form-input food-name-input" value="${newFoodRow.name}" placeholder="Search or name food...">
          <div class="autocomplete-dropdown"></div>
        </div>
        <div class="form-group">
          <label>Meal</label>
          <select class="form-input food-meal-select">
            <option value="breakfast" ${newFoodRow.mealType === 'breakfast' ? 'selected' : ''}>Breakfast</option>
            <option value="lunch" ${newFoodRow.mealType === 'lunch' ? 'selected' : ''}>Lunch</option>
            <option value="dinner" ${newFoodRow.mealType === 'dinner' ? 'selected' : ''}>Dinner</option>
            <option value="snack" ${newFoodRow.mealType === 'snack' ? 'selected' : ''}>Snack</option>
          </select>
        </div>
        <div class="form-group">
          <label>Time</label>
          <input type="time" class="form-input food-time-input" value="${newFoodRow.time}">
        </div>
        <div class="form-group">
          <label>Portion (Servings)</label>
          <input type="number" step="0.25" min="0.1" class="form-input food-portion-input" value="${newFoodRow.portion}">
        </div>
      </div>
      <div class="nutrient-inputs-row" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04);">
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:11px; color:var(--text-secondary);">Calories (kcal)</label>
          <input type="number" class="form-input food-calories-input" value="${newFoodRow.calories}" style="padding: 6px 10px;">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:11px; color:var(--text-secondary);">Carbs (g)</label>
          <input type="number" class="form-input food-carbs-input" value="${newFoodRow.carbs}" style="padding: 6px 10px;">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:11px; color:var(--text-secondary);">Protein (g)</label>
          <input type="number" class="form-input food-protein-input" value="${newFoodRow.protein}" style="padding: 6px 10px;">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:11px; color:var(--text-secondary);">Fat (g)</label>
          <input type="number" class="form-input food-fat-input" value="${newFoodRow.fat}" style="padding: 6px 10px;">
        </div>
      </div>
    `;

    container.appendChild(card);
    this.bindRowEvents(card, rowId);
  },

  // Bind key events to dynamically typed rows
  bindRowEvents: function(cardEl, rowId) {
    const nameInput = cardEl.querySelector('.food-name-input');
    const mealSelect = cardEl.querySelector('.food-meal-select');
    const timeInput = cardEl.querySelector('.food-time-input');
    const portionInput = cardEl.querySelector('.food-portion-input');
    const removeBtn = cardEl.querySelector('.remove-food-btn');
    const dropdown = cardEl.querySelector('.autocomplete-dropdown');

    const caloriesInput = cardEl.querySelector('.food-calories-input');
    const carbsInput = cardEl.querySelector('.food-carbs-input');
    const proteinInput = cardEl.querySelector('.food-protein-input');
    const fatInput = cardEl.querySelector('.food-fat-input');

    // Update state on inputs change
    mealSelect.addEventListener('change', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].mealType = e.target.value;
    });

    timeInput.addEventListener('change', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].time = e.target.value;
    });

    portionInput.addEventListener('input', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) {
        this.wizardFoods[idx].portion = parseFloat(e.target.value) || 1.0;
      }
    });

    caloriesInput.addEventListener('input', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].calories = parseFloat(e.target.value) || 0;
    });

    carbsInput.addEventListener('input', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].carbs = parseFloat(e.target.value) || 0;
    });

    proteinInput.addEventListener('input', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].protein = parseFloat(e.target.value) || 0;
    });

    fatInput.addEventListener('input', (e) => {
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) this.wizardFoods[idx].fat = parseFloat(e.target.value) || 0;
    });

    removeBtn.addEventListener('click', () => {
      this.wizardFoods = this.wizardFoods.filter(f => f.rowId !== rowId);
      cardEl.style.transform = 'scale(0.9)';
      cardEl.style.opacity = '0';
      setTimeout(() => cardEl.remove(), 200);
    });

    // Autocomplete logic
    nameInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const idx = this.wizardFoods.findIndex(f => f.rowId === rowId);
      if (idx !== -1) {
        this.wizardFoods[idx].name = e.target.value;
        cardEl.querySelector('.food-row-title').textContent = e.target.value || 'Custom Food Item';
      }

      if (!query) {
        dropdown.style.display = 'none';
        return;
      }

      const matches = this.foodsList.filter(food => food.name.toLowerCase().includes(query)).slice(0, 5);
      
      if (matches.length > 0) {
        dropdown.innerHTML = '<div class="autocomplete-header">Matching Foods Database</div>';
        matches.forEach(food => {
          const itemEl = document.createElement('div');
          itemEl.className = 'autocomplete-item';
          itemEl.textContent = `${food.name} (${food.calories} kcal)`;
          itemEl.addEventListener('click', () => {
            nameInput.value = food.name;
            dropdown.style.display = 'none';
            cardEl.querySelector('.food-row-title').textContent = food.name;
            
            // Update state
            const targetIdx = this.wizardFoods.findIndex(f => f.rowId === rowId);
            if (targetIdx !== -1) {
              this.wizardFoods[targetIdx].foodId = food.id;
              this.wizardFoods[targetIdx].name = food.name;
              this.wizardFoods[targetIdx].calories = food.calories;
              this.wizardFoods[targetIdx].carbs = food.carbs;
              this.wizardFoods[targetIdx].protein = food.protein;
              this.wizardFoods[targetIdx].fat = food.fat;
              this.wizardFoods[targetIdx].category = food.category;
            }

            // Sync visual fields
            caloriesInput.value = food.calories;
            carbsInput.value = food.carbs;
            proteinInput.value = food.protein;
            fatInput.value = food.fat;
          });
          dropdown.appendChild(itemEl);
        });
        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!cardEl.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  },

  // Insert row if checking forgotten food
  handleForgottenFoodPrompt: function(id, label) {
    // Determine default suggestions for forgotten foods
    let foodObj = null;
    if (id === 'water') {
      foodObj = { id: 'custom_water', name: 'Water (8 oz glass)', calories: 0, carbs: 0, protein: 0, fat: 0, category: 'beverages' };
    } else if (id === 'coffee') {
      foodObj = this.foodsList.find(f => f.id === 'f15') || { id: 'f15', name: 'Coffee (Black, 1 cup)', calories: 2, carbs: 0, protein: 0.2, fat: 0, category: 'beverages' };
    }
    
    // Automatically append a row for the forgotten food item
    this.addFoodRow(label, foodObj);
  },

  // Calculate nutrients totals for confirmation page
  prepareSummary: function() {
    let totCal = 0, totCarb = 0, totProt = 0, totFat = 0;
    
    const summaryList = document.getElementById('summary-food-items');
    summaryList.innerHTML = '';

    this.wizardFoods.forEach(food => {
      const mult = food.portion;
      const cal = Math.round(food.calories * mult);
      const carb = Math.round(food.carbs * mult * 10) / 10;
      const prot = Math.round(food.protein * mult * 10) / 10;
      const fat = Math.round(food.fat * mult * 10) / 10;

      totCal += cal;
      totCarb += carb;
      totProt += prot;
      totFat += fat;

      const itemEl = document.createElement('div');
      itemEl.className = 'summary-food-item';
      itemEl.innerHTML = `
        <span class="summary-food-name">${food.name} <strong class="tag-badge tag-${food.mealType}">${food.mealType}</strong></span>
        <span class="summary-food-details">${food.portion} serving(s) • ${cal} kcal</span>
      `;
      summaryList.appendChild(itemEl);
    });

    // Write totals
    document.getElementById('sum-calories').textContent = totCal;
    document.getElementById('sum-protein').textContent = Math.round(totProt) + 'g';
    document.getElementById('sum-carbs').textContent = Math.round(totCarb) + 'g';
    document.getElementById('sum-fat').textContent = Math.round(totFat) + 'g';

    // Save final calculated totals in object
    this.totals = {
      calories: totCal,
      protein: Math.round(totProt),
      carbs: Math.round(totCarb),
      fat: Math.round(totFat)
    };
  },

  submitRecall: async function() {
    const notes = document.getElementById('recall-notes').value;
    
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    const recallPayload = {
      date: localDateStr,
      foods: this.wizardFoods.map(f => ({
        foodId: f.foodId,
        name: f.name,
        mealType: f.mealType,
        time: f.time,
        portion: f.portion,
        calories: f.calories,
        carbs: f.carbs,
        protein: f.protein,
        fat: f.fat,
        category: f.category
      })),
      forgottenChecked: this.forgottenChecked,
      totals: this.totals,
      notes: notes
    };

    try {
      document.getElementById('recall-next-btn').disabled = true;
      document.getElementById('recall-next-btn').textContent = 'Saving...';
      
      await window.API.addRecall(recallPayload);
      
      alert('24-Hour Diet Recall saved successfully!');
      
      // Reset state and switch to Dashboard view
      this.resetWizard();
      document.getElementById('recall-next-btn').disabled = false;
      
      // Trigger navigation back to dashboard
      document.querySelector('.nav-item[data-view="dashboard"]').click();
      
    } catch (e) {
      alert('Error saving recall: ' + e.message);
      document.getElementById('recall-next-btn').disabled = false;
      document.getElementById('recall-next-btn').textContent = 'Submit Recall';
    }
  }
};

window.DietRecallWizard = DietRecallWizard;
