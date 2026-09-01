'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download, Mail, ZoomIn, ZoomOut, Maximize2, Sparkles, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FullReport, ChecklistSection } from '@/lib/types';
import ServiceReportSheet from './PrintSheets/ServiceReportSheet';
import SiteReportSheet from './PrintSheets/SiteReportSheet';
import MaintenanceReportSheet from './PrintSheets/MaintenanceReportSheet';
import EmailReportModal from './EmailReportModal';

interface LivePdfPreviewProps {
  report: FullReport;
  templateSections?: ChecklistSection[];
  onEmailSent?: () => void;
}

export default function LivePdfPreview({
  report,
  templateSections = [],
  onEmailSent,
}: LivePdfPreviewProps) {
  const printSheetRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Generate Base64 PDF for download or email attachment
  const generatePdf = async (): Promise<{ pdf: jsPDF; base64: string } | null> => {
    if (!printSheetRef.current) return null;

    try {
      setIsExporting(true);
      const element = printSheetRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.2, // High resolution for crisp vector look
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 16; // 8mm margin on left and right
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 8; // Top margin

      // First page
      pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 16;

      // Handle multi-page if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 16;
      }

      const base64 = pdf.output('datauristring');
      return { pdf, base64 };
    } catch (err) {
      console.error('Error generating PDF:', err);
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const res = await generatePdf();
    if (res) {
      const fileName = `${report.reportNumber.replace(/[\/\\]/g, '_')}_${report.type}.pdf`;
      res.pdf.save(fileName);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePdfBase64ForEmail = async (): Promise<string | null> => {
    const res = await generatePdf();
    return res ? res.base64 : null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium text-xs border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Preview
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            A4 Print Output
          </span>
        </div>

        {/* Zoom & Action buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-slate-400">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.92)}
              className="p-1 hover:text-white rounded transition-colors border-l border-slate-800 ml-0.5"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            title="System Print Dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors disabled:opacity-50"
            title="Download Vector PDF"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          {/* Email to Customer Button */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-950 transition-colors"
            title="Email report to customer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email Report</span>
          </button>
        </div>
      </div>

      {/* Sheet Preview Scroll Container */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex justify-center bg-slate-900/60 custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="my-auto pb-10"
        >
          <div ref={printSheetRef} className="print-area shadow-2xl rounded-sm relative overflow-hidden">
            {/* VOIDED Watermark Overlay */}
            {report.status === 'VOIDED' && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="text-red-600/30 text-7xl md:text-8xl font-black uppercase tracking-widest -rotate-45 border-8 border-red-600/30 px-12 py-4 rounded-3xl select-none">
                  VOIDED
                </div>
              </div>
            )}

            {/* ARCHIVED Tag */}
            {report.status === 'ARCHIVED' && (
              <div className="absolute top-6 right-6 z-20 pointer-events-none">
                <span className="text-[10px] font-bold font-mono uppercase px-3 py-1 bg-slate-900/90 text-slate-400 border border-slate-600 rounded-md shadow">
                  ARCHIVED RECORD
                </span>
              </div>
            )}

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
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailReportModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          report={report}
          generatePdfBase64={generatePdfBase64ForEmail}
          onSuccess={onEmailSent}
        />
      )}
    </div>
  );
}
