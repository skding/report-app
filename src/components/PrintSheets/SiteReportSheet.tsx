'use client';

import React from 'react';
import PrintHeader from './PrintHeader';
import { FullReport, SiteReportData } from '@/lib/types';

interface SiteReportSheetProps {
  report: FullReport;
}

export default function SiteReportSheet({ report }: SiteReportSheetProps) {
  const data = (report.data || {}) as SiteReportData;
  const attendanceFormatted = report.attendanceDate
    ? new Date(report.attendanceDate).toLocaleDateString('en-GB')
    : new Date(report.reportDate).toLocaleDateString('en-GB');

  return (
    <div className="bg-white text-slate-900 p-6 md:p-8 font-sans max-w-[820px] mx-auto text-[11px] leading-normal shadow-lg border border-slate-200">
      <PrintHeader
        reportTitle="Daily Site / Remote Technical Support Report"
        reportNumber={report.reportNumber}
        reportTypePrefix="DSR No."
      />

      {/* Meta Grid Table */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Project Title:
            </td>
            <td className="w-2/6 p-2 border border-slate-400 font-semibold text-slate-950">
              {report.title || 'CAOP INDONESIA PROJECT'}
            </td>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Person In-Charge:
            </td>
            <td className="w-2/6 p-2 border border-slate-400">
              {data.personInCharge || report.engineerName || report.author?.name || 'SK Ding'}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Project Code:
            </td>
            <td className="p-2 border border-slate-400 font-mono font-medium">
              {report.projectCode || '—'}
            </td>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Customer:
            </td>
            <td className="p-2 border border-slate-400 font-semibold">
              {report.customer?.name || 'KAWAN ENGINEERING SDN BHD'}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Site Location:
            </td>
            <td className="p-2 border border-slate-400">
              {report.site?.name || 'PANGKALAN BUN, INDONESIA'}
            </td>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Contact/Email:
            </td>
            <td className="p-2 border border-slate-400">
              {report.site?.contactEmail || report.customer?.email || report.customer?.contactPerson || '—'}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Date / Attendance:
            </td>
            <td className="p-2 border border-slate-400 font-medium">
              {attendanceFormatted}
            </td>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Time & Hours:
            </td>
            <td className="p-2 border border-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  <strong>Time:</strong> {report.startTime || '08:30'} - {report.endTime || '18:30'}
                </span>
                <span>
                  <strong>Normal:</strong> {report.normalHours || 8}h
                </span>
                <span>
                  <strong>OT:</strong> {report.otHours || 0}h
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Work Description Section */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
          Work Description / Activity Log
        </div>
        <div className="border border-slate-400 border-t-0 p-3 bg-white min-h-[220px] whitespace-pre-line text-slate-800 text-justify leading-relaxed">
          {data.workDescription || 'No work description entered.'}
        </div>
      </div>

      {/* Follow up / Next actions if any */}
      {(data.siteNotes || data.nextActionRequired || data.followUpDate) && (
        <div className="mb-4">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
            Site Notes & Follow-Up Requirements
          </div>
          <div className="border border-slate-400 border-t-0 p-3 bg-slate-50/50 text-slate-800 space-y-1">
            {data.nextActionRequired && (
              <p><strong>Next Action:</strong> {data.nextActionRequired}</p>
            )}
            {data.followUpDate && (
              <p><strong>Target Date:</strong> {data.followUpDate}</p>
            )}
            {data.siteNotes && (
              <p className="whitespace-pre-line"><strong>Notes:</strong> {data.siteNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* Attached Photos */}
      {report.photos && report.photos.length > 0 && (
        <div className="mb-4 page-break-inside-avoid">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider mb-2">
            Site Photos & Engineering Work Evidence ({report.photos.length})
          </div>
          <div className="grid grid-cols-2 gap-3 border border-slate-300 p-2 rounded">
            {report.photos.map((photo, idx) => (
              <div key={idx} className="border border-slate-200 p-1.5 bg-slate-50 flex flex-col items-center">
                <div className="h-44 w-full flex items-center justify-center bg-white overflow-hidden border border-slate-200">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Site Photo ${idx + 1}`}
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

      {/* Acceptance / Verification Dual Signatures */}
      <div className="mt-6 border-t-2 border-slate-400 pt-3 avoid-break">
        <div className="mb-2 font-bold text-xs uppercase tracking-wider text-slate-900">
          Acceptance / Verification
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Witness by */}
          <div className="border border-slate-400 p-3 bg-slate-50/50 flex flex-col justify-between h-44">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
                Witnessed By:
              </p>
              <p className="text-[10px] text-slate-600">Client / Site Operations</p>
            </div>

            <div className="flex-1 flex items-center justify-center my-1">
              {report.customerSignature ? (
                <img
                  src={report.customerSignature}
                  alt="Witness Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">[Pending Witness Signature]</span>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px]">
              <p>
                <strong>Name:</strong> {report.customerName || data.witnessName || '—'}
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

          {/* Verified by (Engineer) */}
          <div className="border border-slate-400 p-3 bg-slate-50/50 flex flex-col justify-between h-44">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
                Verified By:
              </p>
              <p className="text-[10px] text-slate-600">CDSB Lead Engineer / Technical Lead</p>
            </div>

            <div className="flex-1 flex items-center justify-center my-1">
              {report.engineerSignature ? (
                <img
                  src={report.engineerSignature}
                  alt="Verified Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">[Pending Engineer Signature]</span>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px]">
              <p><strong>Name:</strong> {report.engineerName || data.verifiedName || report.author?.name || 'SK Ding'}</p>
              <p>
                <strong>Date:</strong>{' '}
                {report.engineerSignedAt
                  ? new Date(report.engineerSignedAt).toLocaleDateString('en-GB')
                  : attendanceFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Footer */}
      <div className="mt-4 pt-2 text-center text-[9px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
        <span>Clover Digital Site Automation Platform</span>
        <span>Site Activity Record</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
