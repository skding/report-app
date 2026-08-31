'use client';

import React from 'react';

interface PrintHeaderProps {
  reportTitle: string;
  reportNumber: string;
  reportTypePrefix: string; // e.g. "ESR No." or "DSR No." or "PMR No."
}

export default function PrintHeader({
  reportTitle,
  reportNumber,
  reportTypePrefix,
}: PrintHeaderProps) {
  return (
    <div className="border-b-2 border-slate-900 pb-3 mb-4">
      <div className="flex items-start justify-between">
        {/* Left: Logo & Company Address */}
        <div className="flex items-center gap-3.5">
          <div className="w-40 h-14 flex items-center justify-start">
            <img
              src="/cloverdigital-logo.png"
              alt="Clover Digital"
              className="max-h-12 max-w-full object-contain"
            />
          </div>
          <div className="text-[11px] leading-tight text-slate-800 border-l border-slate-300 pl-3">
            <h2 className="font-bold text-[13px] text-slate-950">
              Clover Digital Sdn Bhd <span className="text-[10px] font-normal text-slate-600">(Co. Reg. 201501034912)</span>
            </h2>
            <p className="text-slate-600 mt-0.5">
              7A Jalan PP2/1, Taman Putra Prima, 47100 Puchong, Selangor
            </p>
            <p className="text-slate-600">
              admin@cloverdigital.com.my &nbsp;|&nbsp; www.cloverdigital.com.my
            </p>
          </div>
        </div>

        {/* Right: Document Reference */}
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded tracking-wider uppercase">
            {reportTypePrefix}: {reportNumber}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Official Site Technical Record</p>
        </div>
      </div>

      {/* Main Document Title */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
        <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
          {reportTitle}
        </h1>
      </div>
    </div>
  );
}
