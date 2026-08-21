/**
 * Spinotek Internship Incentive Calculator - LocalStorage & Data Layer
 */

import { STORAGE_KEY } from './constants.js';
import { computeFullCalculation } from './calculator.js';

/**
 * Generate a unique ID
 * @returns {string}
 */
export function generateId() {
  return 'calc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

/**
 * Safely retrieve all calculations from localStorage
 * @returns {Array<Object>}
 */
export function getCalculations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure all items have computed fields refreshed
    return parsed.map(item => computeFullCalculation(item));
  } catch (error) {
    console.error('Error reading calculations from localStorage:', error);
    return [];
  }
}

/**
 * Get a single calculation by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getCalculationById(id) {
  const list = getCalculations();
  return list.find(item => item.id === id) || null;
}

/**
 * Save a new calculation to localStorage
 * @param {Object} data
 * @returns {Object} saved calculation
 */
export function saveCalculation(data) {
  const list = getCalculations();
  const now = new Date().toISOString();

  const newRecord = {
    ...data,
    id: data.id || generateId(),
    createdAt: data.createdAt || now,
    updatedAt: now
  };

  const computed = computeFullCalculation(newRecord);
  list.unshift(computed);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    throw new Error('Data tidak dapat disimpan di browser ini. Silakan periksa browser storage settings.');
  }

  return computed;
}

/**
 * Update an existing calculation in localStorage
 * @param {string} id
 * @param {Object} data
 * @returns {Object} updated calculation
 */
export function updateCalculation(id, data) {
  const list = getCalculations();
  const index = list.findIndex(item => item.id === id);

  if (index === -1) {
    throw new Error('Data perhitungan tidak ditemukan.');
  }

  const now = new Date().toISOString();
  const updatedRecord = {
    ...list[index],
    ...data,
    id,
    updatedAt: now
  };

  const computed = computeFullCalculation(updatedRecord);
  list[index] = computed;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to update localStorage:', error);
    throw new Error('Data tidak dapat diperbarui di browser.');
  }

  return computed;
}

/**
 * Delete a calculation by ID
 * @param {string} id
 * @returns {boolean}
 */
export function deleteCalculation(id) {
  const list = getCalculations();
  const filtered = list.filter(item => item.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete item from localStorage:', error);
    return false;
  }
}

/**
 * Duplicate a calculation
 * @param {string} id
 * @returns {Object} newly duplicated calculation
 */
export function duplicateCalculation(id) {
  const existing = getCalculationById(id);
  if (!existing) {
    throw new Error('Perhitungan asal tidak ditemukan untuk diduplikasi.');
  }

  const now = new Date().toISOString();
  // Deep clone data without old IDs
  const cloned = JSON.parse(JSON.stringify(existing));
  cloned.id = generateId();
  cloned.createdAt = now;
  cloned.updatedAt = now;

  return saveCalculation(cloned);
}

/**
 * Clear all calculation records
 */
export function clearCalculations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Load Demo / Seed Data (Iqbal & Abdi)
 * @returns {Array<Object>}
 */
export function loadDemoData() {
  const now = new Date();
  const iqbalDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString();
  const abdiDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString();

  const demoItems = [
    {
      id: 'demo_iqbal_' + Date.now(),
      internName: 'Iqbal',
      projectName: 'Sistem Internal Komodo Travel',
      clientName: 'Komodo Travel',
      projectValue: 7500000,
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      complexity: 'medium',
      baseIncentive: 1250000,
      performance: {
        speed: 95,
        quality: 90,
        initiative: 95,
        responsibility: 90
      },
      outstandingContributions: [
        { id: 'crit_bug', name: 'Menemukan dan memperbaiki critical bug', amount: 150000 },
        { id: 'solo_solve', name: 'Menyelesaikan masalah sulit secara mandiri', amount: 150000 }
      ],
      milestones: [
        { id: 'm1', name: 'Development', description: 'Fitur inti dan booking engine', percentage: 30, amount: 465000 },
        { id: 'm2', name: 'UAT', description: 'Pengujian pengguna dan perbaikan', percentage: 40, amount: 620000 },
        { id: 'm3', name: 'Maintenance', description: 'Handover dan dokumentasi', percentage: 30, amount: 465000 }
      ],
      createdAt: iqbalDate,
      updatedAt: iqbalDate
    },
    {
      id: 'demo_abdi_' + Date.now(),
      internName: 'Abdi',
      projectName: 'Company Profile Terrageoscience',
      clientName: 'Terrageoscience',
      projectValue: 4700000,
      startDate: '2026-04-01',
      endDate: '2026-05-31',
      complexity: 'medium',
      baseIncentive: 750000,
      performance: {
        speed: 70,
        quality: 75,
        initiative: 65,
        responsibility: 80
      },
      outstandingContributions: [],
      milestones: [
        { id: 'm1', name: 'Milestone 1 — Development', description: 'Pengerjaan layout responsive dan CMS', percentage: 50, amount: 281250 },
        { id: 'm2', name: 'Milestone 2 — Finalization / Maintenance', description: 'Deployment domain dan SEO basic', percentage: 50, amount: 281250 }
      ],
      createdAt: abdiDate,
      updatedAt: abdiDate
    }
  ];

  const current = getCalculations();
  const merged = [...demoItems.map(item => computeFullCalculation(item)), ...current];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
