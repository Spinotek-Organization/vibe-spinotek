/**
 * Spinotek Internship Incentive System - Calculation & Helper Library
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
 * Format month/period range from start and end dates (e.g. "Agustus – September 2026" or "Agustus 2026")
 * @param {string} startStr
 * @param {string} endStr
 * @returns {string}
 */
export function formatMonthRange(startStr, endStr) {
  if (!startStr && !endStr) return '';

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const start = startStr ? new Date(startStr) : null;
  const end = endStr ? new Date(endStr) : null;

  const validStart = start && !isNaN(start.getTime());
  const validEnd = end && !isNaN(end.getTime());

  if (validStart && validEnd) {
    const startMonth = monthNames[start.getMonth()];
    const startYear = start.getFullYear();
    const endMonth = monthNames[end.getMonth()];
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} – ${endMonth} ${startYear}`;
    }
    return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
  } else if (validStart) {
    return `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  } else if (validEnd) {
    return `${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }

  return '';
}

/**
 * Get monthly payout period name for a milestone index based on start date
 * @param {number} index 0-indexed milestone step
 * @param {string} startDateStr
 * @returns {string} e.g. "Agustus 2026" or "Bulan ke-1"
 */
export function getMilestonePeriodName(index, startDateStr) {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (!startDateStr) {
    return `Bulan ke-${index + 1}`;
  }

  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    return `Bulan ke-${index + 1}`;
  }

  const targetDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
  const targetMonth = monthNames[targetDate.getMonth()];
  const targetYear = targetDate.getFullYear();

  return `${targetMonth} ${targetYear}`;
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

  const enrichedMilestones = computedMilestones.map((m, idx) => ({
    ...m,
    periodLabel: getMilestonePeriodName(idx, data.startDate)
  }));

  const duration = calculateDuration(data.startDate, data.endDate);
  const monthRangeFormatted = formatMonthRange(data.startDate, data.endDate);

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
    milestones: enrichedMilestones,
    milestoneTotalPct,
    isMilestoneValid,
    durationFormatted: duration.formatted,
    durationTotalDays: duration.totalDays,
    monthRangeFormatted
  };
}

/**
 * Generate clean Markdown summary for plain text / markdown editors
 * @param {Object} item
 * @returns {string}
 */
export function generateFormattedSummaryText(item) {
  const calc = computeFullCalculation(item);
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const lines = [
    `# 📋 SPINOTEK INTERNSHIP INCENTIVE STATEMENT`,
    `PT Spektrum Inovasi Teknologi`,
    `Ref ID: ${calc.id || 'Draft'} | Tanggal Dokumen: ${dateStr}`,
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
    `1. Kecepatan & Ketepatan Kerja (25%)  : ${calc.performance?.speed ?? 0} (Skor: ${((calc.performance?.speed ?? 0) * 0.25).toFixed(2)})`,
    `2. Kualitas & Kerapian Hasil (30%)    : ${calc.performance?.quality ?? 0} (Skor: ${((calc.performance?.quality ?? 0) * 0.30).toFixed(2)})`,
    `3. Inisiatif & Problem Solving (25%) : ${calc.performance?.initiative ?? 0} (Skor: ${((calc.performance?.initiative ?? 0) * 0.25).toFixed(2)})`,
    `4. Responsibility & Komunikasi (20%) : ${calc.performance?.responsibility ?? 0} (Skor: ${((calc.performance?.responsibility ?? 0) * 0.20).toFixed(2)})`,
    `• Total Skor Performa : ${calc.performanceScore.toFixed(2)} / 100`,
    `• Kategori Performa   : ${calc.performanceTier} (Multiplier ${(calc.performanceMultiplier * 100).toFixed(0)}%)`,
    ``,
    `--------------------------------------------------`,
    `🌟 OUTSTANDING CONTRIBUTION BONUS`,
    ...(calc.outstandingContributions && calc.outstandingContributions.length > 0
      ? calc.outstandingContributions.map(c => `• ${c.name} : ${formatCurrency(c.amount)}`)
      : [`• (Tidak ada bonus kontribusi tambahan)`]
    ),
    `• Total Bonus Kontribusi : ${formatCurrency(calc.outstandingBonus)} (Maks. Rp500.000)`,
    ``,
    `--------------------------------------------------`,
    `💰 RINCIAN KALKULASI INSENTIF`,
    `• Base Incentive       : ${formatCurrency(calc.baseIncentive)}`,
    `• × Multiplier Performa: ${(calc.performanceMultiplier * 100).toFixed(0)}% (${calc.performanceTier})`,
    `• = Adjusted Incentive : ${formatCurrency(calc.performanceAdjusted)}`,
    `• + Bonus Kontribusi   : + ${formatCurrency(calc.outstandingBonus)}`,
    `--------------------------------------------------`,
    `🏆 TOTAL FINAL INCENTIVE : ${formatCurrency(calc.finalIncentive)}`,
    `--------------------------------------------------`,
    ``,
    `🗓️ JADWAL PENCAIRAN (MILESTONE${calc.monthRangeFormatted ? ` — ${calc.monthRangeFormatted.toUpperCase()}` : ''})`,
    ...(calc.milestones && calc.milestones.length > 0
      ? calc.milestones.map((m, idx) => `${idx + 1}. ${m.name} [Periode: ${m.periodLabel || `Bulan ke-${idx + 1}`}] (${m.percentage}%) : ${formatCurrency(m.amount)}${m.description ? ` — ${m.description}` : ''}`)
      : [`• (Belum ada jadwal pencairan milestone)`]
    ),
    `• Total Alokasi Milestone: ${calc.milestoneTotalPct}% (${formatCurrency(calc.finalIncentive)})`,
    `--------------------------------------------------`,
    `Dokumen digenerate otomatis oleh Spinotek Internship Incentive System.`
  ];

  return lines.join('\n');
}

/**
 * Generate rich HTML summary formatted with real styled tables for Google Docs, Notion, Word & Gmail
 * @param {Object} item
 * @returns {string}
 */
export function generateFormattedSummaryHTML(item) {
  const calc = computeFullCalculation(item);
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 800px; line-height: 1.5; font-size: 13px;">
  
  <!-- Header Statement -->
  <div style="margin-bottom: 20px;">
    <h2 style="color: #0066ff; margin: 0 0 4px 0; font-size: 20px; font-weight: bold;">📋 Spinotek Internship Incentive Statement</h2>
    <div style="color: #64748b; font-size: 12px;">
      <strong>PT Spektrum Inovasi Teknologi</strong> &bull; <em>Ref ID: ${calc.id || 'Draft'} &bull; Tanggal: ${dateStr}</em>
    </div>
  </div>

  <hr style="border: none; border-top: 1.5px solid #cbd5e1; margin: 16px 0 24px 0;" />

  <!-- SECTION 1: Informasi Pemagang & Project -->
  <div style="margin-bottom: 28px;">
    <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px;">📌 Informasi Pemagang &amp; Project</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1;">
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; width: 35%; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Nama Pemagang</td><td style="padding: 8px 12px; font-weight: bold;">${calc.internName || '-'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Nama Project</td><td style="padding: 8px 12px;">${calc.projectName || '-'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Client</td><td style="padding: 8px 12px;">${calc.clientName || 'Internal Spinotek'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Nilai Project</td><td style="padding: 8px 12px; font-weight: bold; color: #0066ff;">${formatCurrency(calc.projectValue)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Durasi Project</td><td style="padding: 8px 12px;">${calc.startDate || '-'} s/d ${calc.endDate || '-'} (${calc.durationFormatted || '-'})</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Kompleksitas</td><td style="padding: 8px 12px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${(calc.complexity || 'MEDIUM').toUpperCase()}</span></td></tr>
      </tbody>
    </table>
  </div>

  <p style="margin: 0; font-size: 6px; line-height: 6px;">&nbsp;</p>

  <!-- SECTION 2: Evaluasi Performa Pemagang -->
  <div style="margin-bottom: 28px;">
    <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px;">📊 Evaluasi Performa Pemagang</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; border: 1px solid #cbd5e1;">
      <thead>
        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <th style="padding: 8px 10px; text-align: center; width: 40px; border-right: 1px solid #cbd5e1;">No</th>
          <th style="padding: 8px 12px; text-align: left; border-right: 1px solid #cbd5e1;">Kriteria Evaluasi</th>
          <th style="padding: 8px 10px; text-align: center; width: 80px; border-right: 1px solid #cbd5e1;">Bobot</th>
          <th style="padding: 8px 10px; text-align: center; width: 70px; border-right: 1px solid #cbd5e1;">Nilai</th>
          <th style="padding: 8px 12px; text-align: right; width: 120px;">Skor Tertimbang</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">1</td><td style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Kecepatan &amp; Ketepatan Kerja</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">25%</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${calc.performance?.speed ?? 0}</td><td style="padding: 8px 12px; text-align: right;">${((calc.performance?.speed ?? 0) * 0.25).toFixed(2)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">2</td><td style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Kualitas &amp; Kerapian Hasil</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">30%</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${calc.performance?.quality ?? 0}</td><td style="padding: 8px 12px; text-align: right;">${((calc.performance?.quality ?? 0) * 0.30).toFixed(2)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">3</td><td style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Inisiatif &amp; Problem Solving</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">25%</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${calc.performance?.initiative ?? 0}</td><td style="padding: 8px 12px; text-align: right;">${((calc.performance?.initiative ?? 0) * 0.25).toFixed(2)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">4</td><td style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Responsibility &amp; Komunikasi</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">20%</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${calc.performance?.responsibility ?? 0}</td><td style="padding: 8px 12px; text-align: right;">${((calc.performance?.responsibility ?? 0) * 0.20).toFixed(2)}</td></tr>
        <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #cbd5e1;"><td colspan="2" style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Total Skor Performa</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">100%</td><td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">-</td><td style="padding: 8px 12px; text-align: right; color: #0066ff;">${calc.performanceScore.toFixed(2)} / 100</td></tr>
      </tbody>
    </table>

    <div style="background: #eff6ff; border-left: 4px solid #0066ff; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-top: 8px;">
      🏆 <strong>Kategori Performa:</strong> ${calc.performanceTier} &bull; <strong>Multiplier Insentif:</strong> ${(calc.performanceMultiplier * 100).toFixed(0)}%
    </div>
  </div>

  <p style="margin: 0; font-size: 6px; line-height: 6px;">&nbsp;</p>

  <!-- SECTION 3: Outstanding Contribution Bonus -->
  <div style="margin-bottom: 28px;">
    <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px;">🌟 Outstanding Contribution Bonus</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1;">
      <tbody>
        ${
          calc.outstandingContributions && calc.outstandingContributions.length > 0
            ? calc.outstandingContributions.map(c => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 12px; width: 60%; background: #f8fafc; border-right: 1px solid #e2e8f0;"><strong>${c.name}</strong></td>
                <td style="padding: 8px 12px; text-align: right; color: #047857; font-weight: bold;">+ ${formatCurrency(c.amount)}</td>
              </tr>
            `).join('')
            : `<tr><td colspan="2" style="padding: 8px 12px; color: #64748b; font-style: italic; background: #ffffff;">(Tidak ada bonus kontribusi tambahan)</td></tr>`
        }
        <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #cbd5e1;">
          <td style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Total Bonus Kontribusi (Maks. Rp500.000)</td>
          <td style="padding: 8px 12px; text-align: right; color: #0066ff;">${formatCurrency(calc.outstandingBonus)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p style="margin: 0; font-size: 6px; line-height: 6px;">&nbsp;</p>

  <!-- SECTION 4: Rincian Kalkulasi Insentif -->
  <div style="margin-bottom: 28px;">
    <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px;">💰 Rincian Kalkulasi Insentif</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1;">
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; width: 40%; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Base Incentive</td><td style="padding: 8px 12px;">${formatCurrency(calc.baseIncentive)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Multiplier Performa</td><td style="padding: 8px 12px;">${(calc.performanceMultiplier * 100).toFixed(0)}% (${calc.performanceTier})</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Adjusted Incentive</td><td style="padding: 8px 12px;">${formatCurrency(calc.performanceAdjusted)}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; font-weight: bold; background: #f8fafc; border-right: 1px solid #e2e8f0;">Bonus Kontribusi</td><td style="padding: 8px 12px;">+ ${formatCurrency(calc.outstandingBonus)}</td></tr>
        <tr style="background: #eff6ff; font-weight: bold; font-size: 14px; border-top: 2px solid #3b82f6;"><td style="padding: 10px 12px; color: #1d4ed8; border-right: 1px solid #93c5fd;">🎯 TOTAL FINAL INCENTIVE</td><td style="padding: 10px 12px; color: #1d4ed8;">${formatCurrency(calc.finalIncentive)}</td></tr>
      </tbody>
    </table>
  </div>

  <p style="margin: 0; font-size: 6px; line-height: 6px;">&nbsp;</p>

  <!-- SECTION 5: Jadwal Pencairan (Milestone) -->
  <div style="margin-bottom: 28px;">
    <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px;">🗓️ Jadwal Pencairan (Milestone${calc.monthRangeFormatted ? ` — ${calc.monthRangeFormatted}` : ''})</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1;">
      <thead>
        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <th style="padding: 8px 10px; text-align: center; width: 40px; border-right: 1px solid #cbd5e1;">Tahap</th>
          <th style="padding: 8px 12px; text-align: left; border-right: 1px solid #cbd5e1;">Nama Milestone</th>
          <th style="padding: 8px 10px; text-align: center; width: 110px; border-right: 1px solid #cbd5e1;">Periode Cair</th>
          <th style="padding: 8px 10px; text-align: center; width: 70px; border-right: 1px solid #cbd5e1;">Alokasi</th>
          <th style="padding: 8px 12px; text-align: right; width: 130px; border-right: 1px solid #cbd5e1;">Jumlah (Rp)</th>
          <th style="padding: 8px 12px; text-align: left;">Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${
          calc.milestones && calc.milestones.length > 0
            ? calc.milestones.map((m, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${idx + 1}</td>
                <td style="padding: 8px 12px; font-weight: bold; border-right: 1px solid #e2e8f0;">${m.name}</td>
                <td style="padding: 8px 10px; text-align: center; color: #334155; border-right: 1px solid #e2e8f0;">${m.periodLabel || `Bulan ke-${idx + 1}`}</td>
                <td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${m.percentage}%</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #0066ff; border-right: 1px solid #e2e8f0;">${formatCurrency(m.amount)}</td>
                <td style="padding: 8px 12px; color: #64748b;">${m.description || '-'}</td>
              </tr>
            `).join('')
            : `<tr><td colspan="6" style="padding: 8px 12px; text-align: center; color: #64748b;">(Belum ada jadwal milestone)</td></tr>`
        }
        <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #cbd5e1;">
          <td colspan="3" style="padding: 8px 12px; border-right: 1px solid #e2e8f0;">Total Alokasi Milestone Bulanan</td>
          <td style="padding: 8px 10px; text-align: center; border-right: 1px solid #e2e8f0;">${calc.milestoneTotalPct}%</td>
          <td style="padding: 8px 12px; text-align: right; color: #0066ff; border-right: 1px solid #e2e8f0;">${formatCurrency(calc.finalIncentive)}</td>
          <td style="padding: 8px 12px; color: #047857;">100% Sesuai Total Insentif</td>
        </tr>
      </tbody>
    </table>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 12px 0;" />
  <div style="font-size: 11px; color: #94a3b8; text-align: center;">
    Generated automatically by Spinotek Internship Incentive System.
  </div>
</div>
  `.trim();
}

/**
 * Modern rich clipboard copy helper that injects BOTH text/html and text/plain
 * Guarantees beautiful formatted tables in Google Docs, Notion, Word, and clean text in Notepad/Slack
 * @param {Object} item
 * @returns {Promise<boolean>}
 */
export async function copyFormattedSummary(item) {
  const plainText = generateFormattedSummaryText(item);
  const htmlContent = generateFormattedSummaryHTML(item);

  if (navigator.clipboard && window.isSecureContext && typeof ClipboardItem !== 'undefined') {
    try {
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': blobText,
          'text/html': blobHtml
        })
      ]);
      return true;
    } catch (err) {
      console.warn('Rich clipboard write failed, falling back to writeText:', err);
    }
  }

  // Fallback to standard copy
  return await copyTextToClipboard(plainText);
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

