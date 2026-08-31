'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Image as ImageIcon } from 'lucide-react';
import { ReportPhotoItem } from '@/lib/types';

interface PhotoUploaderProps {
  photos: ReportPhotoItem[];
  onChange: (photos: ReportPhotoItem[]) => void;
  disabled?: boolean;
}

export default function PhotoUploader({ photos, onChange, disabled = false }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ReportPhotoItem | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

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
              height = maxHeight;
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

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
          const compressedBase64 = await compressImage(file);
          newPhotos.push({
            url: compressedBase64,
            caption: file.name.replace(/\.[^/.]+$/, ''), // Default caption to filename
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-400" />
          Site Photos & Attachments ({photos.length})
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="text-xs px-3 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {isCompressing ? 'Compressing...' : 'Add Photos'}
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

      {photos.length === 0 ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center transition-colors ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer bg-slate-950/40 hover:bg-slate-900/60'
          }`}
        >
          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">Click or Drag & Drop site photos here</p>
          <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, JPEG (Compressed automatically for fast PDF generation)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm"
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Site Photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-1.5 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    title="View Fullsize"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-1.5">
                {disabled ? (
                  <p className="text-[11px] text-slate-400 truncate px-1">{photo.caption || 'No caption'}</p>
                ) : (
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder="Photo caption / note..."
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Size Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="relative max-h-[80vh] overflow-hidden rounded-xl">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Site Photo'}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
            {selectedPhoto.caption && (
              <p className="text-white text-sm mt-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
