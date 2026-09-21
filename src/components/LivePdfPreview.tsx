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
        scale: 2, // 2x gives 300dpi-equivalent print sharpness without memory bloat
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        scrollY: 0,
        scrollX: 0,
        onclone: (clonedDoc) => {
          // Critical fix: prevent Tailwind block img from causing ghost line-breaks and shifting text down
          const style = clonedDoc.createElement('style');
          style.textContent = `
            img { display: inline-block !important; vertical-align: middle; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          `;
          clonedDoc.head.appendChild(style);

          const clonedZoom = clonedDoc.getElementById('preview-zoom-container');
          if (clonedZoom) {
            clonedZoom.style.transform = 'none';
            clonedZoom.style.margin = '0';
            clonedZoom.style.padding = '0';
          }
          const clonedPrintArea = clonedDoc.querySelector('.print-area');
          if (clonedPrintArea) {
            (clonedPrintArea as HTMLElement).style.boxShadow = 'none';
            (clonedPrintArea as HTMLElement).style.borderRadius = '0';
          }
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 6; // 6mm margin for clean printable boundary
      const printableWidthMm = pdfWidth - 2 * margin; // 198mm
      const printableHeightMm = pdfHeight - 2 * margin; // 285mm

      // Canvas scale ratio
      const pxPerMm = canvas.width / printableWidthMm;
      const maxPageHeightPx = Math.floor(printableHeightMm * pxPerMm);
      const totalCanvasHeight = canvas.height;

      // If document fits on a single A4 page
      if (totalCanvasHeight <= maxPageHeightPx) {
        const imgHeightMm = (totalCanvasHeight * printableWidthMm) / canvas.width;
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          margin,
          margin,
          printableWidthMm,
          imgHeightMm
        );
      } else {
        // Multi-page document: slice at natural element boundaries
        const elementRect = element.getBoundingClientRect();
        const breakPoints: number[] = [];

        const breakCandidates = element.querySelectorAll<HTMLElement>(
          '.avoid-break, table, tr, .grid, h1, h2, .sheet-section'
        );

        breakCandidates.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const topPx = (rect.top - elementRect.top) * (canvas.height / (element.scrollHeight || 1));
          const bottomPx = (rect.bottom - elementRect.top) * (canvas.height / (element.scrollHeight || 1));
          if (topPx > 0) breakPoints.push(Math.floor(topPx));
          if (bottomPx < totalCanvasHeight) breakPoints.push(Math.floor(bottomPx));
        });

        // Deduplicate and sort boundaries
        const sortedBreaks = Array.from(new Set(breakPoints)).sort((a, b) => a - b);

        let currentY = 0;
        let pageIndex = 0;

        while (currentY < totalCanvasHeight) {
          const remainingHeight = totalCanvasHeight - currentY;
          let splitY: number;

          if (remainingHeight <= maxPageHeightPx) {
            splitY = totalCanvasHeight;
          } else {
            // Target split near maxPageHeightPx, but search for safe element break
            const targetY = currentY + maxPageHeightPx;
            // Prefer cutting at a boundary between 75% and 100% of maxPageHeight
            const minAcceptableY = currentY + maxPageHeightPx * 0.75;
            const candidate = sortedBreaks
              .filter((b) => b > minAcceptableY && b <= targetY)
              .pop();

            splitY = candidate ? candidate : targetY;
          }

          const sliceHeightPx = splitY - currentY;
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeightPx;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, sliceHeightPx);
            ctx.drawImage(
              canvas,
              0,
              currentY,
              canvas.width,
              sliceHeightPx,
              0,
              0,
              canvas.width,
              sliceHeightPx
            );
          }

          if (pageIndex > 0) {
            pdf.addPage();
          }

          const sliceHeightMm = (sliceHeightPx * printableWidthMm) / canvas.width;
          pdf.addImage(
            pageCanvas.toDataURL('image/jpeg', 0.98),
            'JPEG',
            margin,
            margin,
            printableWidthMm,
            sliceHeightMm
          );

          currentY = splitY;
          pageIndex++;
        }

        // Add dynamic page numbers on multi-page documents
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdfWidth - margin - 4,
            pdfHeight - (margin / 2) + 0.5,
            { align: 'right' }
          );
        }
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
          id="preview-zoom-container"
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
