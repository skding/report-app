'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Wrench,
  Activity,
  ClipboardList,
  Search,
  Plus,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Building,
  Calendar,
} from 'lucide-react';
import { FullReport, ReportType } from '@/lib/types';

export default function ReportsListPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';

  const [reports, setReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>(initialType);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (searchParams.get('type')) {
      setFilterType(searchParams.get('type')!);
    }
  }, [searchParams]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">All Service & Maintenance Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Central repository of digital service sheets, daily activity logs & PM checklists
          </p>
        </div>
        <Link
          href="/reports/new"
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by number, client, site, engineer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type selector */}
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
              {[
                { label: 'All Types', value: 'ALL' },
                { label: 'ESR (Service)', value: 'SERVICE' },
                { label: 'DSR (Site)', value: 'SITE_WORK' },
                { label: 'PMR (PM)', value: 'MAINTENANCE' },
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

            {/* Status Selector */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="EMAILED">Emailed</option>
              <option value="ARCHIVED">Archived</option>
              <option value="VOIDED">Voided / Cancelled</option>
            </select>

            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 mt-3">
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
                    No reports found matching the criteria.
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
                            title="Print / PDF View"
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
