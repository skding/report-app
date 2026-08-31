'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FullReport, ChecklistSection } from '@/lib/types';
import ServiceReportSheet from '@/components/PrintSheets/ServiceReportSheet';
import SiteReportSheet from '@/components/PrintSheets/SiteReportSheet';
import MaintenanceReportSheet from '@/components/PrintSheets/MaintenanceReportSheet';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrintReportPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<FullReport | null>(null);
  const [templateSections, setTemplateSections] = useState<ChecklistSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const [repRes, tplRes] = await Promise.all([
          fetch(`/api/reports/${reportId}`),
          fetch('/api/templates'),
        ]);

        const repData = await repRes.json();
        const tplData = await tplRes.json();

        setReport(repData.report);

        if (repData.report.type === 'MAINTENANCE') {
          const matchedTpl =
            tplData.templates?.find(
              (t: any) => t.id === repData.report.site?.defaultTemplateId
            ) || tplData.templates?.[0];

          if (matchedTpl?.sections) {
            setTemplateSections(matchedTpl.sections);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-sm">Preparing official print document...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 text-black">
      {/* Top Floating Print Bar (Hidden during print) */}
      <div className="no-print max-w-[820px] mx-auto mb-4 px-4 flex items-center justify-between">
        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Editor
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="print-area">
        {report.type === 'SERVICE' && <ServiceReportSheet report={report} />}
        {report.type === 'SITE_WORK' && <SiteReportSheet report={report} />}
        {report.type === 'MAINTENANCE' && (
          <MaintenanceReportSheet
            report={report}
            templateSections={templateSections}
          />
        )}
      </div>
    </div>
  );
}
