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
