'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Lock,
  Columns,
  Maximize2,
  FileEdit,
  Printer,
  Mail,
  Download,
  AlertCircle,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FullReport, ChecklistSection, UserSession } from '@/lib/types';
import ServiceReportForm from '@/components/ReportForms/ServiceReportForm';
import SiteReportForm from '@/components/ReportForms/SiteReportForm';
import MaintenanceReportForm from '@/components/ReportForms/MaintenanceReportForm';
import LivePdfPreview from '@/components/LivePdfPreview';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<FullReport | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [templateSections, setTemplateSections] = useState<ChecklistSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'split' | 'form' | 'preview'>('split');

  // Load report and current user
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [repRes, userRes, tplRes] = await Promise.all([
          fetch(`/api/reports/${reportId}`),
          fetch('/api/auth/me'),
          fetch('/api/templates'),
        ]);

        if (!repRes.ok) throw new Error('Report not found');

        const repData = await repRes.json();
        const userData = await userRes.json();
        const tplData = await tplRes.json();

        setReport(repData.report);
        setCurrentUser(userData.user);

        // Find relevant template sections for maintenance reports
        if (repData.report.type === 'MAINTENANCE') {
          const matchedTpl =
            tplData.templates?.find(
              (t: any) => t.id === repData.report.site?.defaultTemplateId
            ) || tplData.templates?.[0];

          if (matchedTpl?.sections) {
            setTemplateSections(matchedTpl.sections);
          }
        }
      } catch (err) {
        console.error('Error loading report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reportId]);

  // Save report to server
  const handleSave = async (updatedReport?: FullReport, markCompleted = false) => {
    const payload = updatedReport || report;
    if (!payload) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const bodyPayload = {
        ...payload,
        status: markCompleted ? 'COMPLETED' : payload.status,
      };

      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setReport(data.report);
      setSaveStatus('saved');

      if (markCompleted) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Error saving report:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReportChange = (updated: FullReport) => {
    setReport(updated);
    setSaveStatus('idle');
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading Report Workspace...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report Not Found</h3>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = report.status === 'COMPLETED' || report.status === 'EMAILED';
  const typeLabel =
    report.type === 'SERVICE'
      ? "Engineer's Service Report (ESR)"
      : report.type === 'SITE_WORK'
      ? 'Daily Site / Remote Report (DSR)'
      : 'Preventive Maintenance Report (PMR)';

  return (
    <div className="space-y-4 pb-12">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        {/* Left: Report Identifiers */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {report.reportNumber}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {typeLabel}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  report.status === 'COMPLETED' || report.status === 'EMAILED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {report.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Customer: <strong className="text-slate-200">{report.customer?.name}</strong> • Site:{' '}
              <strong className="text-slate-200">{report.site?.name}</strong>
            </p>
          </div>
        </div>

        {/* Right: View mode toggle & Save buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View: Form & Live PDF side-by-side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split 1080p</span>
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'form'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Form Editor Fullscreen"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Form</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live PDF Document Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PDF</span>
            </button>
          </div>

          {/* Save Status Indicator */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Mark Complete & Finalize */}
          {!isCompleted && (
            <button
              type="button"
              onClick={() => handleSave(undefined, true)}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete & Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: Full HD Split-View Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-210px)]">
        {/* Left Column: Form Editor (Visible in 'split' or 'form' mode) */}
        {(viewMode === 'split' || viewMode === 'form') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-6 2xl:col-span-6' : 'lg:col-span-12 max-w-4xl mx-auto'
            } space-y-6 overflow-y-auto`}
          >
            {report.type === 'SERVICE' && (
              <ServiceReportForm
                report={report}
                onChange={handleReportChange}
                currentUser={currentUser}
              />
            )}
            {report.type === 'SITE_WORK' && (
              <SiteReportForm
                report={report}
                onChange={handleReportChange}
                currentUser={currentUser}
              />
            )}
            {report.type === 'MAINTENANCE' && (
              <MaintenanceReportForm
                report={report}
                onChange={handleReportChange}
                templateSections={templateSections}
                currentUser={currentUser}
              />
            )}
          </div>
        )}

        {/* Right Column: Live PDF Document Preview (Visible in 'split' or 'preview' mode) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-6 2xl:col-span-6' : 'lg:col-span-12 max-w-5xl mx-auto'
            } h-full sticky top-20`}
          >
            <LivePdfPreview
              report={report}
              templateSections={templateSections}
              onEmailSent={() => {
                handleSave();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
