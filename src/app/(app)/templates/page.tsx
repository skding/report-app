'use client';

import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  Plus,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  CheckCircle2,
  Zap,
  Save,
  X,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ChecklistTemplateData, ChecklistSection, ChecklistItem } from '@/lib/types';

export default function ChecklistTemplatesPage() {
  const [templates, setTemplates] = useState<ChecklistTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplateData | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateNewTemplate = () => {
    const newTpl: ChecklistTemplateData = {
      id: '',
      title: 'New Site Maintenance Checklist',
      category: 'Building Automation',
      description: 'Customized site preventive maintenance procedure.',
      isDefault: false,
      sections: [
        {
          id: `sec_${Date.now()}_1`,
          code: '1.1',
          title: 'System Preparation & Status',
          instructions: 'Check system status and RUN LED indicators.',
          items: [
            {
              id: `item_${Date.now()}_1`,
              text: 'Processor: RUN LED status on all controllers',
              type: 'status',
              options: ['OK', 'PL', 'N/A'],
            },
          ],
        },
        {
          id: `sec_${Date.now()}_2`,
          code: '1.2',
          title: 'Power Supply DC Voltage Measurements',
          instructions: 'Measure DC voltage (Spec: 24Vdc ±5%).',
          items: [
            {
              id: `item_${Date.now()}_2`,
              text: 'Main Control Panel 24Vdc PSU',
              type: 'measurement',
              spec: '24Vdc ±5%',
              unit: 'Vdc',
              target: 24.0,
              tolerance: 1.2,
              options: ['OK', 'PL', 'N/A'],
            },
          ],
        },
      ],
    };
    setEditingTemplate(newTpl);
    setShowEditorModal(true);
  };

  const handleEditTemplate = (tpl: ChecklistTemplateData) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl)));
    setShowEditorModal(true);
  };

  const handleCloneTemplate = (tpl: ChecklistTemplateData) => {
    const clone: ChecklistTemplateData = JSON.parse(JSON.stringify(tpl));
    clone.id = '';
    clone.title = `${tpl.title} (Clone)`;
    clone.isDefault = false;
    setEditingTemplate(clone);
    setShowEditorModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.title.trim()) {
      alert('Please provide a template title');
      return;
    }

    setSaving(true);
    try {
      const isNew = !editingTemplate.id;
      const url = isNew ? '/api/templates' : `/api/templates/${editingTemplate.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });

      if (res.ok) {
        setShowEditorModal(false);
        setEditingTemplate(null);
        fetchTemplates();
      }
    } catch (e) {
      console.error('Error saving template:', e);
    } finally {
      setSaving(false);
    }
  };

  // Section & Item mutators
  const addSection = () => {
    if (!editingTemplate) return;
    const sCount = editingTemplate.sections.length + 1;
    const newSec: ChecklistSection = {
      id: `sec_${Date.now()}`,
      code: `1.${sCount}`,
      title: `New Inspection Section`,
      items: [
        {
          id: `item_${Date.now()}`,
          text: 'Inspection procedure item...',
          type: 'status',
          options: ['OK', 'PL', 'N/A'],
        },
      ],
    };
    setEditingTemplate({
      ...editingTemplate,
      sections: [...editingTemplate.sections, newSec],
    });
  };

  const removeSection = (sIdx: number) => {
    if (!editingTemplate) return;
    const updated = editingTemplate.sections.filter((_, idx) => idx !== sIdx);
    setEditingTemplate({ ...editingTemplate, sections: updated });
  };

  const addItemToSection = (sIdx: number) => {
    if (!editingTemplate) return;
    const updatedSections = [...editingTemplate.sections];
    updatedSections[sIdx].items.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: 'New checklist test item',
      type: 'status',
      options: ['OK', 'PL', 'N/A'],
    });
    setEditingTemplate({ ...editingTemplate, sections: updatedSections });
  };

  const removeItemFromSection = (sIdx: number, iIdx: number) => {
    if (!editingTemplate) return;
    const updatedSections = [...editingTemplate.sections];
    updatedSections[sIdx].items = updatedSections[sIdx].items.filter((_, idx) => idx !== iIdx);
    setEditingTemplate({ ...editingTemplate, sections: updatedSections });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Dynamic PM Checklist Templates</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Design site-specific maintenance checklists with voltage tolerances, OK/PL/NA buttons & backups
          </p>
        </div>
        <button
          onClick={handleCreateNewTemplate}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Checklist Template</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => {
          const totalItems = tpl.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0;

          return (
            <div
              key={tpl.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {tpl.category}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{tpl.title}</h3>
                    </div>
                  </div>
                  {tpl.isDefault && (
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold uppercase">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2">{tpl.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Sections</span>
                    <span className="font-bold text-white">{tpl.sections?.length || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Check Items</span>
                    <span className="font-bold text-emerald-400">{totalItems} Checks</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleCloneTemplate(tpl)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Clone
                </button>
                <button
                  onClick={() => handleEditTemplate(tpl)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Builder Modal */}
      {showEditorModal && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTemplate.id ? 'Edit Checklist Template' : 'Create PM Checklist Template'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure sections, measurement thresholds & OK/PL inspection rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Template Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Template Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, title: e.target.value })
                    }
                    placeholder="e.g. Standard PLC & SCADA Building Automation PM Checklist"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingTemplate.category}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, category: e.target.value })
                    }
                    placeholder="e.g. BMS, Chiller Plant, UPS"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingTemplate.description || ''}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, description: e.target.value })
                    }
                    placeholder="Describe what equipment or sites this PM checklist applies to..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white resize-none"
                  />
                </div>
              </div>

              {/* Sections Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Checklist Sections ({editingTemplate.sections.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addSection}
                    className="px-3 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>

                {editingTemplate.sections.map((section, sIdx) => (
                  <div
                    key={section.id || sIdx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={section.code || `1.${sIdx + 1}`}
                          onChange={(e) => {
                            const updated = [...editingTemplate.sections];
                            updated[sIdx].code = e.target.value;
                            setEditingTemplate({ ...editingTemplate, sections: updated });
                          }}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-center text-white"
                        />
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const updated = [...editingTemplate.sections];
                            updated[sIdx].title = e.target.value;
                            setEditingTemplate({ ...editingTemplate, sections: updated });
                          }}
                          placeholder="Section Title (e.g. PLC Software Backup)"
                          className="flex-1 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section items list */}
                    <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={item.id || iIdx}
                          className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-mono text-slate-500">
                              {String.fromCharCode(97 + (iIdx % 26))}.
                            </span>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                                const updated = [...editingTemplate.sections];
                                updated[sIdx].items[iIdx].text = e.target.value;
                                setEditingTemplate({ ...editingTemplate, sections: updated });
                              }}
                              placeholder="Test procedure text..."
                              className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            {/* Type selector */}
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const updated = [...editingTemplate.sections];
                                updated[sIdx].items[iIdx].type = e.target.value as any;
                                setEditingTemplate({ ...editingTemplate, sections: updated });
                              }}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300"
                            >
                              <option value="status">Status (OK/PL/NA)</option>
                              <option value="measurement">Voltage / Reading</option>
                            </select>

                            {item.type === 'measurement' && (
                              <input
                                type="text"
                                value={item.spec || ''}
                                onChange={(e) => {
                                  const updated = [...editingTemplate.sections];
                                  updated[sIdx].items[iIdx].spec = e.target.value;
                                  setEditingTemplate({ ...editingTemplate, sections: updated });
                                }}
                                placeholder="Spec: 24Vdc ±5%"
                                className="w-28 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-amber-300 font-mono"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => removeItemFromSection(sIdx, iIdx)}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addItemToSection(sIdx)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" /> Add Test Item to Section
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
              >
                <Save className="w-4 h-4" />
                <span>Save Checklist Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
