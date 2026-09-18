'use client';

import React, { useState, useEffect } from 'react';
import { Building, MapPin, AlertCircle, CheckCircle2, Loader2, X, AlertTriangle } from 'lucide-react';
import { FullReport } from '@/lib/types';

interface ChangeCustomerSiteModalProps {
  report: FullReport;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedReport: FullReport) => void;
}

export default function ChangeCustomerSiteModal({
  report,
  isOpen,
  onClose,
  onSuccess,
}: ChangeCustomerSiteModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(report.customerId || '');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(report.siteId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load customers when opened
  useEffect(() => {
    if (!isOpen) return;

    setSelectedCustomerId(report.customerId || '');
    setSelectedSiteId(report.siteId || '');
    setError('');

    async function loadCustomers() {
      setLoadingCustomers(true);
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        if (data.customers) {
          setCustomers(data.customers);
        }
      } catch (err: any) {
        console.error('Failed to load customers:', err);
        setError('Failed to load customer list.');
      } finally {
        setLoadingCustomers(false);
      }
    }
    loadCustomers();
  }, [isOpen, report.customerId, report.siteId]);

  // When customer changes, update available sites
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availableSites = selectedCustomer?.sites || [];

  const handleCustomerChange = (newCustId: string) => {
    setSelectedCustomerId(newCustId);
    const newCust = customers.find((c) => c.id === newCustId);
    if (newCust?.sites && newCust.sites.length > 0) {
      setSelectedSiteId(newCust.sites[0].id);
    } else {
      setSelectedSiteId('');
    }
  };

  const handleSave = async () => {
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          siteId: selectedSiteId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update customer & site');
      }

      onSuccess(data.report);
      onClose();
    } catch (err: any) {
      console.error('Error updating customer and site:', err);
      setError(err.message || 'Error updating customer & site');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentSite = availableSites.find((s: any) => s.id === selectedSiteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Change Customer & Site</h3>
              <p className="text-[11px] text-slate-400">
                Report No: <span className="font-mono text-emerald-400">{report.reportNumber}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Correction of Client / Site Selection</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                If the report was assigned to the wrong customer or location, choose the correct records below. This will immediately update the report header and the live PDF document.
              </p>
            </div>
          </div>

          {loadingCustomers ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Loading customer directory...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Customer Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  Select Customer Company <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.regNo ? `(${c.regNo})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-1">
                    Contact: {selectedCustomer.contactPerson || selectedCustomer.email || 'N/A'}
                  </p>
                )}
              </div>

              {/* Site Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  Select Site Location
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={availableSites.length === 0}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs disabled:opacity-50"
                >
                  {availableSites.length === 0 ? (
                    <option value="">No sites registered for this customer</option>
                  ) : (
                    availableSites.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.address ? `— ${s.address.slice(0, 40)}...` : ''}
                      </option>
                    ))
                  )}
                </select>
                {currentSite && (
                  <div className="mt-1.5 p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                    <p className="text-slate-300 font-medium">{currentSite.name}</p>
                    {currentSite.address && <p className="text-slate-400">{currentSite.address}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadingCustomers || !selectedCustomerId}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
