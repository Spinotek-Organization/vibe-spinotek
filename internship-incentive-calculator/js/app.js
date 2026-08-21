/**
 * Spinotek Internship Incentive Calculator - Main Application Controller
 */

import {
  COMPLEXITY_CONFIG,
  DEFAULT_CONTRIBUTIONS,
  MILESTONE_TEMPLATES,
  MAX_CONTRIBUTION_BONUS,
  PERFORMANCE_WEIGHTS
} from './constants.js';

import {
  formatCurrency,
  parseCurrencyInput,
  calculateDuration,
  calculatePerformanceScore,
  getPerformanceTier,
  calculateOutstandingBonus,
  calculateFinalIncentive,
  calculateMilestones,
  computeFullCalculation,
  generateFormattedSummaryText,
  copyTextToClipboard
} from './calculator.js';

import {
  getCalculations,
  getCalculationById,
  saveCalculation,
  updateCalculation,
  deleteCalculation,
  duplicateCalculation,
  loadDemoData,
  clearCalculations,
  generateId
} from './storage.js';

// Application State
const state = {
  currentView: 'dashboard', // 'dashboard' | 'calculator' | 'history'
  editingId: null,
  activeWizardStep: 1,
  
  // History filters & search
  searchQuery: '',
  tierFilter: 'all',
  sortBy: 'newest',

  // Current Form State
  form: {
    internName: '',
    projectName: '',
    clientName: '',
    projectValue: 0,
    startDate: '',
    endDate: '',
    complexity: 'medium',
    baseIncentive: 1000000,
    performance: {
      speed: 80,
      quality: 80,
      initiative: 80,
      responsibility: 80
    },
    contributions: DEFAULT_CONTRIBUTIONS.map(c => ({
      id: c.id,
      name: c.label,
      amount: c.defaultAmount,
      selected: false
    })),
    milestoneType: 'two', // 'two' | 'three' | 'custom'
    milestones: JSON.parse(JSON.stringify(MILESTONE_TEMPLATES.two))
  },

  // Modal states
  deleteModal: {
    isOpen: false,
    targetId: null,
    targetName: ''
  },
  detailModal: {
    isOpen: false,
    item: null
  }
};

// DOM Initializer
document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  initNavigation();
  initFormControls();
  initHistoryControls();
  initModalListeners();
  
  // Initial render
  navigateView('dashboard');
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ----------------------------------------------------
// Navigation
// ----------------------------------------------------
function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-nav');
      if (target === 'calculator' && !state.editingId) {
        resetFormState();
      }
      navigateView(target);
    });
  });

  const loadDemoBtns = document.querySelectorAll('.btn-load-demo');
  loadDemoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      loadDemoData();
      showToast('Data demo Iqbal dan Abdi berhasil dimuat!', 'success');
      renderDashboard();
      renderHistory();
    });
  });
}

export function navigateView(viewName) {
  state.currentView = viewName;

  // Update navbar links
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-nav') === viewName) {
      link.classList.add('text-blue-600', 'font-semibold', 'border-b-2', 'border-blue-600');
      link.classList.remove('text-slate-600');
    } else {
      link.classList.remove('text-blue-600', 'font-semibold', 'border-b-2', 'border-blue-600');
      link.classList.add('text-slate-600');
    }
  });

  // Hide/Show page sections
  document.getElementById('view-dashboard').classList.toggle('hidden', viewName !== 'dashboard');
  document.getElementById('view-calculator').classList.toggle('hidden', viewName !== 'calculator');
  document.getElementById('view-history').classList.toggle('hidden', viewName !== 'history');

  if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'calculator') {
    renderCalculatorForm();
  } else if (viewName === 'history') {
    renderHistory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  initLucideIcons();
}

// ----------------------------------------------------
// Dashboard Rendering
// ----------------------------------------------------
function renderDashboard() {
  const calculations = getCalculations();

  const totalProjects = calculations.length;
  const totalIncentive = calculations.reduce((sum, item) => sum + (item.finalIncentive || 0), 0);
  const avgScore = totalProjects > 0
    ? (calculations.reduce((sum, item) => sum + (item.performanceScore || 0), 0) / totalProjects).toFixed(1)
    : '0.0';
  const totalOutstanding = calculations.reduce((sum, item) => sum + (item.outstandingBonus || 0), 0);

  document.getElementById('stat-total-projects').textContent = totalProjects;
  document.getElementById('stat-total-incentive').textContent = formatCurrency(totalIncentive);
  document.getElementById('stat-avg-score').textContent = avgScore;
  document.getElementById('stat-total-outstanding').textContent = formatCurrency(totalOutstanding);

  const recentListContainer = document.getElementById('recent-calculations-list');
  const emptyState = document.getElementById('dashboard-empty-state');
  const recentSection = document.getElementById('dashboard-recent-section');

  if (totalProjects === 0) {
    emptyState.classList.remove('hidden');
    recentSection.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    recentSection.classList.remove('hidden');

    const recentItems = calculations.slice(0, 5);
    recentListContainer.innerHTML = recentItems.map(item => createCalculationCardHTML(item, false)).join('');
    bindCardActionButtons(recentListContainer);
  }

  initLucideIcons();
}

// ----------------------------------------------------
// Calculator Form Controls & Realtime Math
// ----------------------------------------------------
function resetFormState() {
  state.editingId = null;
  state.activeWizardStep = 1;
  state.form = {
    internName: '',
    projectName: '',
    clientName: '',
    projectValue: 0,
    startDate: '',
    endDate: '',
    complexity: 'medium',
    baseIncentive: COMPLEXITY_CONFIG.medium.defaultBase,
    performance: {
      speed: 80,
      quality: 80,
      initiative: 80,
      responsibility: 80
    },
    contributions: DEFAULT_CONTRIBUTIONS.map(c => ({
      id: c.id,
      name: c.label,
      amount: c.defaultAmount,
      selected: false
    })),
    milestoneType: 'two',
    milestones: JSON.parse(JSON.stringify(MILESTONE_TEMPLATES.two))
  };
}

function loadIntoForm(calculation) {
  state.editingId = calculation.id;
  state.activeWizardStep = 1;
  
  // Map contributions with selection
  const contributions = DEFAULT_CONTRIBUTIONS.map(def => {
    const existing = (calculation.outstandingContributions || []).find(c => c.id === def.id || c.name === def.label);
    return {
      id: def.id,
      name: def.label,
      amount: existing ? existing.amount : def.defaultAmount,
      selected: !!existing
    };
  });

  state.form = {
    internName: calculation.internName || '',
    projectName: calculation.projectName || '',
    clientName: calculation.clientName || '',
    projectValue: calculation.projectValue || 0,
    startDate: calculation.startDate || '',
    endDate: calculation.endDate || '',
    complexity: calculation.complexity || 'medium',
    baseIncentive: calculation.baseIncentive || COMPLEXITY_CONFIG[calculation.complexity || 'medium'].defaultBase,
    performance: {
      speed: calculation.performance?.speed ?? 80,
      quality: calculation.performance?.quality ?? 80,
      initiative: calculation.performance?.initiative ?? 80,
      responsibility: calculation.performance?.responsibility ?? 80
    },
    contributions,
    milestoneType: calculation.milestones?.length === 3 ? 'three' : calculation.milestones?.length === 2 ? 'two' : 'custom',
    milestones: JSON.parse(JSON.stringify(calculation.milestones || MILESTONE_TEMPLATES.two))
  };
}

function initFormControls() {
  // Wizard step clicks (mobile or wizard navigation)
  document.querySelectorAll('.wizard-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      setWizardStep(step);
    });
  });

  // Project Info Inputs
  const internInput = document.getElementById('input-intern-name');
  const projectInput = document.getElementById('input-project-name');
  const clientInput = document.getElementById('input-client-name');
  const projectValInput = document.getElementById('input-project-value');
  const startDateInput = document.getElementById('input-start-date');
  const endDateInput = document.getElementById('input-end-date');

  internInput.addEventListener('input', (e) => {
    state.form.internName = e.target.value;
    updateLivePreview();
  });

  projectInput.addEventListener('input', (e) => {
    state.form.projectName = e.target.value;
    updateLivePreview();
  });

  clientInput.addEventListener('input', (e) => {
    state.form.clientName = e.target.value;
  });

  projectValInput.addEventListener('input', (e) => {
    const rawVal = parseCurrencyInput(e.target.value);
    state.form.projectValue = rawVal;
    e.target.value = rawVal > 0 ? formatCurrency(rawVal) : '';
    updateLivePreview();
  });

  const handleDateChange = () => {
    state.form.startDate = startDateInput.value;
    state.form.endDate = endDateInput.value;
    const dur = calculateDuration(state.form.startDate, state.form.endDate);
    const durBadge = document.getElementById('duration-display');
    const durError = document.getElementById('date-error-msg');

    if (dur.error) {
      durError.textContent = dur.error;
      durError.classList.remove('hidden');
      durBadge.textContent = '-';
    } else {
      durError.classList.add('hidden');
      durBadge.textContent = dur.formatted;
    }
  };

  startDateInput.addEventListener('change', handleDateChange);
  endDateInput.addEventListener('change', handleDateChange);

  // Complexity radios
  document.querySelectorAll('input[name="complexity-radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const level = e.target.value;
      state.form.complexity = level;
      const defaultVal = COMPLEXITY_CONFIG[level].defaultBase;
      state.form.baseIncentive = defaultVal;
      document.getElementById('input-base-incentive').value = formatCurrency(defaultVal);
      document.getElementById('complexity-recommended-text').textContent = `Rekomendasi ${COMPLEXITY_CONFIG[level].label}: ${formatCurrency(COMPLEXITY_CONFIG[level].min)} - ${formatCurrency(COMPLEXITY_CONFIG[level].max)}`;
      updateLivePreview();
    });
  });

  // Base incentive input
  const baseIncentiveInput = document.getElementById('input-base-incentive');
  baseIncentiveInput.addEventListener('input', (e) => {
    const val = parseCurrencyInput(e.target.value);
    state.form.baseIncentive = val;
    e.target.value = val > 0 ? formatCurrency(val) : '';
    updateLivePreview();
  });

  // Performance Sliders & Number inputs
  ['speed', 'quality', 'initiative', 'responsibility'].forEach(key => {
    const slider = document.getElementById(`slider-${key}`);
    const numInput = document.getElementById(`num-${key}`);

    const syncPerf = (val) => {
      const clamped = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
      slider.value = clamped;
      numInput.value = clamped;
      state.form.performance[key] = clamped;
      updatePerformanceMetrics();
      updateLivePreview();
    };

    slider.addEventListener('input', (e) => syncPerf(e.target.value));
    numInput.addEventListener('input', (e) => syncPerf(e.target.value));
  });

  // Milestone Type selection
  document.querySelectorAll('input[name="milestone-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      state.form.milestoneType = type;
      if (type === 'two') {
        state.form.milestones = JSON.parse(JSON.stringify(MILESTONE_TEMPLATES.two));
      } else if (type === 'three') {
        state.form.milestones = JSON.parse(JSON.stringify(MILESTONE_TEMPLATES.three));
      }
      renderMilestonesList();
      updateLivePreview();
    });
  });

  // Add Custom Milestone Button
  document.getElementById('btn-add-milestone').addEventListener('click', () => {
    state.form.milestoneType = 'custom';
    document.querySelector('input[name="milestone-type"][value="custom"]').checked = true;
    state.form.milestones.push({
      name: `Milestone ${state.form.milestones.length + 1}`,
      description: 'Deskripsi milestone...',
      percentage: 0
    });
    renderMilestonesList();
    updateLivePreview();
  });

  // Form Submit / Save Button
  document.getElementById('btn-save-calculation').addEventListener('click', handleSaveCalculation);

  // Copy Live Summary Button
  document.getElementById('btn-copy-live-summary')?.addEventListener('click', async () => {
    const calc = getCurrentCalculatedData();
    const formatted = generateFormattedSummaryText(calc);
    const ok = await copyTextToClipboard(formatted);
    if (ok) {
      showToast('Format teks berhasil disalin! Siap dipaste ke Notion, GDocs, atau Word.', 'success');
    } else {
      showToast('Gagal menyalin teks ke clipboard.', 'error');
    }
  });

  document.getElementById('btn-reset-form').addEventListener('click', () => {
    if (confirm('Reset semua input form ke nilai default?')) {
      resetFormState();
      renderCalculatorForm();
      showToast('Form telah direset', 'info');
    }
  });

  // Next / Prev Wizard controls for mobile
  document.getElementById('btn-wizard-next')?.addEventListener('click', () => {
    if (state.activeWizardStep < 5) setWizardStep(state.activeWizardStep + 1);
  });
  document.getElementById('btn-wizard-prev')?.addEventListener('click', () => {
    if (state.activeWizardStep > 1) setWizardStep(state.activeWizardStep - 1);
  });
}

function setWizardStep(step) {
  state.activeWizardStep = step;
  
  // Highlight wizard navigation pills
  document.querySelectorAll('.wizard-step-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-step'), 10);
    const indicator = btn.querySelector('.step-indicator');
    if (s === step) {
      btn.classList.add('text-blue-600', 'border-blue-600');
      btn.classList.remove('text-slate-400', 'border-transparent');
      if (indicator) indicator.classList.add('bg-blue-600', 'text-white');
    } else if (s < step) {
      btn.classList.add('text-emerald-600', 'border-transparent');
      btn.classList.remove('text-blue-600', 'border-blue-600');
      if (indicator) indicator.classList.add('bg-emerald-100', 'text-emerald-700');
    } else {
      btn.classList.remove('text-blue-600', 'border-blue-600', 'text-emerald-600');
      btn.classList.add('text-slate-400', 'border-transparent');
      if (indicator) {
        indicator.classList.remove('bg-blue-600', 'text-white', 'bg-emerald-100', 'text-emerald-700');
        indicator.classList.add('bg-slate-100', 'text-slate-500');
      }
    }
  });

  // Toggle sections visibility in step-by-step mode (mobile)
  document.querySelectorAll('.calculator-step-section').forEach(sec => {
    const s = parseInt(sec.getAttribute('data-step-section'), 10);
    sec.classList.toggle('step-active', s === step);
  });
}

function renderCalculatorForm() {
  const isEditing = !!state.editingId;
  document.getElementById('form-title-badge').textContent = isEditing ? 'Mode Edit Perhitungan' : 'Perhitungan Baru';
  document.getElementById('form-save-btn-text').textContent = isEditing ? 'Perbarui Perhitungan' : 'Simpan Perhitungan';

  // Fill form inputs
  document.getElementById('input-intern-name').value = state.form.internName;
  document.getElementById('input-project-name').value = state.form.projectName;
  document.getElementById('input-client-name').value = state.form.clientName;
  document.getElementById('input-project-value').value = state.form.projectValue > 0 ? formatCurrency(state.form.projectValue) : '';
  document.getElementById('input-start-date').value = state.form.startDate;
  document.getElementById('input-end-date').value = state.form.endDate;

  // Duration
  const dur = calculateDuration(state.form.startDate, state.form.endDate);
  document.getElementById('duration-display').textContent = dur.formatted;

  // Complexity
  const compRadio = document.querySelector(`input[name="complexity-radio"][value="${state.form.complexity}"]`);
  if (compRadio) compRadio.checked = true;
  document.getElementById('input-base-incentive').value = formatCurrency(state.form.baseIncentive);
  document.getElementById('complexity-recommended-text').textContent = `Rekomendasi ${COMPLEXITY_CONFIG[state.form.complexity].label}: ${formatCurrency(COMPLEXITY_CONFIG[state.form.complexity].min)} - ${formatCurrency(COMPLEXITY_CONFIG[state.form.complexity].max)}`;

  // Performance
  ['speed', 'quality', 'initiative', 'responsibility'].forEach(key => {
    const val = state.form.performance[key];
    document.getElementById(`slider-${key}`).value = val;
    document.getElementById(`num-${key}`).value = val;
  });
  updatePerformanceMetrics();

  // Contributions
  renderContributionsList();

  // Milestones
  const mileRadio = document.querySelector(`input[name="milestone-type"][value="${state.form.milestoneType}"]`);
  if (mileRadio) mileRadio.checked = true;
  renderMilestonesList();

  // Update Summary Preview
  updateLivePreview();
  initLucideIcons();
}

function renderContributionsList() {
  const container = document.getElementById('contributions-checklist-container');
  container.innerHTML = state.form.contributions.map((c, index) => `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border ${c.selected ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-white'} transition-all gap-3">
      <label class="flex items-start sm:items-center gap-3 cursor-pointer flex-1">
        <input type="checkbox" class="contrib-checkbox w-4 h-4 mt-0.5 sm:mt-0 text-blue-600 rounded border-slate-300 focus:ring-blue-500" data-index="${index}" ${c.selected ? 'checked' : ''}>
        <span class="text-sm font-medium ${c.selected ? 'text-blue-900' : 'text-slate-700'}">${c.name}</span>
      </label>
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-xs text-slate-400">Nominal:</span>
        <input type="text" class="contrib-amount-input w-32 px-2.5 py-1 text-right text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" data-index="${index}" value="${formatCurrency(c.amount)}">
      </div>
    </div>
  `).join('');

  // Bind checkbox and amount change
  container.querySelectorAll('.contrib-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      state.form.contributions[idx].selected = e.target.checked;
      renderContributionsList();
      updateLivePreview();
    });
  });

  container.querySelectorAll('.contrib-amount-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      const raw = parseCurrencyInput(e.target.value);
      state.form.contributions[idx].amount = raw;
      e.target.value = raw > 0 ? formatCurrency(raw) : '';
      updateLivePreview();
    });
  });
}

function renderMilestonesList() {
  const container = document.getElementById('milestones-list-container');
  const finalCalc = getCurrentCalculatedData();
  const computedMilestones = calculateMilestones(state.form.milestones, finalCalc.finalIncentive);

  container.innerHTML = computedMilestones.items.map((m, index) => `
    <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <input type="text" class="milestone-name-input flex-1 text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none px-1" data-index="${index}" value="${m.name}" placeholder="Nama milestone...">
        ${state.form.milestones.length > 1 ? `
          <button type="button" class="btn-remove-milestone p-1 text-slate-400 hover:text-rose-600 rounded transition-colors" data-index="${index}" title="Hapus Milestone">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>
      <input type="text" class="milestone-desc-input w-full text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none px-1" data-index="${index}" value="${m.description || ''}" placeholder="Keterangan singkat...">
      
      <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Bobot:</span>
          <input type="number" min="0" max="100" class="milestone-pct-input w-16 px-2 py-0.5 text-center font-bold rounded border border-slate-200 focus:ring-1 focus:ring-blue-500" data-index="${index}" value="${m.percentage}">
          <span class="font-bold text-slate-600">%</span>
        </div>
        <div class="text-right">
          <span class="text-slate-400 text-[11px] block">Nominal:</span>
          <span class="font-bold text-blue-600">${formatCurrency(m.amount)}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Milestone validation status
  const totalPct = computedMilestones.totalPercentage;
  const statusEl = document.getElementById('milestone-total-status');
  statusEl.innerHTML = `
    <div class="flex items-center justify-between p-3 rounded-xl ${totalPct === 100 ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}">
      <div class="flex items-center gap-2">
        <i data-lucide="${totalPct === 100 ? 'check-circle-2' : 'alert-triangle'}" class="w-5 h-5"></i>
        <span class="text-xs font-semibold">Total Alokasi: ${totalPct}% ${totalPct === 100 ? '(Valid 100%)' : '(Harus tepat 100%)'}</span>
      </div>
      <span class="text-xs font-bold">${formatCurrency(finalCalc.finalIncentive)}</span>
    </div>
  `;

  // Bind milestone inputs
  container.querySelectorAll('.milestone-name-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      state.form.milestones[idx].name = e.target.value;
    });
  });

  container.querySelectorAll('.milestone-desc-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      state.form.milestones[idx].description = e.target.value;
    });
  });

  container.querySelectorAll('.milestone-pct-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      state.form.milestones[idx].percentage = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
      renderMilestonesList();
      updateLivePreview();
    });
  });

  container.querySelectorAll('.btn-remove-milestone').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      state.form.milestones.splice(idx, 1);
      state.form.milestoneType = 'custom';
      document.querySelector('input[name="milestone-type"][value="custom"]').checked = true;
      renderMilestonesList();
      updateLivePreview();
    });
  });

  initLucideIcons();
}

function updatePerformanceMetrics() {
  const score = calculatePerformanceScore(state.form.performance);
  const tier = getPerformanceTier(score);

  document.getElementById('display-perf-score').textContent = score.toFixed(1);
  const badge = document.getElementById('display-perf-tier-badge');
  badge.textContent = `${tier.label} (${(tier.multiplier * 100).toFixed(0)}%)`;
  badge.className = `px-2.5 py-1 text-xs font-bold rounded-full ${tier.bgBadge}`;

  const bar = document.getElementById('perf-score-progress-bar');
  bar.style.width = `${Math.min(100, Math.max(0, score))}%`;
  bar.className = `h-2.5 rounded-full transition-all duration-300 ${
    score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-blue-600' : score >= 70 ? 'bg-amber-500' : score >= 60 ? 'bg-orange-500' : 'bg-rose-500'
  }`;
}

function getCurrentCalculatedData() {
  const selectedContribs = state.form.contributions
    .filter(c => c.selected)
    .map(c => ({ id: c.id, name: c.name, amount: c.amount }));

  const rawData = {
    id: state.editingId,
    internName: state.form.internName,
    projectName: state.form.projectName,
    clientName: state.form.clientName,
    projectValue: state.form.projectValue,
    startDate: state.form.startDate,
    endDate: state.form.endDate,
    complexity: state.form.complexity,
    baseIncentive: state.form.baseIncentive,
    performance: state.form.performance,
    outstandingContributions: selectedContribs,
    milestones: state.form.milestones
  };

  return computeFullCalculation(rawData);
}

function updateLivePreview() {
  const calc = getCurrentCalculatedData();

  // Summary breakdown values
  document.getElementById('prev-intern-name').textContent = calc.internName || 'Nama Pemagang';
  document.getElementById('prev-project-name').textContent = calc.projectName || 'Nama Project';
  document.getElementById('prev-base-incentive').textContent = formatCurrency(calc.baseIncentive);
  document.getElementById('prev-multiplier-pct').textContent = `${(calc.performanceMultiplier * 100).toFixed(0)}%`;
  document.getElementById('prev-perf-tier').textContent = calc.performanceTier;
  document.getElementById('prev-adjusted-incentive').textContent = formatCurrency(calc.performanceAdjusted);
  document.getElementById('prev-outstanding-bonus').textContent = formatCurrency(calc.outstandingBonus);

  // Big Final Incentive Display
  document.getElementById('prev-final-incentive').textContent = formatCurrency(calc.finalIncentive);

  // Warning for capped outstanding bonus
  const capWarning = document.getElementById('contrib-cap-warning');
  if (calc.isOutstandingCapped) {
    capWarning.classList.remove('hidden');
    capWarning.innerHTML = `
      <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
        <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 flex-shrink-0"></i>
        <span>Total bonus melebihi batas maksimal <strong>${formatCurrency(MAX_CONTRIBUTION_BONUS)}</strong>. Nilai otomatis dibatasi.</span>
      </div>
    `;
    initLucideIcons();
  } else {
    capWarning.classList.add('hidden');
  }

  // Milestones mini summary in preview
  const previewMilestonesContainer = document.getElementById('prev-milestones-summary');
  if (previewMilestonesContainer) {
    previewMilestonesContainer.innerHTML = calc.milestones.map(m => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
        <span class="text-slate-600 font-medium truncate max-w-[160px]">${m.name} (${m.percentage}%)</span>
        <span class="font-semibold text-slate-800">${formatCurrency(m.amount)}</span>
      </div>
    `).join('');
  }
}

// ----------------------------------------------------
// Form Validation & Save
// ----------------------------------------------------
function validateForm() {
  const errors = [];

  if (!state.form.internName.trim()) {
    errors.push('Nama Pemagang wajib diisi.');
  }

  if (!state.form.projectName.trim()) {
    errors.push('Nama Project wajib diisi.');
  }

  if (state.form.projectValue <= 0) {
    errors.push('Nilai Project harus lebih besar dari Rp0.');
  }

  if (!state.form.startDate) {
    errors.push('Tanggal Mulai project wajib diisi.');
  }

  if (!state.form.endDate) {
    errors.push('Tanggal Selesai project wajib diisi.');
  }

  if (state.form.startDate && state.form.endDate) {
    const dur = calculateDuration(state.form.startDate, state.form.endDate);
    if (!dur.isValid) {
      errors.push(dur.error || 'Rentang tanggal tidak valid.');
    }
  }

  const calc = getCurrentCalculatedData();
  if (!calc.isMilestoneValid) {
    errors.push(`Total persentase milestone saat ini ${calc.milestoneTotalPct}%. Total alokasi wajib tepat 100%.`);
  }

  return errors;
}

function handleSaveCalculation() {
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    showToast(validationErrors[0], 'error');
    return;
  }

  const calcData = getCurrentCalculatedData();

  try {
    if (state.editingId) {
      updateCalculation(state.editingId, calcData);
      showToast(`Perhitungan untuk "${calcData.internName}" berhasil diperbarui!`, 'success');
    } else {
      saveCalculation(calcData);
      showToast(`Perhitungan untuk "${calcData.internName}" berhasil disimpan!`, 'success');
    }

    resetFormState();
    navigateView('history');
  } catch (error) {
    showToast(error.message || 'Gagal menyimpan perhitungan.', 'error');
  }
}

// ----------------------------------------------------
// History Page: Search, Filter, Sort & Table Render
// ----------------------------------------------------
function initHistoryControls() {
  const searchInput = document.getElementById('history-search-input');
  const clearBtn = document.getElementById('btn-clear-search');
  const filterSelect = document.getElementById('history-filter-tier');
  const sortSelect = document.getElementById('history-sort-by');
  const resetAllBtn = document.getElementById('btn-reset-all-filters');

  const handleSearch = (val) => {
    state.searchQuery = (val || '').toLowerCase().trim();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !state.searchQuery);
    }
    renderHistory();
  };

  searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  searchInput.addEventListener('keyup', (e) => handleSearch(e.target.value));
  searchInput.addEventListener('search', (e) => handleSearch(e.target.value));

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    handleSearch('');
    searchInput.focus();
  });

  filterSelect.addEventListener('change', (e) => {
    state.tierFilter = e.target.value;
    renderHistory();
  });

  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderHistory();
  });

  const resetHandler = () => {
    state.searchQuery = '';
    state.tierFilter = 'all';
    state.sortBy = 'newest';
    
    searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    filterSelect.value = 'all';
    sortSelect.value = 'newest';

    renderHistory();
    showToast('Filter & pencarian telah direset', 'info');
  };

  resetAllBtn?.addEventListener('click', resetHandler);
  document.getElementById('btn-empty-reset-filter')?.addEventListener('click', resetHandler);
}

function renderHistory() {
  const allCalculations = getCalculations();
  const searchTokens = state.searchQuery.split(/\s+/).filter(Boolean);

  // Filter
  let filtered = allCalculations.filter(item => {
    // Multi-token search matching across all important fields
    const internName = String(item.internName || '').toLowerCase();
    const projectName = String(item.projectName || '').toLowerCase();
    const clientName = String(item.clientName || '').toLowerCase();
    const complexity = String(item.complexity || '').toLowerCase();
    const tierName = String(item.performanceTier || '').toLowerCase();

    const matchSearch = searchTokens.length === 0 || searchTokens.every(token => 
      internName.includes(token) ||
      projectName.includes(token) ||
      clientName.includes(token) ||
      complexity.includes(token) ||
      tierName.includes(token)
    );

    const itemTierSlug = String(item.performanceTier || '').toLowerCase().trim().replace(/\s+/g, '-');
    const matchTier =
      state.tierFilter === 'all' ||
      itemTierSlug === state.tierFilter;

    return matchSearch && matchTier;
  });

  // Sort
  filtered.sort((a, b) => {
    if (state.sortBy === 'name-asc') {
      return (a.internName || '').localeCompare(b.internName || '', 'id', { sensitivity: 'base' });
    }
    if (state.sortBy === 'name-desc') {
      return (b.internName || '').localeCompare(a.internName || '', 'id', { sensitivity: 'base' });
    }
    if (state.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (state.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (state.sortBy === 'incentive-high') return (b.finalIncentive || 0) - (a.finalIncentive || 0);
    if (state.sortBy === 'incentive-low') return (a.finalIncentive || 0) - (b.finalIncentive || 0);
    if (state.sortBy === 'score-high') return (b.performanceScore || 0) - (a.performanceScore || 0);
    if (state.sortBy === 'score-low') return (a.performanceScore || 0) - (b.performanceScore || 0);
    return 0;
  });

  // Update counters & reset button state
  const countFilteredEl = document.getElementById('history-count-filtered');
  const countTotalEl = document.getElementById('history-count-total');
  const resetAllBtn = document.getElementById('btn-reset-all-filters');

  if (countFilteredEl) countFilteredEl.textContent = filtered.length;
  if (countTotalEl) countTotalEl.textContent = allCalculations.length;
  
  const isFiltered = !!state.searchQuery || state.tierFilter !== 'all' || state.sortBy !== 'newest';
  if (resetAllBtn) {
    resetAllBtn.classList.toggle('hidden', !isFiltered);
  }

  const tableBody = document.getElementById('history-table-body');
  const mobileList = document.getElementById('history-mobile-list');
  const emptyState = document.getElementById('history-empty-state');
  const contentContainer = document.getElementById('history-content-container');

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    contentContainer.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    contentContainer.classList.remove('hidden');
    mobileList.classList.remove('hidden');

    // Render Desktop Table Rows
    tableBody.innerHTML = filtered.map(item => `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        <td class="px-4 py-3.5">
          <div class="font-semibold text-slate-900">${item.internName}</div>
          <div class="text-xs text-slate-500">${item.clientName || 'Internal'}</div>
        </td>
        <td class="px-4 py-3.5">
          <div class="font-medium text-slate-800">${item.projectName}</div>
          <div class="text-xs text-slate-500">${item.durationFormatted} (${item.complexity.toUpperCase()})</div>
        </td>
        <td class="px-4 py-3.5 text-right font-medium text-slate-700">
          ${formatCurrency(item.projectValue)}
        </td>
        <td class="px-4 py-3.5 text-center">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${item.performanceTierBadge}">
            ${item.performanceScore.toFixed(1)} — ${item.performanceTier}
          </span>
        </td>
        <td class="px-4 py-3.5 text-right font-bold text-blue-600">
          ${formatCurrency(item.finalIncentive)}
        </td>
        <td class="px-4 py-3.5 text-xs text-slate-500">
          ${new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td class="px-4 py-3.5 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button class="btn-action-view p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${item.id}" title="Lihat Detail">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-copy-text p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${item.id}" title="Salin Teks (Docs/Notion)">
              <i data-lucide="clipboard-copy" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-edit p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" data-id="${item.id}" title="Edit">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-duplicate p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" data-id="${item.id}" title="Duplikasi">
              <i data-lucide="copy" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-print p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" data-id="${item.id}" title="Cetak Dokumen">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-delete p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" data-id="${item.id}" data-name="${item.internName} — ${item.projectName}" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Render Mobile Cards
    mobileList.innerHTML = filtered.map(item => createCalculationCardHTML(item, true)).join('');

    // Bind action buttons
    bindCardActionButtons(contentContainer);
  }

  initLucideIcons();
}

function createCalculationCardHTML(item, isFullActions = true) {
  return `
    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 spino-card-shadow flex flex-col justify-between hover:border-blue-300 transition-all duration-200 gap-4">
      
      <!-- Top Meta: Badge & Date -->
      <div class="flex items-center justify-between gap-2 pb-1">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.performanceTierBadge}">
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          ${item.performanceTier} (${item.performanceScore.toFixed(1)})
        </span>
        <span class="text-xs text-slate-400 font-medium">
          ${new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <!-- Intern & Project Info -->
      <div class="space-y-1">
        <h3 class="font-extrabold text-slate-900 text-lg tracking-tight leading-snug">${item.internName}</h3>
        <p class="text-xs text-slate-600 font-medium line-clamp-1 flex items-center gap-1">
          <i data-lucide="briefcase" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
          <span>${item.projectName}</span>
        </p>
        <p class="text-[11px] text-slate-400 flex items-center gap-1">
          <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
          <span>Client: <strong class="text-slate-600 font-semibold">${item.clientName || 'Internal Spinotek'}</strong></span>
        </p>
      </div>

      <!-- Key Project Stats Grid -->
      <div class="grid grid-cols-2 gap-3 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div>
          <span class="text-slate-400 text-[11px] block">Nilai Project</span>
          <span class="font-bold text-slate-800">${formatCurrency(item.projectValue)}</span>
        </div>
        <div>
          <span class="text-slate-400 text-[11px] block">Base Incentive</span>
          <span class="font-bold text-slate-800">${formatCurrency(item.baseIncentive)}</span>
        </div>
      </div>

      <!-- Prominent Final Incentive Box -->
      <div class="rounded-xl p-3.5 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-cyan-50/50 border border-blue-100 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Final Incentive</span>
          <span class="text-[11px] text-slate-500 font-medium">Multiplier: ${(item.performanceMultiplier * 100).toFixed(0)}%</span>
        </div>
        <div class="text-right">
          <span class="text-xl font-black text-blue-700 tracking-tight">${formatCurrency(item.finalIncentive)}</span>
        </div>
      </div>

      <!-- Bottom Action Row -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <button class="btn-action-view px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5" data-id="${item.id}">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Detail Lengkap</span>
        </button>
        
        <div class="flex items-center gap-1">
          <button class="btn-action-copy-text p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${item.id}" title="Salin Teks Ringkasan (Notion/Doc)">
            <i data-lucide="clipboard-copy" class="w-4 h-4"></i>
          </button>
          <button class="btn-action-print p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" data-id="${item.id}" title="Cetak Dokumen">
            <i data-lucide="printer" class="w-4 h-4"></i>
          </button>
          ${isFullActions ? `
            <button class="btn-action-edit p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" data-id="${item.id}" title="Edit Perhitungan">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-duplicate p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" data-id="${item.id}" title="Duplikasi">
              <i data-lucide="copy" class="w-4 h-4"></i>
            </button>
            <button class="btn-action-delete p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" data-id="${item.id}" data-name="${item.internName} — ${item.projectName}" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>

    </div>
  `;
}

function bindCardActionButtons(container) {
  if (!container) return;
  // View Detail
  container.querySelectorAll('.btn-action-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = getCalculationById(id);
      if (item) openDetailModal(item);
    });
  });

  // Copy Formatted Text
  container.querySelectorAll('.btn-action-copy-text').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const item = getCalculationById(id);
      if (item) {
        const formatted = generateFormattedSummaryText(item);
        const ok = await copyTextToClipboard(formatted);
        if (ok) {
          showToast(`Format teks untuk "${item.internName}" berhasil disalin! Siap dipaste ke Notion / Docs.`, 'success');
        } else {
          showToast('Gagal menyalin teks ke clipboard.', 'error');
        }
      }
    });
  });

  // Edit
  container.querySelectorAll('.btn-action-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = getCalculationById(id);
      if (item) {
        loadIntoForm(item);
        navigateView('calculator');
      }
    });
  });

  // Duplicate
  container.querySelectorAll('.btn-action-duplicate').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      try {
        const cloned = duplicateCalculation(id);
        showToast(`Perhitungan untuk "${cloned.internName}" berhasil diduplikasi!`, 'success');
        renderDashboard();
        renderHistory();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Print Document
  container.querySelectorAll('.btn-action-print').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = getCalculationById(id);
      if (item) triggerPrintDocument(item);
    });
  });

  // Delete Confirm Modal
  container.querySelectorAll('.btn-action-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      openDeleteModal(id, name);
    });
  });
}

// ----------------------------------------------------
// Modals & Print Handlers
// ----------------------------------------------------
function initModalListeners() {
  // Delete modal cancel & confirm
  document.getElementById('btn-cancel-delete').addEventListener('click', closeDeleteModal);
  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (state.deleteModal.targetId) {
      deleteCalculation(state.deleteModal.targetId);
      showToast('Perhitungan telah dihapus.', 'info');
      closeDeleteModal();
      renderDashboard();
      renderHistory();
    }
  });

  // Detail modal copy text
  document.getElementById('btn-modal-copy')?.addEventListener('click', async () => {
    if (state.detailModal.item) {
      const formatted = generateFormattedSummaryText(state.detailModal.item);
      const ok = await copyTextToClipboard(formatted);
      if (ok) {
        showToast('Format teks berhasil disalin! Siap dipaste ke Notion / Docs.', 'success');
      } else {
        showToast('Gagal menyalin teks.', 'error');
      }
    }
  });

  // Detail modal close
  document.getElementById('btn-close-detail').addEventListener('click', closeDetailModal);
  document.getElementById('btn-modal-print').addEventListener('click', () => {
    if (state.detailModal.item) {
      triggerPrintDocument(state.detailModal.item);
    }
  });
  document.getElementById('btn-modal-edit').addEventListener('click', () => {
    if (state.detailModal.item) {
      const it = state.detailModal.item;
      closeDetailModal();
      loadIntoForm(it);
      navigateView('calculator');
    }
  });

  // Escape key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDeleteModal();
      closeDetailModal();
    }
  });
}

function openDeleteModal(id, name) {
  state.deleteModal = { isOpen: true, targetId: id, targetName: name };
  document.getElementById('delete-modal-target-name').textContent = name;
  document.getElementById('modal-delete-confirm').classList.remove('hidden');
}

function closeDeleteModal() {
  state.deleteModal = { isOpen: false, targetId: null, targetName: '' };
  document.getElementById('modal-delete-confirm').classList.add('hidden');
}

function openDetailModal(item) {
  state.detailModal = { isOpen: true, item };
  
  document.getElementById('detail-intern-name').textContent = item.internName;
  document.getElementById('detail-project-name').textContent = item.projectName;
  document.getElementById('detail-client-name').textContent = item.clientName || '-';
  document.getElementById('detail-project-val').textContent = formatCurrency(item.projectValue);
  document.getElementById('detail-dates').textContent = `${item.startDate} s/d ${item.endDate} (${item.durationFormatted})`;
  document.getElementById('detail-complexity').textContent = item.complexity.toUpperCase();

  document.getElementById('detail-base-incentive').textContent = formatCurrency(item.baseIncentive);
  document.getElementById('detail-perf-score').textContent = `${item.performanceScore.toFixed(1)} / 100 (${item.performanceTier})`;
  document.getElementById('detail-multiplier').textContent = `${(item.performanceMultiplier * 100).toFixed(0)}%`;
  document.getElementById('detail-adjusted-incentive').textContent = formatCurrency(item.performanceAdjusted);
  document.getElementById('detail-outstanding-bonus').textContent = formatCurrency(item.outstandingBonus);
  document.getElementById('detail-final-incentive').textContent = formatCurrency(item.finalIncentive);

  // Performance Breakdown
  document.getElementById('detail-perf-breakdown').innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      <div class="p-2.5 bg-slate-50 rounded-lg">
        <span class="text-slate-400 block">Kecepatan (25%)</span>
        <span class="font-bold text-slate-800">${item.performance?.speed ?? '-'}</span>
      </div>
      <div class="p-2.5 bg-slate-50 rounded-lg">
        <span class="text-slate-400 block">Kualitas (30%)</span>
        <span class="font-bold text-slate-800">${item.performance?.quality ?? '-'}</span>
      </div>
      <div class="p-2.5 bg-slate-50 rounded-lg">
        <span class="text-slate-400 block">Inisiatif (25%)</span>
        <span class="font-bold text-slate-800">${item.performance?.initiative ?? '-'}</span>
      </div>
      <div class="p-2.5 bg-slate-50 rounded-lg">
        <span class="text-slate-400 block">Responsibility (20%)</span>
        <span class="font-bold text-slate-800">${item.performance?.responsibility ?? '-'}</span>
      </div>
    </div>
  `;

  // Outstanding Contributions
  const contribsList = item.outstandingContributions || [];
  document.getElementById('detail-contrib-list').innerHTML = contribsList.length > 0
    ? contribsList.map(c => `
        <div class="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
          <span class="text-slate-700">${c.name}</span>
          <span class="font-semibold text-slate-900">${formatCurrency(c.amount)}</span>
        </div>
      `).join('')
    : '<span class="text-xs text-slate-400 italic">Tidak ada outstanding contribution</span>';

  // Milestones
  const milestones = item.milestones || [];
  document.getElementById('detail-milestones-list').innerHTML = milestones.map(m => `
    <div class="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50">
      <div>
        <span class="font-semibold text-slate-800">${m.name} (${m.percentage}%)</span>
        <p class="text-[11px] text-slate-500">${m.description || '-'}</p>
      </div>
      <span class="font-bold text-blue-600">${formatCurrency(m.amount)}</span>
    </div>
  `).join('');

  document.getElementById('modal-detail').classList.remove('hidden');
  initLucideIcons();
}

function closeDetailModal() {
  state.detailModal = { isOpen: false, item: null };
  document.getElementById('modal-detail').classList.add('hidden');
}

// ----------------------------------------------------
// Professional Print Layout Handler
// ----------------------------------------------------
function triggerPrintDocument(item) {
  const printDoc = document.getElementById('print-document');
  const nowStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  printDoc.innerHTML = `
    <div class="print-page p-8 font-sans text-slate-900 max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div>
        <div class="flex items-start justify-between mb-3">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">PT SPINOTEK INOVASI DIGITAL</h1>
            <p class="text-xs text-slate-500 mt-0.5">Internship Project Incentive &amp; Performance Statement</p>
          </div>
          <div class="text-right text-xs text-slate-600 space-y-0.5">
            <div>Ref: <strong class="text-slate-900">${item.id}</strong></div>
            <div>Tanggal Cetak: ${nowStr}</div>
          </div>
        </div>
        <div class="h-1 bg-blue-600 rounded-full w-full"></div>
      </div>

      <!-- Top Info Cards: Informasi Pemagang & Penilaian Kompleksitas -->
      <div class="grid grid-cols-2 gap-5">
        <!-- Informasi Pemagang & Project -->
        <div class="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
          <h3 class="text-xs font-bold text-slate-800 tracking-wider uppercase">INFORMASI PEMAGANG &amp; PROJECT</h3>
          <table class="w-full text-xs">
            <tbody>
              <tr>
                <td class="py-1 text-slate-500 w-28 border-0 pl-0">Nama Pemagang</td>
                <td class="py-1 font-bold text-slate-900 border-0">: ${item.internName}</td>
              </tr>
              <tr>
                <td class="py-1 text-slate-500 border-0 pl-0 align-top">Nama Project</td>
                <td class="py-1 font-bold text-slate-900 border-0">: ${item.projectName}</td>
              </tr>
              <tr>
                <td class="py-1 text-slate-500 border-0 pl-0">Client</td>
                <td class="py-1 text-slate-700 border-0">: ${item.clientName || 'Internal'}</td>
              </tr>
              <tr>
                <td class="py-1 text-slate-500 border-0 pl-0">Durasi Project</td>
                <td class="py-1 text-slate-700 border-0">: ${item.startDate} s/d ${item.endDate} (${item.durationFormatted})</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Penilaian Kompleksitas -->
        <div class="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
          <h3 class="text-xs font-bold text-slate-800 tracking-wider uppercase">PENILAIAN KOMPLEKSITAS</h3>
          <table class="w-full text-xs">
            <tbody>
              <tr>
                <td class="py-1 text-slate-500 w-28 border-0 pl-0">Nilai Project</td>
                <td class="py-1 font-bold text-slate-900 border-0">: ${formatCurrency(item.projectValue)}</td>
              </tr>
              <tr>
                <td class="py-1 text-slate-500 border-0 pl-0">Kompleksitas</td>
                <td class="py-1 font-bold text-slate-900 border-0">: ${item.complexity.toUpperCase()}</td>
              </tr>
              <tr>
                <td class="py-1 text-slate-500 border-0 pl-0">Base Incentive</td>
                <td class="py-1 font-bold text-blue-600 border-0">: ${formatCurrency(item.baseIncentive)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Evaluasi Performa Pemagang Table -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-800 tracking-wider uppercase">EVALUASI PERFORMA PEMAGANG</h3>
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th class="py-2.5 px-3.5 text-left font-bold w-1/2">Indikator Penilaian</th>
                <th class="py-2.5 px-3 text-center font-bold">Bobot</th>
                <th class="py-2.5 px-3 text-center font-bold">Skor (0-100)</th>
                <th class="py-2.5 px-3.5 text-right font-bold">Skor Tertimbang</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="py-2 px-3.5 text-slate-800">1. Kecepatan &amp; Ketepatan Waktu</td>
                <td class="py-2 px-3 text-center text-slate-600">25%</td>
                <td class="py-2 px-3 text-center font-bold text-slate-900">${item.performance?.speed ?? 0}</td>
                <td class="py-2 px-3.5 text-right font-medium text-slate-800">${((item.performance?.speed ?? 0) * 0.25).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="py-2 px-3.5 text-slate-800">2. Kualitas Hasil</td>
                <td class="py-2 px-3 text-center text-slate-600">30%</td>
                <td class="py-2 px-3 text-center font-bold text-slate-900">${item.performance?.quality ?? 0}</td>
                <td class="py-2 px-3.5 text-right font-medium text-slate-800">${((item.performance?.quality ?? 0) * 0.30).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="py-2 px-3.5 text-slate-800">3. Inisiatif &amp; Problem Solving</td>
                <td class="py-2 px-3 text-center text-slate-600">25%</td>
                <td class="py-2 px-3 text-center font-bold text-slate-900">${item.performance?.initiative ?? 0}</td>
                <td class="py-2 px-3.5 text-right font-medium text-slate-800">${((item.performance?.initiative ?? 0) * 0.25).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="py-2 px-3.5 text-slate-800">4. Responsibility</td>
                <td class="py-2 px-3 text-center text-slate-600">20%</td>
                <td class="py-2 px-3 text-center font-bold text-slate-900">${item.performance?.responsibility ?? 0}</td>
                <td class="py-2 px-3.5 text-right font-medium text-slate-800">${((item.performance?.responsibility ?? 0) * 0.20).toFixed(2)}</td>
              </tr>
              <tr class="bg-blue-50/40 font-bold border-t border-slate-200">
                <td class="py-2.5 px-3.5 text-slate-900 font-extrabold uppercase" colspan="2">TOTAL PERFORMANCE SCORE &amp; TIER</td>
                <td class="py-2.5 px-3 text-center font-bold text-blue-600">${item.performanceScore.toFixed(2)} / 100</td>
                <td class="py-2.5 px-3.5 text-right font-bold text-blue-600">${item.performanceTier} (Multiplier ${(item.performanceMultiplier * 100).toFixed(0)}%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Outstanding Contribution & Rincian Perhitungan Akhir -->
      <div class="grid grid-cols-2 gap-5 items-stretch">
        <!-- Outstanding Contribution Card -->
        <div class="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between space-y-3">
          <div>
            <h3 class="text-xs font-bold text-slate-800 tracking-wider mb-3 uppercase">OUTSTANDING CONTRIBUTION BONUS</h3>
            <div class="space-y-1.5 text-xs">
              ${(item.outstandingContributions || []).length > 0
                ? item.outstandingContributions.map(c => `
                  <div class="flex justify-between items-center py-1">
                    <span class="text-slate-600">&bull; ${c.name}</span>
                    <span class="font-bold text-slate-900">${formatCurrency(c.amount)}</span>
                  </div>
                `).join('')
                : '<p class="text-slate-400 italic py-2">Tidak ada bonus kontribusi tambahan.</p>'
              }
            </div>
          </div>
          <div class="flex justify-between items-center pt-3 border-t border-slate-200 text-xs font-bold text-slate-900">
            <span>Total Bonus (Maks Rp500.000):</span>
            <span class="text-emerald-600 font-bold">${formatCurrency(item.outstandingBonus)}</span>
          </div>
        </div>

        <!-- Rincian Perhitungan Akhir Card -->
        <div class="border-2 border-blue-600 rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-xs font-extrabold text-blue-900 tracking-wider mb-3 uppercase">RINCIAN PERHITUNGAN AKHIR</h3>
            <table class="w-full text-xs">
              <tbody>
                <tr>
                  <td class="py-1 text-slate-600 border-0 pl-0">Base Incentive</td>
                  <td class="py-1 font-bold text-right text-slate-900 border-0">${formatCurrency(item.baseIncentive)}</td>
                </tr>
                <tr>
                  <td class="py-1 text-slate-600 border-0 pl-0">&times; Performance Multiplier</td>
                  <td class="py-1 font-bold text-right text-slate-900 border-0">${(item.performanceMultiplier * 100).toFixed(0)}%</td>
                </tr>
                <tr class="border-t border-slate-100">
                  <td class="py-1 text-slate-600 border-0 pl-0">= Adjusted Incentive</td>
                  <td class="py-1 font-bold text-right text-slate-900 border-0">${formatCurrency(item.performanceAdjusted)}</td>
                </tr>
                <tr>
                  <td class="py-1 text-slate-600 border-0 pl-0">+ Outstanding Contribution</td>
                  <td class="py-1 font-bold text-right text-slate-900 border-0">${formatCurrency(item.outstandingBonus)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pt-3 border-t-2 border-blue-600 flex justify-between items-center">
            <span class="text-xs font-black text-blue-900 uppercase tracking-wide">FINAL INCENTIVE</span>
            <span class="text-2xl font-black text-blue-600 tracking-tight">${formatCurrency(item.finalIncentive)}</span>
          </div>
        </div>
      </div>

      <!-- Jadwal Pencairan Berdasarkan Milestone -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-slate-800 tracking-wider uppercase">JADWAL PENCAIRAN BERDASARKAN MILESTONE</h3>
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th class="py-2.5 px-3.5 text-left font-bold w-1/4">Nama Milestone</th>
                <th class="py-2.5 px-3.5 text-left font-bold">Deskripsi</th>
                <th class="py-2.5 px-3 text-center font-bold w-24">Alokasi (%)</th>
                <th class="py-2.5 px-3.5 text-right font-bold w-36">Nominal Pencairan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${(item.milestones || []).map(m => `
                <tr>
                  <td class="py-2.5 px-3.5 font-bold text-slate-900">${m.name}</td>
                  <td class="py-2.5 px-3.5 text-slate-600">${m.description || '-'}</td>
                  <td class="py-2.5 px-3 text-center font-bold text-slate-900">${m.percentage}%</td>
                  <td class="py-2.5 px-3.5 text-right font-bold text-blue-600">${formatCurrency(m.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Trigger browser print
  window.print();
}

// ----------------------------------------------------
// Toast Notification Utility
// ----------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
    type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
    'bg-slate-800 text-white border-slate-700'
  }`;

  const iconName = type === 'success' ? 'check-circle-2' : type === 'error' ? 'alert-circle' : 'info';
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.2s ease-in';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}
