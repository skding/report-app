'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  Activity,
  ClipboardList,
  Building,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { ReportType } from '@/lib/types';

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ReportType) || 'SERVICE';

  const [type, setType] = useState<ReportType>(initialType);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('08:30 AM');
  const [endTime, setEndTime] = useState<string>('05:30 PM');
  const [normalHours, setNormalHours] = useState<number>(8);
  const [otHours, setOtHours] = useState<number>(0);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [nextNumber, setNextNumber] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch next report number whenever type changes
  useEffect(() => {
    async function fetchNextNumber() {
      try {
        const res = await fetch(`/api/reports/next-number?type=${type}`);
        const data = await res.json();
        if (data.nextNumber) {
          setNextNumber(data.nextNumber);
        }
      } catch (e) {
        console.error('Error fetching next report number:', e);
      }
    }
    fetchNextNumber();
  }, [type]);

  // Fetch Customers and Templates
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [custRes, tplRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/templates'),
        ]);

        const custData = await custRes.json();
        const tplData = await tplRes.json();

        setCustomers(custData.customers || []);
        setTemplates(tplData.templates || []);

        if (custData.customers?.length > 0) {
          const firstCust = custData.customers[0];
          setSelectedCustomerId(firstCust.id);
          if (firstCust.sites?.length > 0) {
            setSelectedSiteId(firstCust.sites[0].id);
          }
        }

        if (tplData.templates?.length > 0) {
          setSelectedTemplateId(tplData.templates[0].id);
        }
      } catch (e) {
        console.error('Error loading master data:', e);
      }
    }
    loadMasterData();
  }, []);

  // Update site options when customer changes
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availableSites = currentCustomer?.sites || [];

  useEffect(() => {
    if (availableSites.length > 0) {
      setSelectedSiteId(availableSites[0].id);
      if (availableSites[0].defaultTemplateId) {
        setSelectedTemplateId(availableSites[0].defaultTemplateId);
      }
    } else {
      setSelectedSiteId('');
    }
  }, [selectedCustomerId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      let initialData: any = {};

      if (type === 'SERVICE') {
        initialData = {
          reportedFault: '',
          engineersReport: '',
          downtimeRisk: {
            repair: '',
            replacement: '',
          },
          equipmentTags: [],
          recommendations: '',
        };
      } else if (type === 'SITE_WORK') {
        initialData = {
          workDescription: '',
          personInCharge: '',
          witnessName: currentCustomer?.contactPerson || '',
        };
      } else if (type === 'MAINTENANCE') {
        const chosenTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
        const initialResponses: Record<string, any> = {};
        if (chosenTemplate?.sections) {
          chosenTemplate.sections.forEach((sec: any) => {
            sec.items?.forEach((item: any) => {
              initialResponses[item.id] = {
                status: 'OK',
                value: item.type === 'measurement' ? item.target || 24.0 : undefined,
              };
            });
          });
        }
        initialData = {
          checklistResponses: initialResponses,
          concernsAndSuggestions:
            'System is operating in healthy condition. Regular preventive maintenance procedures completed.',
          overallOkCount: Object.keys(initialResponses).length,
          overallPlCount: 0,
        };
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          customerId: selectedCustomerId || null,
          siteId: selectedSiteId || null,
          title:
            title.trim() ||
            (type === 'SERVICE'
              ? 'Adhoc Breakdown Service & Troubleshooting'
              : type === 'SITE_WORK'
              ? 'Site Engineering & Technical Support'
              : 'Routine Preventive Maintenance Service'),
          projectCode: projectCode.trim() || null,
          attendanceDate: new Date(attendanceDate).toISOString(),
          startTime,
          endTime,
          normalHours,
          otHours,
          data: initialData,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create report');
      }

      router.push(`/reports/${json.report.id}`);
    } catch (err: any) {
      setError(err.message || 'Error occurred while creating report.');
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Report Dispatch Generator
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Create New Site Service Report</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your report category, assign client & location, and launch the split-view live editor.
            </p>
          </div>

          {nextNumber && (
            <div className="px-4 py-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl shadow-inner text-right self-start">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                Auto-Assigned Number
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {nextNumber}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-2 text-red-200 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* 1. Report Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Select Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Type 1: ESR */}
              <div
                onClick={() => setType('SERVICE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  type === 'SERVICE'
                    ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-950/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    ESR
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Engineer's Service Report</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Adhoc breakdown service, non-routine emergency attendance, fault analysis & repair vs replacement risk.
                </p>
              </div>

              {/* Type 2: DSR */}
              <div
                onClick={() => setType('SITE_WORK')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  type === 'SITE_WORK'
                    ? 'border-teal-500 bg-teal-950/30 shadow-lg shadow-teal-950/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    DSR
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Daily Site / Remote Support</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Scheduled site & remote engineering work, SCADA modifications, project tracking, normal & OT hours log.
                </p>
              </div>

              {/* Type 3: PMR */}
              <div
                onClick={() => setType('MAINTENANCE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  type === 'MAINTENANCE'
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-950/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    PMR
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Preventive Maintenance</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Routine PM checklist execution, voltage measurement tolerances, software backups & punch list tracking.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Customer & Site Selection */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Assign Customer & Site Location
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Customer / Client Company <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Site Location <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {availableSites.length === 0 ? (
                    <option value="">No sites registered for customer</option>
                  ) : (
                    availableSites.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* If PMR: Select PM Template */}
            {type === 'MAINTENANCE' && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  PM Checklist Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} ({tpl.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Loads tailored checklist items, voltage tolerances, and backup verification steps for this site.
                </p>
              </div>
            )}
          </div>

          {/* 3. Report Details */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Attendance & Job Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Report Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === 'SERVICE'
                      ? 'e.g. VFD Critical Output Failure & Replacement Assessment'
                      : type === 'SITE_WORK'
                      ? 'e.g. CAOP Indonesia SCADA Graphic Update & Reactor Dosing'
                      : 'e.g. Quarterly PLC & SCADA Preventive Maintenance'
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {type === 'SITE_WORK' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Normal Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={normalHours}
                    onChange={(e) => setNormalHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">OT Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={otHours}
                    onChange={(e) => setOtHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Report Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create & Launch Live Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
