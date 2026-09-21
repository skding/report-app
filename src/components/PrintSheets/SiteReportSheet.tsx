'use client';

import React from 'react';
import PrintHeader from './PrintHeader';
import { FullReport, SiteReportData } from '@/lib/types';

interface SiteReportSheetProps {
  report: FullReport;
}

export default function SiteReportSheet({ report }: SiteReportSheetProps) {
  const data = (report.data || {}) as SiteReportData;
  const days = data.days && data.days.length > 0 ? data.days : null;
  const isMultiDay = Boolean(days && days.length > 1);

  let attendanceFormatted = report.attendanceDate
    ? new Date(report.attendanceDate).toLocaleDateString('en-GB')
    : new Date(report.reportDate).toLocaleDateString('en-GB');

  if (isMultiDay && days) {
    const firstDate = days[0]?.date
      ? new Date(days[0].date).toLocaleDateString('en-GB')
      : '';
    const lastDate = days[days.length - 1]?.date
      ? new Date(days[days.length - 1].date).toLocaleDateString('en-GB')
      : '';
    attendanceFormatted = `${firstDate} - ${lastDate} (${days.length} Days)`;
  }

  const totalHours = (report.normalHours || 0) + (report.otHours || 0);

  return (
    <div className="bg-white text-slate-900 p-6 font-sans w-[794px] max-w-[794px] min-w-[794px] mx-auto text-[11px] leading-normal shadow-lg border border-slate-200 box-border">
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
              {isMultiDay && days ? (
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <span>
                    <strong>Total:</strong> {report.normalHours || 0}h Normal
                  </span>
                  <span>•</span>
                  <span>
                    <strong>OT:</strong> {report.otHours || 0}h
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Overall:</strong> {totalHours}h ({days.length} Days)
                  </span>
                </div>
              ) : (
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
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Work Description Section */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider flex items-center justify-between">
          <span>Work Description / Activity Log</span>
          {isMultiDay && days && (
            <span className="text-[10px] text-teal-300 font-normal">
              {days.length} Days Logged
            </span>
          )}
        </div>

        {days && days.length > 0 ? (
          <div className="border border-slate-400 border-t-0 divide-y divide-slate-300 bg-white min-h-[220px]">
            {days.map((day, idx) => (
              <div key={day.id || idx} className="p-3 space-y-1.5">
                {isMultiDay && (
                  <div className="flex items-center justify-between bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[10px] text-slate-800 font-semibold">
                    <span className="font-bold text-slate-900">
                      DAY {idx + 1}
                      {day.date
                        ? ` — ${new Date(day.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : ''}
                    </span>
                    <span className="text-slate-600 font-mono text-[9px]">
                      {day.startTime && day.endTime ? `${day.startTime} - ${day.endTime} | ` : ''}
                      Normal: {day.normalHours ?? 8}h | OT: {day.otHours ?? 0}h
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-line text-slate-800 text-justify leading-relaxed pl-1">
                  {day.workDescription || 'No activities logged.'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-400 border-t-0 p-3 bg-white min-h-[220px] whitespace-pre-line text-slate-800 text-justify leading-relaxed">
            {data.workDescription || 'No work description entered.'}
          </div>
        )}
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
        <div className="mb-3 avoid-break">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider mb-2">
            Site Photos & Engineering Work Evidence ({report.photos.length})
          </div>
          <div
            className={`grid gap-2 border border-slate-300 p-2 rounded ${
              report.photos.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : report.photos.length === 3
                ? 'grid-cols-3'
                : report.photos.length >= 5
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {report.photos.map((photo, idx) => (
              <div key={idx} className="border border-slate-200 p-1.5 bg-slate-50 flex flex-col items-center avoid-break">
                <div
                  className={`w-full flex items-center justify-center bg-white overflow-hidden border border-slate-200 ${
                    report.photos.length === 1
                      ? 'h-48'
                      : report.photos.length === 3
                      ? 'h-32'
                      : report.photos.length >= 5
                      ? 'h-28'
                      : 'h-36'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `Site Photo ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                {photo.caption && (
                  <p className="text-[10px] font-medium text-slate-700 mt-1 text-center truncate w-full" title={photo.caption}>
                    Fig {idx + 1}: {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceptance / Verification Dual Signatures */}
      <div className="mt-4 border-t-2 border-slate-400 pt-2.5 avoid-break">
        <div className="mb-2 font-bold text-xs uppercase tracking-wider text-slate-900">
          Acceptance / Verification
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Witness by */}
          <div className="border border-slate-400 p-2.5 bg-slate-50/50 flex flex-col justify-between h-32">
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
                  className="max-h-14 max-w-full object-contain"
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
          <div className="border border-slate-400 p-2.5 bg-slate-50/50 flex flex-col justify-between h-32">
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
                  className="max-h-14 max-w-full object-contain"
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
      <div className="mt-3 pt-2 text-center text-[9px] text-slate-500 border-t border-slate-200 flex items-center justify-between avoid-break">
        <span>Clover Digital Site Automation Platform</span>
        <span>Site Activity Record</span>
        <span>Official Document</span>
      </div>
    </div>
  );
}
