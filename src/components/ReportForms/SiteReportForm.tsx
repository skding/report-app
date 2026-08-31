'use client';

import React, { useState } from 'react';
import { Clock, PenTool, CheckCircle2, UserCheck, Briefcase, FileText } from 'lucide-react';
import { FullReport, SiteReportData, UserSession } from '@/lib/types';
import PhotoUploader from '../PhotoUploader';
import SignaturePadModal from '../SignaturePadModal';

interface SiteReportFormProps {
  report: FullReport;
  onChange: (updated: FullReport) => void;
  currentUser: UserSession | null;
  disabled?: boolean;
}

export default function SiteReportForm({
  report,
  onChange,
  currentUser,
  disabled = false,
}: SiteReportFormProps) {
  const data = (report.data || {}) as SiteReportData;
  const [sigModalType, setSigModalType] = useState<'witness' | 'verified' | null>(null);

  const updateDataField = (field: keyof SiteReportData, value: any) => {
    onChange({
      ...report,
      data: {
        ...data,
        [field]: value,
      },
    });
  };

  const handleApplySignature = (sigResult: {
    signatureData: string;
    name: string;
    designation?: string;
  }) => {
    if (sigModalType === 'verified') {
      onChange({
        ...report,
        engineerName: sigResult.name,
        engineerSignature: sigResult.signatureData,
        engineerSignedAt: new Date().toISOString(),
      });
    } else if (sigModalType === 'witness') {
      onChange({
        ...report,
        customerName: sigResult.name,
        customerDesignation: sigResult.designation || '',
        customerSignature: sigResult.signatureData,
        customerSignedAt: new Date().toISOString(),
        status: report.status === 'DRAFT' ? 'COMPLETED' : report.status,
      });
    }
    setSigModalType(null);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Project & Timing Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" />
          Project & Attendance Parameters
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={report.title || ''}
              onChange={(e) => onChange({ ...report, title: e.target.value })}
              placeholder="e.g. CAOP INDONESIA PROJECT"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Code
            </label>
            <input
              type="text"
              disabled={disabled}
              value={report.projectCode || ''}
              onChange={(e) => onChange({ ...report, projectCode: e.target.value })}
              placeholder="e.g. CAOP-IDN-2026 / PJ-8812"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Time & Normal / OT Hours */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
            <input
              type="text"
              disabled={disabled}
              value={report.startTime || ''}
              onChange={(e) => onChange({ ...report, startTime: e.target.value })}
              placeholder="08:30 AM"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
            <input
              type="text"
              disabled={disabled}
              value={report.endTime || ''}
              onChange={(e) => onChange({ ...report, endTime: e.target.value })}
              placeholder="06:30 PM"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Normal Hours</label>
            <input
              type="number"
              step="0.5"
              disabled={disabled}
              value={report.normalHours || ''}
              onChange={(e) => onChange({ ...report, normalHours: parseFloat(e.target.value) || 0 })}
              placeholder="8.0"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">OT Hours</label>
            <input
              type="number"
              step="0.5"
              disabled={disabled}
              value={report.otHours || ''}
              onChange={(e) => onChange({ ...report, otHours: parseFloat(e.target.value) || 0 })}
              placeholder="2.0"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Work Description / Activity Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          Work Description & Daily Activity Log
        </h4>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Detailed Breakdown of Work Done <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={8}
            disabled={disabled}
            value={data.workDescription || ''}
            onChange={(e) => updateDataField('workDescription', e.target.value)}
            placeholder="1. Latest graphic updated at SCADA workstation.&#10;2. H2O and PFAD flow to sonification tank configured...&#10;3. Site commissioning and meeting with client lead..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-mono text-xs"
          />
        </div>

        {/* Site Notes & Next actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Next Action Required / Standby
            </label>
            <input
              type="text"
              disabled={disabled}
              value={data.nextActionRequired || ''}
              onChange={(e) => updateDataField('nextActionRequired', e.target.value)}
              placeholder="e.g. PLC programmer to standby in 3 weeks"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Estimated Return / Follow-up Date
            </label>
            <input
              type="text"
              disabled={disabled}
              value={data.followUpDate || ''}
              onChange={(e) => updateDataField('followUpDate', e.target.value)}
              placeholder="e.g. 2 weeks later / 15-09-2026"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Photo Attachments */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <PhotoUploader
          photos={report.photos || []}
          onChange={(newPhotos) => onChange({ ...report, photos: newPhotos })}
          disabled={disabled}
        />
      </div>

      {/* Dual Signatures */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <PenTool className="w-4 h-4" />
          Acceptance / Verification Signatures
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Witness By (Client) */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Witnessed By (Client)</span>
              {report.customerSignature ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Witnessed
                </span>
              ) : (
                <span className="text-[11px] text-amber-400">Pending Witness</span>
              )}
            </div>

            <div className="h-20 bg-white rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
              {report.customerSignature ? (
                <img
                  src={report.customerSignature}
                  alt="Witness Sig"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 text-xs italic">Awaiting witness sign-off</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 truncate">
                {report.customerName || data.witnessName || 'Client Representative'}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setSigModalType('witness')}
                  className="text-xs px-2.5 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-md transition-colors"
                >
                  {report.customerSignature ? 'Re-sign' : 'Witness Sign'}
                </button>
              )}
            </div>
          </div>

          {/* Verified By (Engineer) */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Verified By (CDSB Engineer)</span>
              {report.engineerSignature ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-[11px] text-amber-400">Unsigned</span>
              )}
            </div>

            <div className="h-20 bg-white rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
              {report.engineerSignature ? (
                <img
                  src={report.engineerSignature}
                  alt="Verified Sig"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 text-xs italic">No signature recorded</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 truncate">
                {report.engineerName || currentUser?.name || 'SK Ding'}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setSigModalType('verified')}
                  className="text-xs px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-md transition-colors"
                >
                  {report.engineerSignature ? 'Change' : 'Sign Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {sigModalType && (
        <SignaturePadModal
          isOpen={!!sigModalType}
          onClose={() => setSigModalType(null)}
          onSave={handleApplySignature}
          title={
            sigModalType === 'verified'
              ? 'Engineer Verification Sign-off'
              : 'Client Witness Sign-off'
          }
          initialName={
            sigModalType === 'verified'
              ? report.engineerName || currentUser?.name || 'SK Ding'
              : report.customerName || data.witnessName || ''
          }
          initialDesignation={
            sigModalType === 'verified'
              ? 'Lead Engineer'
              : report.customerDesignation || 'Site Lead'
          }
          savedSignature={
            sigModalType === 'verified' ? currentUser?.signatureData : null
          }
          requireDesignation={sigModalType === 'witness'}
        />
      )}
    </div>
  );
}
