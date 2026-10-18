/**
 * Spinotek Internship Incentive System - Constants & Business Rules
 */

export const STORAGE_KEY = 'spinotek_internship_incentives';

// Performance Assessment Weights (Total 100%)
export const PERFORMANCE_WEIGHTS = {
  speed: 0.25,        // Kecepatan & Ketepatan Waktu
  quality: 0.30,      // Kualitas Hasil
  initiative: 0.25,   // Inisiatif & Problem Solving
  responsibility: 0.20 // Responsibility
};

// Multiplier Tiers based on Performance Score
export const PERFORMANCE_TIERS = [
  { min: 90, max: 100, multiplier: 1.00, label: 'Excellent', colorClass: 'tier-excellent', bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { min: 80, max: 89.999, multiplier: 0.90, label: 'Very Good', colorClass: 'tier-very-good', bgBadge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { min: 70, max: 79.999, multiplier: 0.75, label: 'Good', colorClass: 'tier-good', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { min: 60, max: 69.999, multiplier: 0.50, label: 'Needs Improvement', colorClass: 'tier-needs-improvement', bgBadge: 'bg-orange-50 text-orange-700 border-orange-200' },
  { min: 0,  max: 59.999, multiplier: 0.00, label: 'Unsatisfactory', colorClass: 'tier-unsatisfactory', bgBadge: 'bg-rose-50 text-rose-700 border-rose-200' }
];

// Complexity Tiers & Recommended Base Incentives
export const COMPLEXITY_CONFIG = {
  small: {
    label: 'Small',
    description: 'CRUD sederhana, landing page, modul kecil, form sederhana',
    min: 300000,
    max: 500000,
    defaultBase: 400000
  },
  medium: {
    label: 'Medium',
    description: 'Beberapa modul, auth, dashboard, REST API, database, role & permission',
    min: 750000,
    max: 1250000,
    defaultBase: 1000000
  },
  large: {
    label: 'Large',
    description: 'Banyak modul, integrasi API, business logic kompleks, deployment, UAT, maintenance',
    min: 1500000,
    max: 2500000,
    defaultBase: 2000000
  }
};

// Outstanding Contribution Catalog
export const DEFAULT_CONTRIBUTIONS = [
  { id: 'crit_bug', label: 'Menemukan dan memperbaiki critical bug', defaultAmount: 100000 },
  { id: 'scope_imp', label: 'Improvement di luar requirement', defaultAmount: 150000 },
  { id: 'deploy_ops', label: 'Membantu deployment / server', defaultAmount: 100000 },
  { id: 'tech_doc', label: 'Membuat dokumentasi teknis', defaultAmount: 75000 },
  { id: 'team_help', label: 'Membantu anggota tim lain', defaultAmount: 75000 },
  { id: 'solo_solve', label: 'Menyelesaikan masalah sulit secara mandiri', defaultAmount: 150000 },
  { id: 'client_imp', label: 'Memberikan improvement yang berdampak kepada client', defaultAmount: 250000 }
];

export const MAX_CONTRIBUTION_BONUS = 500000;

// Milestone Templates
export const MILESTONE_TEMPLATES = {
  two: [
    { name: 'Milestone 1 — Development', description: 'Pengerjaan fitur utama dan modul inti project', percentage: 50 },
    { name: 'Milestone 2 — Finalization / Maintenance', description: 'Testing, bug fixing, dan serah terima project', percentage: 50 }
  ],
  three: [
    { name: 'Milestone 1 — Development', description: 'Pengerjaan core modules dan API backend', percentage: 30 },
    { name: 'Milestone 2 — UAT / Finalization', description: 'Pengujian pengguna dan integrasi akhir', percentage: 40 },
    { name: 'Milestone 3 — Maintenance / Handover', description: 'Dokumentasi, deployment server, dan handover', percentage: 30 }
  ]
};
