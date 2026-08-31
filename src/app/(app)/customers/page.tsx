'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Wrench,
  Edit,
  Trash2,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState<string | null>(null); // customerId

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustRegNo, setNewCustRegNo] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustContact, setNewCustContact] = useState('');

  // New Site Form State
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [newSiteContact, setNewSiteContact] = useState('');
  const [newSitePhone, setNewSitePhone] = useState('');
  const [newSiteEmail, setNewSiteEmail] = useState('');
  const [newSiteTemplateId, setNewSiteTemplateId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, tplRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/templates'),
      ]);
      const custData = await custRes.json();
      const tplData = await tplRes.json();
      setCustomers(custData.customers || []);
      setTemplates(tplData.templates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          regNo: newCustRegNo,
          email: newCustEmail,
          phone: newCustPhone,
          address: newCustAddress,
          contactPerson: newCustContact,
        }),
      });
      if (res.ok) {
        setShowAddCustomerModal(false);
        setNewCustName('');
        setNewCustRegNo('');
        setNewCustEmail('');
        setNewCustPhone('');
        setNewCustAddress('');
        setNewCustContact('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddSiteModal) return;

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: showAddSiteModal,
          name: newSiteName,
          address: newSiteAddress,
          contactPerson: newSiteContact,
          contactPhone: newSitePhone,
          contactEmail: newSiteEmail,
          defaultTemplateId: newSiteTemplateId || null,
        }),
      });
      if (res.ok) {
        setShowAddSiteModal(null);
        setNewSiteName('');
        setNewSiteAddress('');
        setNewSiteContact('');
        setNewSitePhone('');
        setNewSiteEmail('');
        setNewSiteTemplateId('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.regNo && c.regNo.toLowerCase().includes(q)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      (c.sites && c.sites.some((s: any) => s.name.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customer & Site Location Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage enterprise clients, plant facilities, equipment assets & default PM templates
          </p>
        </div>
        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, site, or contact person..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Customer Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {customer.name}
                    </h3>
                    {customer.regNo && (
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Co. Reg: {customer.regNo}
                      </p>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded-lg">
                  {customer._count?.reports || 0} Reports Filed
                </span>
              </div>

              {/* Meta details */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Contact Person</span>
                  <span className="font-medium text-slate-200">
                    {customer.contactPerson || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Phone / Email</span>
                  <span className="text-slate-200">
                    {customer.phone || customer.email || '—'}
                  </span>
                </div>
                {customer.address && (
                  <div className="sm:col-span-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                    {customer.address}
                  </div>
                )}
              </div>

              {/* Sites Section */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Sites / Plant Locations ({customer.sites?.length || 0})
                  </span>
                  <button
                    onClick={() => setShowAddSiteModal(customer.id)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Site
                  </button>
                </div>

                <div className="space-y-2">
                  {customer.sites?.map((site: any) => (
                    <div
                      key={site.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {site.name}
                        </h4>
                        {site.defaultTemplate && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded font-medium">
                            {site.defaultTemplate.title}
                          </span>
                        )}
                      </div>
                      {site.address && (
                        <p className="text-[11px] text-slate-400">{site.address}</p>
                      )}
                      {site.contactPerson && (
                        <p className="text-[10px] text-slate-500">
                          Site Rep: {site.contactPerson} {site.contactPhone ? `(${site.contactPhone})` : ''}
                        </p>
                      )}
                      {site.equipment?.length > 0 && (
                        <div className="pt-1 flex gap-1.5 flex-wrap">
                          {site.equipment.map((eq: any) => (
                            <span
                              key={eq.id}
                              className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded"
                            >
                              {eq.name} ({eq.model || eq.tagNo})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <Link
                href={`/reports/new?customerId=${customer.id}`}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                + Issue Report for this Client &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-semibold text-white">Add New Customer</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. TNB Engineering Corporation Sdn Bhd"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration No
                  </label>
                  <input
                    type="text"
                    value={newCustRegNo}
                    onChange={(e) => setNewCustRegNo(e.target.value)}
                    placeholder="e.g. 199301012345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={newCustContact}
                    onChange={(e) => setNewCustContact(e.target.value)}
                    placeholder="e.g. En. Ahmad Zaki"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="facility@tnbec.com.my"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+60 3-2282 5555"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Official office / billing address..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white resize-none"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-semibold text-white">Add Site / Plant Location</h3>
              <button
                onClick={() => setShowAddSiteModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSite} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g. IJN Chiller Plant / Pangkalan Bun Mill"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Physical Site Address
                </label>
                <input
                  type="text"
                  value={newSiteAddress}
                  onChange={(e) => setNewSiteAddress(e.target.value)}
                  placeholder="Address or coordinates..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Site Contact Person
                  </label>
                  <input
                    type="text"
                    value={newSiteContact}
                    onChange={(e) => setNewSiteContact(e.target.value)}
                    placeholder="e.g. En. Shahril"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newSitePhone}
                    onChange={(e) => setNewSitePhone(e.target.value)}
                    placeholder="+60 12-987 6543"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default PM Checklist Template
                </label>
                <select
                  value={newSiteTemplateId}
                  onChange={(e) => setNewSiteTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="">None (Use Standard Template)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
