'use client';

import React, { useState } from 'react';
import { PenTool, CheckCircle2, UserCheck, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { FullReport, ServiceReportData, UserSession } from '@/lib/types';
import PhotoUploader from '../PhotoUploader';
import SignaturePadModal from '../SignaturePadModal';

interface ServiceReportFormProps {
  report: FullReport;
  onChange: (updated: FullReport) => void;
  currentUser: UserSession | null;
  disabled?: boolean;
}

export default function ServiceReportForm({
  report,
  onChange,
  currentUser,
  disabled = false,
}: ServiceReportFormProps) {
  const data = (report.data || {}) as ServiceReportData;
  const [sigModalType, setSigModalType] = useState<'engineer' | 'customer' | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const updateDataField = (field: keyof ServiceReportData, value: any) => {
    onChange({
      ...report,
      data: {
        ...data,
        [field]: value,
      },
    });
  };

  const updateDowntimeRisk = (subfield: 'repair' | 'replacement', value: string) => {
    onChange({
      ...report,
      data: {
        ...data,
        downtimeRisk: {
          repair: data.downtimeRisk?.repair || '',
          replacement: data.downtimeRisk?.replacement || '',
          [subfield]: value,
        },
      },
    });
  };

  const addEquipmentTag = () => {
    if (!newTagInput.trim()) return;
    const currentTags = data.equipmentTags || [];
    if (!currentTags.includes(newTagInput.trim().toUpperCase())) {
      updateDataField('equipmentTags', [...currentTags, newTagInput.trim().toUpperCase()]);
    }
    setNewTagInput('');
  };

  const removeEquipmentTag = (tag: string) => {
    const currentTags = data.equipmentTags || [];
    updateDataField(
      'equipmentTags',
      currentTags.filter((t) => t !== tag)
    );
  };

  const handleApplySignature = (sigResult: {
    signatureData: string;
    name: string;
    designation?: string;
  }) => {
    if (sigModalType === 'engineer') {
      onChange({
        ...report,
        engineerName: sigResult.name,
        engineerSignature: sigResult.signatureData,
        engineerSignedAt: new Date().toISOString(),
      });
    } else if (sigModalType === 'customer') {
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
      {/* Title & Fault Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          Breakdown & Service Context
        </h4>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Service Title / Incident Summary <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={report.title || ''}
            onChange={(e) => onChange({ ...report, title: e.target.value })}
            placeholder="e.g. VFD Critical Output Failure & Replacement Assessment"
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Equipment Tags */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Equipment Tags / Machine Identifiers
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.equipmentTags || []).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeEquipmentTag(tag)}
                    className="text-slate-400 hover:text-red-400 ml-1"
                  >
                    &times;
                  </button>
                )}
              </span>
            ))}
          </div>
          {!disabled && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipmentTag())}
                placeholder="e.g. STLP1, CHILLER-02, VFD-6000"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addEquipmentTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tag
              </button>
            </div>
          )}
        </div>

        {/* Reported Fault */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Reported Fault / Problem Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={data.reportedFault || ''}
            onChange={(e) => updateDataField('reportedFault', e.target.value)}
            placeholder="Describe the initial fault as reported by customer or site operator..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* Engineer's Diagnosis & Report */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4" />
          Engineer's Diagnosis & Detailed Findings
        </h4>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Technical Findings, Hardware Inspection & Root Cause <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={5}
            disabled={disabled}
            value={data.engineersReport || ''}
            onChange={(e) => updateDataField('engineersReport', e.target.value)}
            placeholder="Detailed engineering analysis, runtime hours, component wear, capacitor/IGBT status..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
          />
        </div>

        {/* Downtime Risk & Operational Comparison Box */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Downtime Risk & Operational Efficiency Analysis
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-semibold text-amber-400 mb-1">
                Repair Option (Risks & Lead Time)
              </span>
              <textarea
                rows={3}
                disabled={disabled}
                value={data.downtimeRisk?.repair || ''}
                onChange={(e) => updateDowntimeRisk('repair', e.target.value)}
                placeholder="e.g. Long lead time to source legacy components with zero guarantee of post-repair reliability..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Replacement Option (Benefits & Warranty)
              </span>
              <textarea
                rows={3}
                disabled={disabled}
                value={data.downtimeRisk?.replacement || ''}
                onChange={(e) => updateDowntimeRisk('replacement', e.target.value)}
                placeholder="e.g. Modern drives offer direct migration paths, energy efficiency, 12 month warranty, readily available parts..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Recommendations & Next Steps
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={data.recommendations || ''}
            onChange={(e) => updateDataField('recommendations', e.target.value)}
            placeholder="Recommendations for procurement, retrofitting, wiring re-termination..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
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

      {/* Digital Signatures Control */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <PenTool className="w-4 h-4" />
          Digital Signatures & Sign-off
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Engineer Signature */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Attended By (Engineer)</span>
              {report.engineerSignature ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                </span>
              ) : (
                <span className="text-[11px] text-amber-400">Unsigned</span>
              )}
            </div>

            <div className="h-20 bg-white rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
              {report.engineerSignature ? (
                <img
                  src={report.engineerSignature}
                  alt="Engineer Sig"
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
                  onClick={() => setSigModalType('engineer')}
                  className="text-xs px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-md transition-colors"
                >
                  {report.engineerSignature ? 'Change' : 'Sign Now'}
                </button>
              )}
            </div>
          </div>

          {/* Customer Signature */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Verified By (Customer)</span>
              {report.customerSignature ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-[11px] text-amber-400">Pending Customer</span>
              )}
            </div>

            <div className="h-20 bg-white rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
              {report.customerSignature ? (
                <img
                  src={report.customerSignature}
                  alt="Customer Sig"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-400 text-xs italic">Awaiting customer sign-off</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 truncate">
                {report.customerName || report.customer?.contactPerson || 'Customer Rep'}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setSigModalType('customer')}
                  className="text-xs px-2.5 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-md transition-colors"
                >
                  {report.customerSignature ? 'Re-sign' : 'Customer Sign'}
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
            sigModalType === 'engineer'
              ? 'Engineer Service Sign-off'
              : 'Customer Acceptance Sign-off'
          }
          initialName={
            sigModalType === 'engineer'
              ? report.engineerName || currentUser?.name || 'SK Ding'
              : report.customerName || report.customer?.contactPerson || ''
          }
          initialDesignation={
            sigModalType === 'engineer'
              ? 'Service Engineer'
              : report.customerDesignation || 'Facility Engineer'
          }
          savedSignature={
            sigModalType === 'engineer' ? currentUser?.signatureData : null
          }
          requireDesignation={sigModalType === 'customer'}
        />
      )}
    </div>
  );
}
