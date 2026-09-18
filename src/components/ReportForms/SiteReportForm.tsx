'use client';

import React, { useState } from 'react';
import {
  Clock,
  PenTool,
  CheckCircle2,
  UserCheck,
  Briefcase,
  FileText,
  Calendar,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { FullReport, SiteReportData, SiteDayActivity, UserSession } from '@/lib/types';
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

  const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper to extract or synthesize days array
  const getInitialDays = (): SiteDayActivity[] => {
    if (data.days && data.days.length > 0) {
      return data.days;
    }
    const defaultDate =
      formatDateForInput(report.attendanceDate || report.reportDate) ||
      new Date().toISOString().split('T')[0];
    return [
      {
        id: 'day-1',
        dayNumber: 1,
        date: defaultDate,
        startTime: report.startTime || '08:30 AM',
        endTime: report.endTime || '06:30 PM',
        normalHours: report.normalHours ?? 8,
        otHours: report.otHours ?? 0,
        workDescription: data.workDescription || '',
        personInCharge: data.personInCharge || report.engineerName || '',
      },
    ];
  };

  const days: SiteDayActivity[] = getInitialDays();

  // Helper to synchronize days array changes with report
  const updateDays = (newDays: SiteDayActivity[]) => {
    const indexedDays = newDays.map((d, i) => ({
      ...d,
      dayNumber: i + 1,
    }));

    const totalNormal = indexedDays.reduce((acc, d) => acc + (Number(d.normalHours) || 0), 0);
    const totalOt = indexedDays.reduce((acc, d) => acc + (Number(d.otHours) || 0), 0);
    const firstDay = indexedDays[0];

    // Create a combined formatted work description for any legacy consumers
    const combinedDesc =
      indexedDays.length === 1
        ? indexedDays[0].workDescription
        : indexedDays
            .map(
              (d, idx) =>
                `DAY ${idx + 1} (${d.date || 'Date N/A'})\n--------------------\n${d.workDescription || 'No activities logged.'}`
            )
            .join('\n\n');

    onChange({
      ...report,
      normalHours: totalNormal,
      otHours: totalOt,
      attendanceDate: firstDay?.date ? new Date(firstDay.date).toISOString() : report.attendanceDate,
      startTime: firstDay?.startTime || report.startTime,
      endTime: firstDay?.endTime || report.endTime,
      data: {
        ...data,
        days: indexedDays,
        workDescription: combinedDesc,
      },
    });
  };

  const handleAddDay = () => {
    const lastDay = days[days.length - 1];
    let nextDate = '';
    if (lastDay?.date) {
      const d = new Date(lastDay.date);
      d.setDate(d.getDate() + 1);
      nextDate = d.toISOString().split('T')[0];
    } else {
      nextDate = new Date().toISOString().split('T')[0];
    }

    const newDay: SiteDayActivity = {
      id: `day-${Date.now()}`,
      dayNumber: days.length + 1,
      date: nextDate,
      startTime: lastDay?.startTime || '08:30 AM',
      endTime: lastDay?.endTime || '06:30 PM',
      normalHours: 8,
      otHours: 0,
      workDescription: '',
      personInCharge: lastDay?.personInCharge || '',
    };

    updateDays([...days, newDay]);
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (days.length <= 1) return;
    const newDays = days.filter((_, idx) => idx !== dayIndex);
    updateDays(newDays);
  };

  const handleUpdateDayField = (dayIndex: number, field: keyof SiteDayActivity, val: any) => {
    const newDays = [...days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      [field]: val,
    };
    updateDays(newDays);
  };

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

  const totalNormalHours = days.reduce((acc, d) => acc + (Number(d.normalHours) || 0), 0);
  const totalOtHours = days.reduce((acc, d) => acc + (Number(d.otHours) || 0), 0);
  const totalOverallHours = totalNormalHours + totalOtHours;

  return (
    <div className="space-y-6 text-sm">
      {/* Project Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" />
          Project Parameters
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
      </div>

      {/* Multi-Day Activity Schedule */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Daily Site Activity Schedule ({days.length} {days.length === 1 ? 'Day' : 'Days'})
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Log activities across single or multiple days. Total hours are automatically calculated.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Hours Summary Badge */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Total:</span>
              <span className="text-emerald-400 font-semibold">{totalNormalHours}h Normal</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">{totalOtHours}h OT</span>
              <span className="text-slate-600">•</span>
              <span className="text-white font-bold">{totalOverallHours}h Overall</span>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-950 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            )}
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div
              key={day.id || `day-${idx}`}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative transition-all"
            >
              {/* Day Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 font-bold text-xs border border-teal-800">
                    Day {idx + 1}
                  </span>
                  {day.date && (
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(day.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    ({(Number(day.normalHours) || 0) + (Number(day.otHours) || 0)}h)
                  </span>
                </div>

                {!disabled && days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title={`Remove Day ${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Day Timing Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    disabled={disabled}
                    value={day.date || ''}
                    onChange={(e) => handleUpdateDayField(idx, 'date', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    disabled={disabled}
                    value={day.startTime || ''}
                    onChange={(e) => handleUpdateDayField(idx, 'startTime', e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    disabled={disabled}
                    value={day.endTime || ''}
                    onChange={(e) => handleUpdateDayField(idx, 'endTime', e.target.value)}
                    placeholder="06:30 PM"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Normal Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={disabled}
                    value={day.normalHours ?? ''}
                    onChange={(e) =>
                      handleUpdateDayField(idx, 'normalHours', parseFloat(e.target.value) || 0)
                    }
                    placeholder="8.0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">OT Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={disabled}
                    value={day.otHours ?? ''}
                    onChange={(e) =>
                      handleUpdateDayField(idx, 'otHours', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Day Work Description */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-400" />
                    Detailed Activities for Day {idx + 1} <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Numbered checklist or bullet breakdown
                  </span>
                </label>
                <textarea
                  rows={5}
                  disabled={disabled}
                  value={day.workDescription || ''}
                  onChange={(e) => handleUpdateDayField(idx, 'workDescription', e.target.value)}
                  placeholder={`1. Arrived on site at ${day.startTime || '08:30 AM'}...\n2. Performed equipment calibration and verified parameters...\n3. Tested communication protocol with SCADA...`}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 leading-relaxed font-mono text-xs"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Site Notes & Next actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
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
