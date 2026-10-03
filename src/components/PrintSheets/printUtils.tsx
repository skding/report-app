import React from 'react';

/**
 * Renders multiline text cleanly using <br /> elements instead of CSS whitespace-pre-line.
 * This completely avoids the html2canvas bug where whitespace-pre-line adds an extra line/paragraph gap.
 */
export function renderMultilineText(text?: string | null, fallback = '—'): React.ReactNode {
  const content = (text || '').trim();
  if (!content) {
    return <span className="text-slate-400 italic">{fallback}</span>;
  }
  const lines = content.split(/\r?\n/);
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {idx > 0 && <br />}
      {line.trim() || '\u00A0'}
    </React.Fragment>
  ));
}

/**
 * Formats a date string or Date object cleanly as DD/MM/YYYY without timezone shift issues.
 */
export function formatPrintDate(dateVal?: string | Date | null, fallback = '—'): string {
  if (!dateVal) return fallback;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-');
      return `${d}/${m}/${y}`;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      const datePart = trimmed.split('T')[0];
      const [y, m, d] = datePart.split('-');
      return `${d}/${m}/${y}`;
    }
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-GB');
  } catch {
    return fallback;
  }
}
