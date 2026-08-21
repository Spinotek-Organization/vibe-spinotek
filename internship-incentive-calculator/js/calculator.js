/**
 * Spinotek Internship Incentive Calculator - Calculation & Helper Library
 */

import {
  PERFORMANCE_WEIGHTS,
  PERFORMANCE_TIERS,
  COMPLEXITY_CONFIG,
  MAX_CONTRIBUTION_BONUS
} from './constants.js';

/**
 * Format numeric value to Indonesian Rupiah currency string
 * @param {number} amount
 * @param {boolean} showDecimals
 * @returns {string} e.g. "Rp1.550.000"
 */
export function formatCurrency(amount, showDecimals = false) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  const numeric = Math.round(Number(amount) * 100) / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: showDecimals && numeric % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(numeric).replace(/\s+/g, '');
}

/**
 * Parse a formatted or raw string into clean positive integer/number
 * @param {string|number} input
 * @returns {number}
 */
export function parseCurrencyInput(input) {
  if (typeof input === 'number') return Math.max(0, input);
  if (!input) return 0;
  const cleaned = String(input).replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Calculate duration between two ISO date strings (YYYY-MM-DD)
 * @param {string} startStr
 * @param {string} endStr
 * @returns {{ months: number, days: number, totalDays: number, formatted: string, isValid: boolean, error?: string }}
 */
export function calculateDuration(startStr, endStr) {
  if (!startStr || !endStr) {
    return { months: 0, days: 0, totalDays: 0, formatted: '-', isValid: false };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { months: 0, days: 0, totalDays: 0, formatted: '-', isValid: false, error: 'Format tanggal tidak valid' };
  }

  if (end < start) {
    return { months: 0, days: 0, totalDays: 0, formatted: '-', isValid: false, error: 'Tanggal selesai tidak boleh mendahului tanggal mulai' };
  }

  // Calculate difference in days (inclusive counting: diff + 1)
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in the previous month
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  let formatted = '';
  if (months > 0 && days > 0) {
    formatted = `${months} bulan ${days} hari`;
  } else if (months > 0) {
    formatted = `${months} bulan`;
  } else {
    formatted = `${days} hari`;
  }

  return { months, days, totalDays, formatted, isValid: true };
}

/**
 * Calculate Performance Score based on the 4 weighted parameters
 * @param {{ speed: number, quality: number, initiative: number, responsibility: number }} performance
 * @returns {number} 0 - 100 rounded to 2 decimal places
 */
export function calculatePerformanceScore(performance = {}) {
  const speed = Number(performance.speed || 0);
  const quality = Number(performance.quality || 0);
  const initiative = Number(performance.initiative || 0);
  const responsibility = Number(performance.responsibility || 0);

  const score =
    (speed * PERFORMANCE_WEIGHTS.speed) +
    (quality * PERFORMANCE_WEIGHTS.quality) +
    (initiative * PERFORMANCE_WEIGHTS.initiative) +
    (responsibility * PERFORMANCE_WEIGHTS.responsibility);

  return Math.round(score * 100) / 100;
}

/**
 * Get Multiplier Tier based on Performance Score
 * @param {number} score
 * @returns {{ multiplier: number, label: string, colorClass: string, bgBadge: string }}
 */
export function getPerformanceTier(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const tier = PERFORMANCE_TIERS.find(t => safeScore >= t.min && safeScore <= t.max);
  return tier || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
}

/**
 * Calculate Outstanding Contribution total with 500k maximum cap
 * @param {Array<{ id: string, name: string, amount: number, selected?: boolean }>} items
 * @returns {{ rawTotal: number, cappedBonus: number, isCapped: boolean, maxLimit: number }}
 */
export function calculateOutstandingBonus(items = []) {
  const rawTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const cappedBonus = Math.min(rawTotal, MAX_CONTRIBUTION_BONUS);
  const isCapped = rawTotal > MAX_CONTRIBUTION_BONUS;

  return {
    rawTotal,
    cappedBonus,
    isCapped,
    maxLimit: MAX_CONTRIBUTION_BONUS
  };
}

/**
 * Calculate Final Incentive
 * Formula: (Base Incentive * Performance Multiplier) + Outstanding Bonus
 * @param {number} baseIncentive
 * @param {number} multiplier
 * @param {number} outstandingBonus
 * @returns {{ performanceAdjusted: number, finalIncentive: number }}
 */
export function calculateFinalIncentive(baseIncentive, multiplier, outstandingBonus) {
  const base = Math.max(0, Number(baseIncentive) || 0);
  const mult = Math.max(0, Number(multiplier) || 0);
  const bonus = Math.max(0, Math.min(Number(outstandingBonus) || 0, MAX_CONTRIBUTION_BONUS));

  const performanceAdjusted = Math.round(base * mult);
  const finalIncentive = performanceAdjusted + bonus;

  return {
    performanceAdjusted,
    finalIncentive
  };
}

/**
 * Compute Milestone amounts based on final incentive and percentages
 * @param {Array<{ id: string, name: string, description: string, percentage: number }>} milestones
 * @param {number} finalIncentive
 * @returns {{ items: Array<{ id: string, name: string, description: string, percentage: number, amount: number }>, totalPercentage: number, isValid: boolean }}
 */
export function calculateMilestones(milestones = [], finalIncentive = 0) {
  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const safeTotalPercentage = Math.round(totalPercentage * 100) / 100;
  const isValid = safeTotalPercentage === 100;

  const items = milestones.map(m => {
    const pct = Number(m.percentage) || 0;
    const amount = Math.round((finalIncentive * pct) / 100);
    return {
      ...m,
      percentage: pct,
      amount
    };
  });

  return {
    items,
    totalPercentage: safeTotalPercentage,
    isValid
  };
}

/**
 * Perform all calculation steps synchronously for a calculation object
 * @param {Object} data
 * @returns {Object} enriched with computed fields
 */
export function computeFullCalculation(data) {
  const complexity = data.complexity || 'medium';
  const defaultBase = COMPLEXITY_CONFIG[complexity]?.defaultBase || 1000000;
  const baseIncentive = data.baseIncentive !== undefined ? Number(data.baseIncentive) : defaultBase;

  const performanceScore = calculatePerformanceScore(data.performance || {});
  const tier = getPerformanceTier(performanceScore);
  const performanceMultiplier = tier.multiplier;

  const contributions = data.outstandingContributions || [];
  const { cappedBonus, rawTotal, isCapped } = calculateOutstandingBonus(contributions);

  const { performanceAdjusted, finalIncentive } = calculateFinalIncentive(
    baseIncentive,
    performanceMultiplier,
    cappedBonus
  );

  const rawMilestones = data.milestones || [];
  const { items: computedMilestones, totalPercentage: milestoneTotalPct, isValid: isMilestoneValid } = calculateMilestones(
    rawMilestones,
    finalIncentive
  );

  const duration = calculateDuration(data.startDate, data.endDate);

  return {
    ...data,
    complexity,
    baseIncentive,
    performanceScore,
    performanceTier: tier.label,
    performanceTierBadge: tier.bgBadge,
    performanceMultiplier,
    outstandingContributions: contributions,
    outstandingRawTotal: rawTotal,
    outstandingBonus: cappedBonus,
    isOutstandingCapped: isCapped,
    performanceAdjusted,
    finalIncentive,
    milestones: computedMilestones,
    milestoneTotalPct,
    isMilestoneValid,
    durationFormatted: duration.formatted,
    durationTotalDays: duration.totalDays
  };
}

/**
 * Generate clean formatted text/markdown summary suitable for GDocs, MS Word, Notion
 * @param {Object} item
 * @returns {string}
 */
export function generateFormattedSummaryText(item) {
  const calc = computeFullCalculation(item);
  
  const lines = [
    `# SPINOTEK INTERNSHIP INCENTIVE STATEMENT`,
    `PT Spinotek Inovasi Digital`,
    `Ref: ${calc.id || 'Draft'} | Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ``,
    `--------------------------------------------------`,
    `📌 INFORMASI PEMAGANG & PROJECT`,
    `• Nama Pemagang   : ${calc.internName || '-'}`,
    `• Nama Project    : ${calc.projectName || '-'}`,
    `• Client          : ${calc.clientName || 'Internal Spinotek'}`,
    `• Nilai Project   : ${formatCurrency(calc.projectValue)}`,
    `• Durasi Project  : ${calc.startDate || '-'} s/d ${calc.endDate || '-'} (${calc.durationFormatted || '-'})`,
    `• Kompleksitas    : ${(calc.complexity || 'MEDIUM').toUpperCase()}`,
    ``,
    `--------------------------------------------------`,
    `📊 EVALUASI PERFORMA PEMAGANG`,
    `1. Kecepatan & Ketepatan (25%)        : ${calc.performance?.speed ?? 0} (Skor Tertimbang: ${((calc.performance?.speed ?? 0) * 0.25).toFixed(2)})`,
    `2. Kualitas Hasil (30%)               : ${calc.performance?.quality ?? 0} (Skor Tertimbang: ${((calc.performance?.quality ?? 0) * 0.30).toFixed(2)})`,
    `3. Inisiatif & Problem Solving (25%)  : ${calc.performance?.initiative ?? 0} (Skor Tertimbang: ${((calc.performance?.initiative ?? 0) * 0.25).toFixed(2)})`,
    `4. Responsibility (20%)               : ${calc.performance?.responsibility ?? 0} (Skor Tertimbang: ${((calc.performance?.responsibility ?? 0) * 0.20).toFixed(2)})`,
    `• Total Skor Performa : ${calc.performanceScore.toFixed(2)} / 100`,
    `• Kategori Performa   : ${calc.performanceTier} (Multiplier ${(calc.performanceMultiplier * 100).toFixed(0)}%)`,
    ``,
    `--------------------------------------------------`,
    `🌟 OUTSTANDING CONTRIBUTION BONUS`,
    ...(calc.outstandingContributions && calc.outstandingContributions.length > 0
      ? calc.outstandingContributions.map(c => `• ${c.name} : ${formatCurrency(c.amount)}`)
      : [`• (Tidak ada bonus kontribusi tambahan)`]
    ),
    `• Total Bonus (Maks Rp500.000) : ${formatCurrency(calc.outstandingBonus)}`,
    ``,
    `--------------------------------------------------`,
    `💰 RINCIAN KALKULASI INSENTIF`,
    `• Base Incentive       : ${formatCurrency(calc.baseIncentive)}`,
    `• × Multiplier Performa: ${(calc.performanceMultiplier * 100).toFixed(0)}%`,
    `• = Adjusted Incentive : ${formatCurrency(calc.performanceAdjusted)}`,
    `• + Bonus Kontribusi   : ${formatCurrency(calc.outstandingBonus)}`,
    `--------------------------------------------------`,
    `🏆 FINAL INCENTIVE     : ${formatCurrency(calc.finalIncentive)}`,
    `--------------------------------------------------`,
    ``,
    `🗓️ JADWAL PENCAIRAN (MILESTONE)`,
    ...(calc.milestones && calc.milestones.length > 0
      ? calc.milestones.map((m, idx) => `${idx + 1}. ${m.name} (${m.percentage}%) : ${formatCurrency(m.amount)}${m.description ? ` — ${m.description}` : ''}`)
      : [`• (Belum ada jadwal milestone)`]
    ),
    `• Total Alokasi Milestone: ${calc.milestoneTotalPct}% (${formatCurrency(calc.finalIncentive)})`,
    `--------------------------------------------------`
  ];

  return lines.join('\n');
}

/**
 * Universal clipboard copy helper with fallback
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Navigator clipboard failed, using fallback:', err);
    }
  }

  // Fallback using textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

