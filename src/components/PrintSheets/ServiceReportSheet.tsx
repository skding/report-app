'use client';

import React from 'react';
import PrintHeader from './PrintHeader';
import { FullReport, ServiceReportData } from '@/lib/types';

interface ServiceReportSheetProps {
  report: FullReport;
}

export default function ServiceReportSheet({ report }: ServiceReportSheetProps) {
  const data = (report.data || {}) as ServiceReportData;
  const attendanceFormatted = report.attendanceDate
    ? new Date(report.attendanceDate).toLocaleDateString('en-GB')
    : new Date(report.reportDate).toLocaleDateString('en-GB');

  return (
    <div className="bg-white text-slate-900 p-6 md:p-8 font-sans max-w-[820px] mx-auto text-[11px] leading-normal shadow-lg border border-slate-200">
      <PrintHeader
        reportTitle="Engineer's Service Report"
        reportNumber={report.reportNumber}
        reportTypePrefix="ESR No."
      />

      {/* Meta Grid Table */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Customer:
            </td>
            <td className="w-2/6 p-2 border border-slate-400 font-semibold">
              {report.customer?.name || '—'}
            </td>
            <td className="w-1/6 bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Date/Time:
            </td>
            <td className="w-2/6 p-2 border border-slate-400">
              {attendanceFormatted} {report.startTime ? `(${report.startTime} - ${report.endTime || ''})` : ''}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Site Address:
            </td>
            <td className="p-2 border border-slate-400">
              {report.site?.name ? `${report.site.name}` : ''}
              {report.site?.address ? ` - ${report.site.address}` : ''}
            </td>
            <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
              Contact:
            </td>
            <td className="p-2 border border-slate-400">
              {report.site?.contactPerson || report.customer?.contactPerson || '—'}
              {report.site?.contactPhone ? ` (${report.site.contactPhone})` : ''}
            </td>
          </tr>
          {data.equipmentTags && data.equipmentTags.length > 0 && (
            <tr>
              <td className="bg-slate-100 p-2 font-bold border border-slate-400 text-slate-800">
                Equipment Tag(s):
              </td>
              <td colSpan={3} className="p-2 border border-slate-400">
                <div className="flex gap-2 flex-wrap">
                  {data.equipmentTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-mono font-semibold rounded text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Reported Fault */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
          Reported Fault / Problem Description
        </div>
        <div className="border border-slate-400 border-t-0 p-3 bg-slate-50/50 min-h-[48px] whitespace-pre-line text-slate-800">
          {data.reportedFault || 'No fault description provided.'}
        </div>
      </div>

      {/* Engineer's Report */}
      <div className="mb-4">
        <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
          Engineer's Report & Findings
        </div>
        <div className="border border-slate-400 border-t-0 p-3 bg-white min-h-[140px] whitespace-pre-line text-slate-800 text-justify">
          {data.engineersReport || 'No engineer findings provided.'}
        </div>
      </div>

      {/* Downtime Risk & Operational Efficiency Analysis */}
      {(data.downtimeRisk?.repair || data.downtimeRisk?.replacement) && (
        <div className="mb-4">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
            Downtime Risk & Operational Efficiency
          </div>
          <table className="w-full border-collapse border border-slate-400 border-t-0 text-[11px]">
            <tbody>
              <tr>
                <td className="w-1/4 bg-amber-50/80 p-2.5 font-bold border border-slate-400 text-amber-900 align-top">
                  Repair Option:
                </td>
                <td className="w-3/4 p-2.5 border border-slate-400 bg-white whitespace-pre-line">
                  {data.downtimeRisk.repair || '—'}
                </td>
              </tr>
              <tr>
                <td className="w-1/4 bg-emerald-50/80 p-2.5 font-bold border border-slate-400 text-emerald-900 align-top">
                  Replacement Option:
                </td>
                <td className="w-3/4 p-2.5 border border-slate-400 bg-white whitespace-pre-line">
                  {data.downtimeRisk.replacement || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendations & Spares */}
      {data.recommendations && (
        <div className="mb-4">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider">
            Recommendations & Action Required
          </div>
          <div className="border border-slate-400 border-t-0 p-3 bg-white whitespace-pre-line text-slate-800">
            {data.recommendations}
          </div>
        </div>
      )}

      {/* Attached Photos */}
      {report.photos && report.photos.length > 0 && (
        <div className="mb-4 page-break-inside-avoid">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-xs uppercase tracking-wider mb-2">
            Site Photographic Evidence ({report.photos.length})
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

      {/* Signatures Section */}
      <div className="mt-6 border-t-2 border-slate-400 pt-3 avoid-break">
        <div className="grid grid-cols-2 gap-6">
          {/* Attended By (Engineer) */}
          <div className="border border-slate-400 p-3 bg-slate-50/50 flex flex-col justify-between h-44">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
                Attended By:
              </p>
              <p className="text-[10px] text-slate-600">Clover Digital Service Engineer</p>
            </div>

            <div className="flex-1 flex items-center justify-center my-1">
              {report.engineerSignature ? (
                <img
                  src={report.engineerSignature}
                  alt="Engineer Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 italic text-[11px]">[Pending Signature]</span>
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
              <p className="text-[10px] text-slate-600">Customer Representative Signature</p>
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
        <span>Clover Digital Service Management Platform</span>
        <span>Confidential Technical Assessment</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
