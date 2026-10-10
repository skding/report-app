'use client';

import React from 'react';
import PrintHeader from './PrintHeader';
import { FullReport, SiteReportData, SiteDayActivity, ReportPhotoItem } from '@/lib/types';
import { renderMultilineText, formatPrintDate } from './printUtils';

interface SiteReportSheetProps {
  report: FullReport;
}

export default function SiteReportSheet({ report }: SiteReportSheetProps) {
  const data = (report.data || {}) as SiteReportData;
  const days = data.days && data.days.length > 0 ? data.days : null;
  const isMultiDay = Boolean(days && days.length > 1);

  let attendanceFormatted = formatPrintDate(report.attendanceDate || report.reportDate);

  if (isMultiDay && days) {
    const firstDate = days[0]?.date
      ? formatPrintDate(days[0].date)
      : '';
    const lastDate = days[days.length - 1]?.date
      ? formatPrintDate(days[days.length - 1].date)
      : '';
    attendanceFormatted = `${firstDate} - ${lastDate} (${days.length} Days)`;
  }

  const totalHours = (report.normalHours || 0) + (report.otHours || 0);

  // Photos processing & multi-day grouping
  interface PhotoWithMeta extends ReportPhotoItem {
    overallIndex: number;
    displayDate: string;
    dayBadge?: string;
  }

  interface PhotoGroup {
    key: string;
    dayNumber?: number;
    title: string;
    dateStr: string;
    displayDate: string;
    dayDescription?: string;
    photos: PhotoWithMeta[];
  }

  const cleanDateStr = (val?: string | null): string => {
    if (!val) return '';
    return val.split('T')[0];
  };

  const isPhotoMatchingDay = (photo: ReportPhotoItem, day: SiteDayActivity, dayIdx: number): boolean => {
    const pDate = cleanDateStr(photo.date || photo.sectionKey);
    const dDate = cleanDateStr(day.date);
    if (pDate && dDate && pDate === dDate) return true;
    if (
      photo.sectionKey &&
      (photo.sectionKey === `day-${dayIdx + 1}` ||
        photo.sectionKey === `day-${day.dayNumber}` ||
        photo.sectionKey === day.id)
    ) {
      return true;
    }
    return false;
  };

  const photoGroups: PhotoGroup[] = [];
  const rawPhotos = report.photos || [];

  if (rawPhotos.length > 0) {
    if (isMultiDay && days && days.length > 1) {
      const assignedIndices = new Set<number>();

      days.forEach((day, idx) => {
        const dayNumber = day.dayNumber || idx + 1;
        const matchingPhotos: PhotoWithMeta[] = [];

        rawPhotos.forEach((photo, pIdx) => {
          if (isPhotoMatchingDay(photo, day, idx)) {
            assignedIndices.add(pIdx);
            matchingPhotos.push({
              ...photo,
              overallIndex: pIdx,
              displayDate: formatPrintDate(photo.date || day.date),
              dayBadge: `Day ${dayNumber}`,
            });
          }
        });

        if (matchingPhotos.length > 0) {
          const firstLine = day.workDescription ? day.workDescription.split(/\r?\n/)[0].trim() : '';
          photoGroups.push({
            key: `day-${dayNumber}`,
            dayNumber,
            title: `DAY ${dayNumber} — ${formatPrintDate(day.date)}`,
            dateStr: day.date,
            displayDate: formatPrintDate(day.date),
            dayDescription: firstLine ? (firstLine.length > 60 ? firstLine.substring(0, 58) + '...' : firstLine) : undefined,
            photos: matchingPhotos,
          });
        }
      });

      const unassignedPhotos: PhotoWithMeta[] = [];
      rawPhotos.forEach((photo, pIdx) => {
        if (!assignedIndices.has(pIdx)) {
          unassignedPhotos.push({
            ...photo,
            overallIndex: pIdx,
            displayDate: formatPrintDate(photo.date || report.attendanceDate || report.reportDate),
            dayBadge: 'General',
          });
        }
      });

      if (unassignedPhotos.length > 0) {
        photoGroups.push({
          key: 'unassigned',
          title: 'General Site Evidence & Documentation',
          dateStr: report.attendanceDate || report.reportDate || '',
          displayDate: formatPrintDate(report.attendanceDate || report.reportDate),
          photos: unassignedPhotos,
        });
      }
    } else {
      const defaultDateFormatted = formatPrintDate(days?.[0]?.date || report.attendanceDate || report.reportDate);
      const unifiedPhotos: PhotoWithMeta[] = rawPhotos.map((photo, pIdx) => ({
        ...photo,
        overallIndex: pIdx,
        displayDate: formatPrintDate(photo.date || days?.[0]?.date || report.attendanceDate || report.reportDate),
        dayBadge: days && days.length === 1 ? 'Day 1' : undefined,
      }));

      photoGroups.push({
        key: 'single-day',
        dayNumber: days && days.length === 1 ? 1 : undefined,
        title: days && days.length === 1 ? `DAY 1 — ${defaultDateFormatted}` : 'Site Work Evidence',
        dateStr: days?.[0]?.date || report.attendanceDate || report.reportDate || '',
        displayDate: defaultDateFormatted,
        photos: unifiedPhotos,
      });
    }
  }

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
                    <div className="flex items-center gap-2.5">
                      {(() => {
                        const count = (report.photos || []).filter((p) => isPhotoMatchingDay(p, day, idx)).length;
                        return count > 0 ? (
                          <span className="text-teal-800 font-mono text-[9px] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-300 font-medium">
                            📷 {count} {count === 1 ? 'Photo' : 'Photos'}
                          </span>
                        ) : null;
                      })()}
                      <span className="text-slate-600 font-mono text-[9px]">
                        {day.startTime && day.endTime ? `${day.startTime} - ${day.endTime} | ` : ''}
                        Normal: {day.normalHours ?? 8}h | OT: {day.otHours ?? 0}h
                      </span>
                    </div>
                  </div>
                )}
                <div className="text-slate-800 text-justify leading-normal pl-1">
                  {renderMultilineText(day.workDescription, 'No activities logged.')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-400 border-t-0 p-3 bg-white min-h-[220px] text-slate-800 text-justify leading-normal">
            {renderMultilineText(data.workDescription, 'No work description entered.')}
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
              <p><strong>Next Action:</strong> {data.nextActionRequired.trim()}</p>
            )}
            {data.followUpDate && (
              <p><strong>Target Date:</strong> {data.followUpDate}</p>
            )}
            {data.siteNotes && (
              <div className="leading-normal">
                <strong>Notes:</strong> {renderMultilineText(data.siteNotes)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attached Photos - Grouped by Activity Date */}
      {photoGroups.length > 0 && (
        <div className="mb-3.5 avoid-break">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Site Photos & Engineering Work Evidence ({report.photos.length})</span>
            {isMultiDay ? (
              <span className="text-[10px] text-teal-300 font-normal">
                Grouped by Reporting Date
              </span>
            ) : (
              <span className="text-[10px] text-teal-300 font-normal">
                Date Labeled
              </span>
            )}
          </div>

          <div className="space-y-3">
            {photoGroups.map((group) => {
              const photoCount = group.photos.length;
              const gridColsClass =
                photoCount === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : photoCount === 3
                  ? 'grid-cols-3'
                  : photoCount >= 5
                  ? 'grid-cols-3'
                  : 'grid-cols-2';

              const imgHeightClass =
                photoCount === 1
                  ? 'h-48'
                  : photoCount === 3
                  ? 'h-32'
                  : photoCount >= 5
                  ? 'h-28'
                  : 'h-36';

              return (
                <div
                  key={group.key}
                  className="border border-slate-300 rounded overflow-hidden avoid-break bg-white shadow-xs"
                >
                  {/* Group Header (if multi-day or labeled group) */}
                  {(isMultiDay || photoGroups.length > 1) && (
                    <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        {group.dayNumber ? (
                          <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Day {group.dayNumber}
                          </span>
                        ) : (
                          <span className="bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Evidence
                          </span>
                        )}
                        <span className="font-bold text-slate-900">
                          {group.displayDate ? group.displayDate : group.title}
                        </span>
                        {group.dayDescription && (
                          <span className="text-slate-500 font-normal text-[10px] max-w-[340px] truncate hidden sm:inline">
                            — {group.dayDescription}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>
                  )}

                  {/* Group Photos Grid */}
                  <div className={`p-2 grid gap-2.5 bg-slate-50/50 ${gridColsClass}`}>
                    {group.photos.map((photo) => (
                      <div
                        key={photo.overallIndex}
                        className="border border-slate-200 bg-white rounded p-1.5 pb-2 flex flex-col items-center avoid-break shadow-xs"
                      >
                        <div
                          className={`relative w-full flex items-center justify-center bg-slate-100 overflow-hidden border border-slate-200 ${imgHeightClass}`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || `Site Photo ${photo.overallIndex + 1}`}
                            className="max-h-full max-w-full object-contain inline-block"
                          />
                          {/* Date Label Badge overlay */}
                          {photo.displayDate && photo.displayDate !== '—' && (
                            <div className="absolute top-1 left-1 bg-slate-900/85 text-white text-[8px] font-mono font-medium px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              <span>📅 {photo.displayDate}</span>
                              {photo.dayBadge && <span>• {photo.dayBadge}</span>}
                            </div>
                          )}
                        </div>

                        {/* Caption and Date Label below */}
                        <div className="w-full text-center mt-1 px-1">
                          <div className="text-[10px] font-bold text-slate-800 leading-tight break-words">
                            Fig {photo.overallIndex + 1}: {photo.caption || 'Site Photo Evidence'}
                          </div>
                          {photo.displayDate && photo.displayDate !== '—' && (
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              Date: {photo.displayDate} {photo.dayBadge ? `(${photo.dayBadge})` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
                  className="max-h-20 max-w-full object-contain inline-block"
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
                  ? formatPrintDate(report.customerSignedAt)
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
                  className="max-h-20 max-w-full object-contain inline-block"
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
                  ? formatPrintDate(report.engineerSignedAt)
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
