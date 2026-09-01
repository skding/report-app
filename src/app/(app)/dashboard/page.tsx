'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Wrench,
  Activity,
  ClipboardList,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  ArrowUpRight,
  Search,
  Building,
  Filter,
  Eye,
  Download,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { FullReport, ReportType, ReportStatus } from '@/lib/types';

export default function DashboardPage() {
  const [reports, setReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error('Error fetching reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Stats calculation
  const totalReports = reports.length;
  const esrCount = reports.filter((r) => r.type === 'SERVICE').length;
  const dsrCount = reports.filter((r) => r.type === 'SITE_WORK').length;
  const pmrCount = reports.filter((r) => r.type === 'MAINTENANCE').length;
  const completedCount = reports.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'EMAILED'
  ).length;
  const pendingCount = reports.filter((r) => r.status === 'DRAFT' || r.status === 'PENDING_SIGNATURE').length;

  const filteredReports = reports.filter((r) => {
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNo = r.reportNumber.toLowerCase().includes(q);
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchCustomer = (r.customer?.name || '').toLowerCase().includes(q);
      const matchSite = (r.site?.name || '').toLowerCase().includes(q);
      const matchAuthor = (r.author?.name || '').toLowerCase().includes(q);
      return matchNo || matchTitle || matchCustomer || matchSite || matchAuthor;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Clover Digital Sdn Bhd
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Site Service & Maintenance Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Digital dispatching, real-time checklist execution, and customer verification portal
          </p>
        </div>

        {/* Quick Create Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/reports/new?type=SERVICE"
            className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            + Service (ESR)
          </Link>
          <Link
            href="/reports/new?type=SITE_WORK"
            className="px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            + Site Work (DSR)
          </Link>
          <Link
            href="/reports/new?type=MAINTENANCE"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            + Maintenance (PMR)
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Reports</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalReports}</p>
          <span className="text-[10px] text-slate-500 mt-1">All record types</span>
        </div>

        {/* ESR */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase">Service (ESR)</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{esrCount}</p>
          <span className="text-[10px] text-slate-500 mt-1">Adhoc breakdown</span>
        </div>

        {/* DSR */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-teal-400 uppercase">Site Logs (DSR)</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{dsrCount}</p>
          <span className="text-[10px] text-slate-500 mt-1">Daily activities</span>
        </div>

        {/* PMR */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">PM Reports (PMR)</span>
            <ClipboardList className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{pmrCount}</p>
          <span className="text-[10px] text-slate-500 mt-1">Checklists & Backups</span>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{completedCount}</p>
          <span className="text-[10px] text-emerald-400/80 mt-1">Signed & Verified</span>
        </div>

        {/* Pending */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{pendingCount}</p>
          <span className="text-[10px] text-amber-400/80 mt-1">Draft or Unsigned</span>
        </div>
      </div>

      {/* Reports Data Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Report No, Customer, Site, or Engineer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter by Type */}
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'ESR', value: 'SERVICE' },
                { label: 'DSR', value: 'SITE_WORK' },
                { label: 'PMR', value: 'MAINTENANCE' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilterType(t.value)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    filterType === t.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Report No.</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Customer & Site Location</th>
                <th className="p-3.5">Title / Subject</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Attended By</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const typeBadge =
                    report.type === 'SERVICE'
                      ? { label: 'ESR (Service)', color: 'bg-blue-950 text-blue-400 border-blue-800' }
                      : report.type === 'SITE_WORK'
                      ? { label: 'DSR (Site)', color: 'bg-teal-950 text-teal-400 border-teal-800' }
                      : { label: 'PMR (PM)', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };

                  const statusBadge =
                    report.status === 'COMPLETED'
                      ? { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
                      : report.status === 'EMAILED'
                      ? { label: 'Emailed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
                      : report.status === 'VOIDED'
                      ? { label: 'Voided', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
                      : report.status === 'ARCHIVED'
                      ? { label: 'Archived', color: 'bg-slate-800 text-slate-400 border-slate-700' }
                      : { label: 'Draft', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-900/80 transition-colors group cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                        <Link href={`/reports/${report.id}`} className="hover:text-emerald-400">
                          {report.reportNumber}
                        </Link>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white truncate max-w-[180px]">
                          {report.customer?.name || '—'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {report.site?.name || '—'}
                        </p>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-slate-200">
                        {report.title || 'Untitled Report'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-400">
                        {new Date(report.reportDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-300">
                        {report.engineerName || report.author?.name || '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/reports/${report.id}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="Open Split-View Editor"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/reports/${report.id}/print`}
                            target="_blank"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="Print / Vector View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
