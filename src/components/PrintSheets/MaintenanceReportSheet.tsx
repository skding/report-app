'use client';

import React from 'react';
import PrintHeader from './PrintHeader';
import { FullReport, MaintenanceReportData, ChecklistSection } from '@/lib/types';

interface MaintenanceReportSheetProps {
  report: FullReport;
  templateSections?: ChecklistSection[];
}

export default function MaintenanceReportSheet({
  report,
  templateSections = [],
}: MaintenanceReportSheetProps) {
  const data = (report.data || {}) as MaintenanceReportData;
  const responses = data.checklistResponses || {};
  const attendanceFormatted = report.attendanceDate
    ? new Date(report.attendanceDate).toLocaleDateString('en-GB')
    : new Date(report.reportDate).toLocaleDateString('en-GB');

  return (
    <div className="bg-white text-slate-900 p-6 md:p-8 font-sans max-w-[820px] mx-auto text-[11px] leading-normal shadow-lg border border-slate-200">
      <PrintHeader
        reportTitle="Preventive Maintenance Report"
        reportNumber={report.reportNumber}
        reportTypePrefix="PMR No."
      />

      {/* Meta Grid Table */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Customer:
            </td>
            <td className="w-2/6 p-2 border border-slate-400 font-semibold text-slate-950">
              {report.customer?.name || 'TNB Engineering Corporation Sdn Bhd'}
            </td>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Date / Attendance:
            </td>
            <td className="w-2/6 p-2 border border-slate-400 font-medium">
              {attendanceFormatted}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Site Location:
            </td>
            <td className="p-2 border border-slate-400">
              {report.site?.name || 'IJN Chiller Plant'}
            </td>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Lead Engineer:
            </td>
            <td className="p-2 border border-slate-400">
              {report.engineerName || report.author?.name || 'SK Ding'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Intro Note */}
      <div className="bg-slate-50 border border-slate-300 p-2.5 mb-4 text-[10px] text-slate-700 italic">
        <strong>1. Step By Step Preventive Maintenance Procedure:</strong> The following step-by-step
        procedure has to be followed closely. The measuring results have to be noted at section 2 or attached drawings. Specific system PM checks can be inserted in section 1.7 during PM if necessary.
      </div>

      {/* Checklist Sections */}
      {templateSections.map((section, sIdx) => (
        <div key={section.id || sIdx} className="mb-4 avoid-break">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>
              {section.code || `1.${sIdx + 1}`} &nbsp; {section.title}
            </span>
          </div>

          {section.instructions && (
            <div className="bg-slate-100 border-x border-slate-400 px-2.5 py-1 text-[10px] text-slate-600 italic">
              {section.instructions}
            </div>
          )}

          <table className="w-full border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-200/80 text-slate-900 border-b border-slate-400">
                <th className="p-1.5 text-left border border-slate-400 w-10">No.</th>
                <th className="p-1.5 text-left border border-slate-400">Procedure / Test Item</th>
                {section.items.some((i) => i.type === 'measurement') && (
                  <th className="p-1.5 text-center border border-slate-400 w-28">Measured Value</th>
                )}
                <th className="p-1.5 text-center border border-slate-400 w-24">Status</th>
                <th className="p-1.5 text-left border border-slate-400 w-44">Remarks / Findings</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, iIdx) => {
                const res = responses[item.id] || {};
                const status = res.status || 'OK';
                return (
                  <tr
                    key={item.id || iIdx}
                    className={`border-b border-slate-300 ${
                      status === 'PL' ? 'bg-amber-50/70' : iIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="p-1.5 text-center border border-slate-400 font-mono text-slate-600">
                      {String.fromCharCode(97 + (iIdx % 26))}
                    </td>
                    <td className="p-1.5 border border-slate-400 font-medium text-slate-800">
                      {item.text}
                      {item.spec && (
                        <span className="text-[9px] text-slate-500 block font-normal">
                          Spec: {item.spec}
                        </span>
                      )}
                    </td>
                    {section.items.some((i) => i.type === 'measurement') && (
                      <td className="p-1.5 text-center border border-slate-400 font-mono font-bold">
                        {item.type === 'measurement' ? (
                          res.value ? `${res.value} ${item.unit || 'Vdc'}` : '24.0 Vdc'
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    <td className="p-1.5 text-center border border-slate-400 font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                          status === 'OK'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : status === 'PL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-1.5 border border-slate-400 text-slate-700 text-[10px]">
                      {res.remarks || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Ad-hoc Custom Checks if technician added any */}
      {data.customChecklistItems && data.customChecklistItems.length > 0 && (
        <div className="mb-4 avoid-break">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
            1.7 System Specific Checks (On-Site Additions)
          </div>
          <table className="w-full border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-200 text-slate-900 border-b border-slate-400">
                <th className="p-1.5 text-left border border-slate-400 w-10">No.</th>
                <th className="p-1.5 text-left border border-slate-400">Description</th>
                <th className="p-1.5 text-center border border-slate-400 w-24">Status</th>
                <th className="p-1.5 text-left border border-slate-400 w-44">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.customChecklistItems.map((cItem, cIdx) => (
                <tr key={cIdx} className="border-b border-slate-300">
                  <td className="p-1.5 text-center border border-slate-400 font-mono">
                    {String.fromCharCode(97 + cIdx)}
                  </td>
                  <td className="p-1.5 border border-slate-400">{cItem.text}</td>
                  <td className="p-1.5 text-center border border-slate-400 font-bold">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {cItem.status}
                    </span>
                  </td>
                  <td className="p-1.5 border border-slate-400">{cItem.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 2: Concerns & Suggestions */}
      <div className="mb-4 avoid-break">
        <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
          2. Concerns & Suggestions
        </div>
        <div className="border border-slate-400 border-t-0 p-3 bg-white min-h-[90px] whitespace-pre-line text-slate-800 text-justify">
          {data.concernsAndSuggestions ||
            'System is operating in healthy condition. Recommended to perform regular quarterly backup of SCADA runtime database and PLC controllers.'}
        </div>
      </div>

      {/* Section 3: Reporting Notice */}
      <div className="bg-slate-50 border border-slate-300 p-2 mb-4 text-[10px] text-slate-700 italic">
        <strong>3. Reporting Notice:</strong> Submit this document together with relevant service report to
        the client. Feedback immediately to CDSB Product Support if there are any critical failures including system, electrical and mechanical.
      </div>

      {/* Attached Photos */}
      {report.photos && report.photos.length > 0 && (
        <div className="mb-4 page-break-inside-avoid">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider mb-2">
            Site Maintenance Photos ({report.photos.length})
          </div>
          <div className="grid grid-cols-2 gap-3 border border-slate-300 p-2 rounded">
            {report.photos.map((photo, idx) => (
              <div key={idx} className="border border-slate-200 p-1.5 bg-slate-50 flex flex-col items-center">
                <div className="h-44 w-full flex items-center justify-center bg-white overflow-hidden border border-slate-200">
                  <img
                    src={photo.url}
                    alt={photo.caption || `PM Photo ${idx + 1}`}
                    className="max-h-44 max-w-full object-contain"
                  />
                </div>
                {photo.caption && (
                  <p className="text-[10px] font-medium text-slate-700 mt-1 text-center truncate w-full">
                    Fig {idx + 1}: {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dual Signatures */}
      <div className="mt-6 border-t-2 border-slate-400 pt-3 avoid-break">
        <div className="grid grid-cols-2 gap-6">
          {/* Attended By (Engineer) */}
          <div className="border border-slate-400 p-3 bg-slate-50/50 flex flex-col justify-between h-44">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
                Attended By:
              </p>
              <p className="text-[10px] text-slate-600">Engineer's Signature</p>
            </div>

            <div className="flex-1 flex items-center justify-center my-1">
              {report.engineerSignature ? (
                <img
                  src={report.engineerSignature}
                  alt="Engineer Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">[Pending Engineer Signature]</span>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px]">
              <p><strong>Name:</strong> {report.engineerName || report.author?.name || 'SK Ding'}</p>
              <p>
                <strong>Date:</strong>{' '}
                {report.engineerSignedAt
                  ? new Date(report.engineerSignedAt).toLocaleDateString('en-GB')
                  : attendanceFormatted}
              </p>
            </div>
          </div>

          {/* Customer Signature */}
          <div className="border border-slate-400 p-3 bg-slate-50/50 flex flex-col justify-between h-44">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
                Verified By:
              </p>
              <p className="text-[10px] text-slate-600">Customer's Signature</p>
            </div>

            <div className="flex-1 flex items-center justify-center my-1">
              {report.customerSignature ? (
                <img
                  src={report.customerSignature}
                  alt="Customer Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">[Pending Customer Signature]</span>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px]">
              <p>
                <strong>Name:</strong> {report.customerName || report.customer?.contactPerson || '—'}
                {report.customerDesignation ? ` (${report.customerDesignation})` : ''}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {report.customerSignedAt
                  ? new Date(report.customerSignedAt).toLocaleDateString('en-GB')
                  : attendanceFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Footer */}
      <div className="mt-4 pt-2 text-center text-[9px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
        <span>Clover Digital Sdn Bhd</span>
        <span>End of Preventive Maintenance Document</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
