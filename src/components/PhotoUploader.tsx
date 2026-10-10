'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Camera,
  Upload,
  X,
  Eye,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { ReportPhotoItem } from '@/lib/types';

export interface AvailableDateOption {
  date: string;
  label: string;
  dayNumber?: number;
}

interface PhotoUploaderProps {
  photos: ReportPhotoItem[];
  onChange: (photos: ReportPhotoItem[]) => void;
  disabled?: boolean;
  availableDates?: AvailableDateOption[];
  defaultDate?: string;
  title?: string;
}

export default function PhotoUploader({
  photos,
  onChange,
  disabled = false,
  availableDates = [],
  defaultDate,
  title = 'Site Photos & Attachments',
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ReportPhotoItem | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Helper to format date cleanly
  const formatDateLabel = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB');
    } catch {}
    return dateStr;
  };

  // Helper to check if photo belongs to an option
  const isPhotoMatchingOption = (photo: ReportPhotoItem, opt: AvailableDateOption): boolean => {
    if (opt.dayNumber && photo.sectionKey === `day-${opt.dayNumber}`) return true;
    if (photo.date && opt.date && photo.date.split('T')[0] === opt.date.split('T')[0]) return true;
    if (photo.sectionKey && opt.date && photo.sectionKey.split('T')[0] === opt.date.split('T')[0]) return true;
    return false;
  };

  // Compute counts per available date
  const countsPerOption = useMemo(() => {
    const counts: Record<string, number> = {};
    availableDates.forEach((opt) => {
      const key = opt.date || `day-${opt.dayNumber}`;
      counts[key] = photos.filter((p) => isPhotoMatchingOption(p, opt)).length;
    });
    return counts;
  }, [photos, availableDates]);

  // Unassigned count
  const unassignedCount = useMemo(() => {
    if (availableDates.length === 0) return 0;
    return photos.filter((p) => !availableDates.some((opt) => isPhotoMatchingOption(p, opt))).length;
  }, [photos, availableDates]);

  // Filtered photos
  const filteredPhotosWithIndex = useMemo(() => {
    return photos
      .map((photo, originalIndex) => ({ photo, originalIndex }))
      .filter(({ photo }) => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'UNASSIGNED') {
          return !availableDates.some((opt) => isPhotoMatchingOption(photo, opt));
        }
        const targetOpt = availableDates.find((opt) => (opt.date || `day-${opt.dayNumber}`) === activeTab);
        if (targetOpt) {
          return isPhotoMatchingOption(photo, targetOpt);
        }
        return true;
      });
  }, [photos, activeTab, availableDates]);

  // Compress image on client
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              width = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsCompressing(true);
    const newPhotos: ReportPhotoItem[] = [...photos];

    // Determine default date/day tag for newly uploaded photos
    let initialDate = defaultDate ? defaultDate.split('T')[0] : '';
    let initialSectionKey: string | undefined = undefined;

    if (activeTab !== 'ALL' && activeTab !== 'UNASSIGNED') {
      const targetOpt = availableDates.find((opt) => (opt.date || `day-${opt.dayNumber}`) === activeTab);
      if (targetOpt) {
        initialDate = targetOpt.date ? targetOpt.date.split('T')[0] : initialDate;
        initialSectionKey = targetOpt.dayNumber ? `day-${targetOpt.dayNumber}` : targetOpt.date;
      }
    } else if (availableDates.length > 0) {
      initialDate = availableDates[0].date ? availableDates[0].date.split('T')[0] : initialDate;
      initialSectionKey = availableDates[0].dayNumber ? `day-${availableDates[0].dayNumber}` : availableDates[0].date;
    }

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
          const compressedBase64 = await compressImage(file);
          newPhotos.push({
            url: compressedBase64,
            caption: file.name.replace(/\.[^/.]+$/, ''), // Default caption to filename
            date: initialDate || undefined,
            sectionKey: initialSectionKey || initialDate || undefined,
          });
        }
      }
      onChange(newPhotos);
    } catch (err) {
      console.error('Error compressing image:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  };

  const handleDateOrDayChange = (index: number, selectedValue: string) => {
    const updated = [...photos];
    const item = { ...updated[index] };

    if (!selectedValue) {
      // General / unassigned
      item.date = undefined;
      item.sectionKey = undefined;
    } else {
      const matchedOpt = availableDates.find((opt) => opt.date === selectedValue || `day-${opt.dayNumber}` === selectedValue);
      if (matchedOpt) {
        item.date = matchedOpt.date ? matchedOpt.date.split('T')[0] : undefined;
        item.sectionKey = matchedOpt.dayNumber ? `day-${matchedOpt.dayNumber}` : matchedOpt.date;
      } else {
        // Direct date string
        item.date = selectedValue;
        item.sectionKey = selectedValue;
      }
    }

    updated[index] = item;
    onChange(updated);
  };

  // Get active day label for upload button
  const getActiveTabLabel = (): string => {
    if (activeTab === 'ALL') return 'Add Photos';
    if (activeTab === 'UNASSIGNED') return 'Add Unassigned Photos';
    const opt = availableDates.find((d) => (d.date || `day-${d.dayNumber}`) === activeTab);
    return opt?.dayNumber ? `Add Photos (Day ${opt.dayNumber})` : 'Add Photos';
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-400" />
            {title} ({photos.length})
          </label>
          {availableDates.length > 1 && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Photos can be date-labeled and grouped by day activity for clean multi-day reporting.
            </p>
          )}
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            {isCompressing ? 'Compressing...' : getActiveTabLabel()}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Date Filter Tabs for Multi-Day Reports */}
      {availableDates.length > 1 && photos.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 font-medium px-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-slate-400" /> View:
          </span>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Photos ({photos.length})
          </button>

          {availableDates.map((opt) => {
            const tabKey = opt.date || `day-${opt.dayNumber}`;
            const count = countsPerOption[tabKey] || 0;
            const isSelected = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{opt.dayNumber ? `Day ${opt.dayNumber}` : formatDateLabel(opt.date)}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-teal-400/20 text-teal-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {unassignedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('UNASSIGNED')}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === 'UNASSIGNED'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <span>Unassigned</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300">
                {unassignedCount}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 text-center transition-colors ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer bg-slate-950/40 hover:bg-slate-900/60'
          }`}
        >
          <ImageIcon className="w-9 h-9 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-200 font-medium">Click or Drag & Drop site photos here</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PNG, JPG, JPEG (Automatically compressed for instant report loading and high-res print)
          </p>
          {availableDates.length > 1 && (
            <p className="text-[10px] text-teal-400/90 mt-2 font-mono">
              Multiple reporting days detected: photos will be automatically date-tagged and grouped!
            </p>
          )}
        </div>
      ) : filteredPhotosWithIndex.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <p className="text-xs text-slate-400">No photos assigned to this day tab yet.</p>
          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-teal-400 hover:text-teal-300 underline cursor-pointer"
            >
              Upload photos directly for this day
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredPhotosWithIndex.map(({ photo, originalIndex }) => {
            // Determine active option for this photo
            const matchedOpt = availableDates.find((opt) => isPhotoMatchingOption(photo, opt));
            const displayDateStr = photo.date ? formatDateLabel(photo.date) : matchedOpt ? formatDateLabel(matchedOpt.date) : '';
            const dayLabel = matchedOpt?.dayNumber ? `Day ${matchedOpt.dayNumber}` : null;

            return (
              <div
                key={photo.id || originalIndex}
                className="group relative bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm transition-all"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Site Photo'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Date Badge Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                    {dayLabel ? (
                      <span className="px-1.5 py-0.5 rounded bg-teal-950/90 text-teal-300 text-[10px] font-bold border border-teal-700/80 shadow flex items-center gap-1 backdrop-blur-xs">
                        <span>{dayLabel}</span>
                        {displayDateStr && <span className="font-normal font-mono opacity-90">• {displayDateStr}</span>}
                      </span>
                    ) : displayDateStr ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-200 text-[10px] font-medium border border-slate-700 shadow flex items-center gap-1 font-mono backdrop-blur-xs">
                        <Calendar className="w-2.5 h-2.5 text-teal-400" />
                        {displayDateStr}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[9px] font-medium border border-amber-800/80 shadow backdrop-blur-xs">
                        General / No Date
                      </span>
                    )}
                  </div>

                  {/* Figure tag badge */}
                  <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-mono font-medium shadow backdrop-blur-xs">
                      Fig {originalIndex + 1}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className="p-1.5 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                      title="View Fullsize"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(originalIndex)}
                        className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
                        title="Delete Photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo Fields: Date Assignment & Caption */}
                <div className="p-2.5 space-y-2 bg-slate-950 flex-1 flex flex-col justify-between">
                  {/* Caption Input */}
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">
                      Caption / Finding Note
                    </label>
                    {disabled ? (
                      <p className="text-[11px] text-slate-300 truncate">{photo.caption || 'No caption'}</p>
                    ) : (
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => handleCaptionChange(originalIndex, e.target.value)}
                        placeholder="e.g. Inverter cable termination"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-md text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Date / Day Selection */}
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-teal-400" />
                        Reporting Date / Day
                      </span>
                    </label>

                    {disabled ? (
                      <div className="text-[11px] text-slate-400 font-mono">
                        {dayLabel ? `${dayLabel} (${displayDateStr})` : displayDateStr || 'Unassigned'}
                      </div>
                    ) : availableDates.length > 0 ? (
                      <select
                        value={matchedOpt?.date || photo.date || ''}
                        onChange={(e) => handleDateOrDayChange(originalIndex, e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-md text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="">General / Unassigned</option>
                        {availableDates.map((opt) => (
                          <option key={opt.date || opt.label} value={opt.date}>
                            {opt.dayNumber ? `Day ${opt.dayNumber}: ` : ''}
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={photo.date || ''}
                        onChange={(e) => handleDateOrDayChange(originalIndex, e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-md text-[11px] text-slate-200 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Size Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Site Photo Preview'}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
              {selectedPhoto.caption && (
                <p className="text-white text-xs bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-700 font-medium shadow">
                  {selectedPhoto.caption}
                </p>
              )}
              {selectedPhoto.date && (
                <p className="text-teal-300 text-xs bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-800 font-mono shadow flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date: {formatDateLabel(selectedPhoto.date)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="mt-3 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Press outside or click here to close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
