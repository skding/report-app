'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  PenTool,
  ClipboardList,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  FullReport,
  MaintenanceReportData,
  ChecklistSection,
  ChecklistValue,
  UserSession,
} from '@/lib/types';
import PhotoUploader from '../PhotoUploader';
import SignaturePadModal from '../SignaturePadModal';

interface MaintenanceReportFormProps {
  report: FullReport;
  onChange: (updated: FullReport) => void;
  templateSections: ChecklistSection[];
  currentUser: UserSession | null;
  disabled?: boolean;
}

export default function MaintenanceReportForm({
  report,
  onChange,
  templateSections,
  currentUser,
  disabled = false,
}: MaintenanceReportFormProps) {
  const data = (report.data || {}) as MaintenanceReportData;
  const responses = data.checklistResponses || {};
  const [sigModalType, setSigModalType] = useState<'engineer' | 'customer' | null>(null);
  const [newCustomItemText, setNewCustomItemText] = useState('');

  // Helper to update a checklist item response
  const setItemResponse = (
    itemId: string,
    updates: Partial<ChecklistValue>
  ) => {
    const current = responses[itemId] || { status: 'OK' };
    const updatedResponses = {
      ...responses,
      [itemId]: {
        ...current,
        ...updates,
      },
    };

    // Calculate OK and PL counts
    let okCount = 0;
    let plCount = 0;
    Object.values(updatedResponses).forEach((val) => {
      if (val.status === 'OK') okCount++;
      if (val.status === 'PL') plCount++;
    });

    onChange({
      ...report,
      data: {
        ...data,
        checklistResponses: updatedResponses,
        overallOkCount: okCount,
        overallPlCount: plCount,
      },
    });
  };

  // Helper to bulk mark all in a section as OK
  const handleMarkSectionAllOk = (section: ChecklistSection) => {
    const updatedResponses = { ...responses };
    section.items.forEach((item) => {
      const cur = updatedResponses[item.id] || {};
      updatedResponses[item.id] = {
        ...cur,
        status: 'OK',
        value: item.type === 'measurement' ? (cur.value || item.target || 24.0) : cur.value,
      };
    });

    onChange({
      ...report,
      data: {
        ...data,
        checklistResponses: updatedResponses,
      },
    });
  };

  // Add ad-hoc custom checklist item
  const handleAddCustomItem = () => {
    if (!newCustomItemText.trim()) return;
    const currentCustom = data.customChecklistItems || [];
    const newItem = {
      id: `custom_${Date.now()}`,
      text: newCustomItemText.trim(),
      status: 'OK' as const,
      remarks: '',
    };

    onChange({
      ...report,
      data: {
        ...data,
        customChecklistItems: [...currentCustom, newItem],
      },
    });
    setNewCustomItemText('');
  };

  const handleRemoveCustomItem = (id: string) => {
    const currentCustom = data.customChecklistItems || [];
    onChange({
      ...report,
      data: {
        ...data,
        customChecklistItems: currentCustom.filter((item) => item.id !== id),
      },
    });
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
      {/* Checklist Stats Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              PM Checklist Execution
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive step-by-step procedure & testing table
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            OK: {Object.values(responses).filter((r) => r.status === 'OK').length}
          </span>
          <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-800/80 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            PL (Pending): {Object.values(responses).filter((r) => r.status === 'PL').length}
          </span>
        </div>
      </div>

      {/* Dynamic Sections */}
      {templateSections.map((section, sIdx) => (
        <div
          key={section.id || sIdx}
          className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
        >
          {/* Section Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {section.code || `1.${sIdx + 1}`} &nbsp; {section.title}
              </h4>
              {section.instructions && (
                <p className="text-[11px] text-slate-400 mt-0.5">{section.instructions}</p>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleMarkSectionAllOk(section)}
                className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                title="Mark all items in this section as OK"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Mark All OK
              </button>
            )}
          </div>

          {/* Section Items Table */}
          <div className="divide-y divide-slate-800/60">
            {section.items.map((item, iIdx) => {
              const res = responses[item.id] || { status: 'OK' };
              const isPl = res.status === 'PL';

              return (
                <div
                  key={item.id || iIdx}
                  className={`p-3 transition-colors ${
                    isPl ? 'bg-amber-950/20' : iIdx % 2 === 1 ? 'bg-slate-950/30' : 'bg-transparent'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Description */}
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                          {String.fromCharCode(97 + (iIdx % 26))}.
                        </span>
                        <div>
                          <p className="text-xs font-medium text-slate-200 leading-snug">
                            {item.text}
                          </p>
                          {item.spec && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded mt-1 font-mono">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              Spec: {item.spec}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Controls (Status Buttons & Numeric input) */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Measurement Input if type is measurement */}
                      {item.type === 'measurement' && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            disabled={disabled}
                            value={res.value !== undefined ? res.value : item.target || 24.0}
                            onChange={(e) =>
                              setItemResponse(item.id, {
                                value: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.unit || 'Vdc'}
                          </span>
                        </div>
                      )}

                      {/* Status Toggle Buttons (OK / PL / NA) */}
                      <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                        {['OK', 'PL', 'N/A'].map((opt) => {
                          const isSelected = (res.status || 'OK') === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={disabled}
                              onClick={() => setItemResponse(item.id, { status: opt as any })}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                                isSelected
                                  ? opt === 'OK'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : opt === 'PL'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-slate-700 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Remarks input row (expanded if PL or has remarks) */}
                  <div className="mt-2 pl-5">
                    <input
                      type="text"
                      disabled={disabled}
                      value={res.remarks || ''}
                      onChange={(e) => setItemResponse(item.id, { remarks: e.target.value })}
                      placeholder={
                        isPl
                          ? 'Specify pending punch-list action or cause of failure...'
                          : 'Remarks / reading notes (optional)...'
                      }
                      className={`w-full px-2.5 py-1 rounded text-xs placeholder-slate-500 focus:outline-none ${
                        isPl
                          ? 'bg-amber-950/40 border border-amber-700/60 text-amber-200 focus:border-amber-500'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 focus:border-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Ad-hoc Custom Checks Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center justify-between">
          <span>1.7 System Specific Checks (On-Site Additions)</span>
          <span className="text-[10px] text-slate-400 lowercase font-normal">
            Add ad-hoc items found on site
          </span>
        </h4>

        {(data.customChecklistItems || []).map((cItem, cIdx) => (
          <div
            key={cItem.id || cIdx}
            className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg"
          >
            <span className="text-xs font-mono text-slate-500">{String.fromCharCode(97 + cIdx)}.</span>
            <span className="flex-1 text-xs text-slate-200">{cItem.text}</span>
            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold rounded">
              {cItem.status}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveCustomItem(cItem.id)}
                className="text-slate-400 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {!disabled && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCustomItemText}
              onChange={(e) => setNewCustomItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomItem())}
              placeholder="e.g. Check UPS Battery Voltage, Verify Fire Alarm Interlock..."
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Check
            </button>
          </div>
        )}
      </div>

      {/* Section 2: Concerns & Suggestions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
          2. Concerns & Suggestions
        </h4>
        <textarea
          rows={3}
          disabled={disabled}
          value={data.concernsAndSuggestions || ''}
          onChange={(e) =>
            onChange({
              ...report,
              data: {
                ...data,
                concernsAndSuggestions: e.target.value,
              },
            })
          }
          placeholder="System recommendations, pending part replacements, upcoming quarterly service advice..."
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed text-xs"
        />
      </div>

      {/* Photo Attachments */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <PhotoUploader
          photos={report.photos || []}
          onChange={(newPhotos) => onChange({ ...report, photos: newPhotos })}
          disabled={disabled}
        />
      </div>

      {/* Signatures */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <PenTool className="w-4 h-4" />
          Preventive Maintenance Sign-off
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Engineer Signature */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Attended By (Lead Engineer)</span>
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
                {report.customerName || report.customer?.contactPerson || 'Customer Representative'}
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
              ? 'Lead Engineer PM Sign-off'
              : 'Customer Verification Sign-off'
          }
          initialName={
            sigModalType === 'engineer'
              ? report.engineerName || currentUser?.name || 'SK Ding'
              : report.customerName || report.customer?.contactPerson || ''
          }
          initialDesignation={
            sigModalType === 'engineer'
              ? 'Lead Engineer'
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
