// Main Application Orchestrator
const App = {
  activeView: 'dashboard',
  profile: null,
  recalls: [],

  init: async function() {
    this.setupNavigation();
    this.setupProfileForm();
    await this.checkConnection();
    
    // Initialize child views
    if (window.Dashboard) await window.Dashboard.init();
    if (window.DietRecallWizard) await window.DietRecallWizard.init();
    if (window.FoodLibrary) await window.FoodLibrary.init();
    
    // Initial data load for global profile/history
    await this.loadGlobalData();
  },

  // Connection check with visual state update
  checkConnection: async function() {
    const badge = document.getElementById('connection-status-badge');
    const badgeText = document.getElementById('connection-status-text');
    
    badgeText.textContent = 'Testing Connection...';
    
    await window.API.initializeConnection((connected) => {
      if (connected) {
        badge.className = 'connection-badge connected';
        badgeText.textContent = 'Connected to DB';
        console.log('Successfully connected to Express SQLite database.');
      } else {
        badge.className = 'connection-badge local';
        badgeText.textContent = 'Local Mode (Offline DB)';
        console.warn('Express server offline. Switched to Local Storage Database.');
      }
    });
  },

  // Handle Tab Switcher
  setupNavigation: function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.dataset.view;
        
        // Update active class in sidebar menu
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Switch visible view in content
        document.querySelectorAll('.app-view').forEach(view => {
          view.classList.remove('active');
        });
        
        const activeViewEl = document.getElementById(`view-${targetView}`);
        if (activeViewEl) {
          activeViewEl.classList.add('active');
        }

        this.activeView = targetView;
        this.onViewChange(targetView);
      });
    });
  },

  // Fetch updates when user navigates
  onViewChange: async function(viewId) {
    if (viewId === 'dashboard') {
      if (window.Dashboard) await window.Dashboard.refreshData();
    } else if (viewId === 'history') {
      await this.renderHistory();
    } else if (viewId === 'library') {
      if (window.FoodLibrary) await window.FoodLibrary.refreshLibrary();
    } else if (viewId === 'profile') {
      await this.loadProfileSettings();
    }
  },

  loadGlobalData: async function() {
    try {
      this.profile = await window.API.getProfile();
      this.recalls = await window.API.getRecalls();
    } catch (e) {
      console.error('Failed to load global profile or recalls:', e);
    }
  },

  // 1. Profile Page Handling
  setupProfileForm: function() {
    const form = document.getElementById('profile-settings-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('prof-name').value.trim() || 'User',
        calorieGoal: parseInt(document.getElementById('prof-calories').value) || 2000,
        proteinGoal: parseInt(document.getElementById('prof-protein').value) || 120,
        carbsGoal: parseInt(document.getElementById('prof-carbs').value) || 220,
        fatGoal: parseInt(document.getElementById('prof-fat').value) || 65,
        waterGoal: parseInt(document.getElementById('prof-water').value) || 2500
      };

      try {
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Saving Changes...';
        btn.disabled = true;

        this.profile = await window.API.saveProfile(payload);
        
        alert('Nutritional target profile saved successfully!');
        btn.textContent = 'Update Profile Targets';
        btn.disabled = false;

        // Redirect to dashboard
        document.querySelector('.nav-item[data-view="dashboard"]').click();
      } catch (e) {
        alert('Failed to save profile target: ' + e.message);
      }
    });
  },

  loadProfileSettings: async function() {
    try {
      this.profile = await window.API.getProfile();
      
      document.getElementById('prof-name').value = this.profile.name || '';
      document.getElementById('prof-calories').value = this.profile.calorieGoal || 2000;
      document.getElementById('prof-protein').value = this.profile.proteinGoal || 120;
      document.getElementById('prof-carbs').value = this.profile.carbsGoal || 220;
      document.getElementById('prof-fat').value = this.profile.fatGoal || 65;
      document.getElementById('prof-water').value = this.profile.waterGoal || 2500;
    } catch (e) {
      console.error('Error loading settings fields:', e);
    }
  },

  // 2. History Page Rendering
  renderHistory: async function() {
    const container = document.getElementById('history-logs-container');
    container.innerHTML = '';

    try {
      this.recalls = await window.API.getRecalls();
    } catch (e) {
      console.error('Failed to reload history list:', e);
    }

    if (this.recalls.length === 0) {
      container.innerHTML = `
        <div class="empty-state glass-panel" style="padding: 50px;">
          <i class="fas fa-history" style="font-size: 44px;"></i>
          <h2>No Recalls Logged Yet</h2>
          <p>Complete a 24-Hour Diet Recall questionnaire to build your history profile.</p>
          <button class="btn btn-primary" onclick="document.querySelector('.nav-item[data-view=\\'recall\\']').click();">Start Recall Wizard</button>
        </div>
      `;
      return;
    }

    // Sort recalls by date (most recent first)
    const sorted = [...this.recalls].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    sorted.forEach(recall => {
      const card = document.createElement('div');
      card.className = 'glass-panel widget-card';
      card.style.padding = '24px';
      card.style.marginBottom = '20px';
      card.style.height = 'auto';

      // Aggregate foods list
      const foodsMarkup = recall.foods.map(f => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; padding:10px 0; border-bottom:1px solid rgba(255, 255, 255, 0.02);">
          <div>
            <span style="font-weight:600; color:white;">${f.name}</span>
            <span class="tag-badge tag-${f.mealType}" style="margin-left: 8px;">${f.mealType}</span>
            <span style="color:var(--text-muted); font-size:11px; margin-left: 8px;">Logged at ${f.time}</span>
          </div>
          <div style="font-weight:500; color:var(--text-secondary);">
            ${f.portion} serving(s) • <span style="color:white; font-weight:600;">${Math.round(f.calories * f.portion)} kcal</span>
          </div>
        </div>
      `).join('');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:15px; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="font-family:var(--font-title); font-size:18px; font-weight:700; color:white;">
              Recall Log for ${recall.date}
            </h3>
            <span style="font-size:11px; color:var(--text-muted);">Submitted: ${new Date(recall.createdAt).toLocaleString()}</span>
          </div>
          <div style="display:flex; gap:15px;">
            <div style="text-align:right;">
              <div style="font-size:16px; font-weight:700; color:var(--primary);">${recall.totals.calories} kcal</div>
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Calories</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px; font-weight:700; color:var(--success);">${recall.totals.protein}g</div>
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Protein</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px; font-weight:700; color:var(--accent-cyan);">${recall.totals.carbs}g</div>
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Carbs</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px; font-weight:700; color:var(--warning);">${recall.totals.fat}g</div>
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Fat</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom:15px;">
          <h4 style="font-size:13px; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Foods & Beverages Logged</h4>
          ${foodsMarkup}
        </div>

        ${recall.notes ? `
          <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); margin-bottom:15px;">
            <div style="font-size:11px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; margin-bottom:4px;">Journal Notes</div>
            <p style="font-size:13px; color:var(--text-primary); line-height:1.4;">"${recall.notes}"</p>
          </div>
        ` : ''}

        ${recall.forgottenChecked && recall.forgottenChecked.length > 0 ? `
          <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
            <span style="font-size:11px; color:var(--text-muted); margin-right:4px;">Probed Checks:</span>
            ${recall.forgottenChecked.map(id => `<span class="tag-badge" style="background:rgba(255, 255, 255, 0.05); color:var(--text-secondary); font-size:10px; border:1px solid var(--glass-border);">${id}</span>`).join('')}
          </div>
        ` : ''}
      `;

      container.appendChild(card);
    });
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
