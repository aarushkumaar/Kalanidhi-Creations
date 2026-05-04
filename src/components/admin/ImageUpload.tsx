'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface FileState {
  id: string;
  file: File;
  preview: string;        // object URL for instant thumbnail
  progress: number;       // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  url: string;            // Cloudinary secure_url after success
  error?: string;
}

interface Props {
  /** Firestore folder hint — not used in Cloudinary path but kept for API compat */
  bucket?: string;
  /** Called with the first uploaded URL (backward compat) */
  onUpload?: (url: string) => void;
  /** Called with all uploaded URLs (multi-file mode) */
  onUploadMultiple?: (urls: string[]) => void;
  currentImage?: string;
  maxFiles?: number;
  label?: string;
}

/* ─── Cloudinary unsigned upload via XHR ───────────────────────────────────── */
function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

    if (!cloudName || cloudName === 'your_cloud_name') {
      reject(new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured.'));
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    form.append('folder', 'kalanidhi');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url as string);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error?.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.send(form);
  });
}

/* ─── Progress bar ──────────────────────────────────────────────────────────── */
function ProgressBar({ progress, status }: { progress: number; status: FileState['status'] }) {
  const color =
    status === 'done'  ? 'bg-emerald-500' :
    status === 'error' ? 'bg-red-500'     :
                         'bg-[#c9a96e]';
  return (
    <div className="mt-1 h-0.5 w-full bg-[#C9B8A8]/30 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── Single file preview card ──────────────────────────────────────────────── */
function FileCard({ item, onRemove }: { item: FileState; onRemove: (id: string) => void }) {
  return (
    <div className="relative group w-28 flex-shrink-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2D9D0]">
        <Image
          src={item.preview}
          alt={item.file.name}
          fill
          className="object-cover"
          sizes="112px"
          unoptimized // object URL — skip Next.js optimisation
        />
        {/* Status overlay */}
        {item.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-medium">{item.progress}%</span>
          </div>
        )}
        {item.status === 'done' && (
          <div className="absolute top-1.5 right-1.5">
            <CheckCircle size={14} className="text-emerald-400 drop-shadow" />
          </div>
        )}
        {item.status === 'error' && (
          <div className="absolute top-1.5 right-1.5">
            <AlertCircle size={14} className="text-red-400 drop-shadow" />
          </div>
        )}
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute -top-2 -right-2 bg-white border border-[#C9B8A8] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shadow-sm z-10"
        >
          <X size={12} />
        </button>
      </div>
      <ProgressBar progress={item.progress} status={item.status} />
      {item.error && (
        <p className="text-[9px] text-red-500 mt-0.5 leading-tight truncate" title={item.error}>{item.error}</p>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function ImageUpload({
  onUpload,
  onUploadMultiple,
  currentImage,
  maxFiles = 20,
  label = 'Click or drag to upload',
}: Props) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Remove a file from the list and revoke its object URL */
  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  /* Upload a batch of File objects */
  const uploadFiles = useCallback(async (selected: File[]) => {
    const available = maxFiles - files.length;
    const batch = selected.slice(0, available);
    if (batch.length === 0) {
      toast(`Maximum ${maxFiles} images allowed`, 'error');
      return;
    }

    // Instantiate file states with preview
    const newItems: FileState[] = batch.map(f => ({
      id:       Math.random().toString(36).slice(2),
      file:     f,
      preview:  URL.createObjectURL(f),
      progress: 0,
      status:   'pending',
      url:      '',
    }));

    setFiles(prev => [...prev, ...newItems]);

    // Upload all in parallel with individual progress tracking
    const uploadPromises = newItems.map(item =>
      uploadToCloudinary(item.file, (pct) => {
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, progress: pct, status: 'uploading' } : f
        ));
      })
        .then(url => {
          setFiles(prev => prev.map(f =>
            f.id === item.id ? { ...f, url, progress: 100, status: 'done' } : f
          ));
          return url;
        })
        .catch(err => {
          setFiles(prev => prev.map(f =>
            f.id === item.id ? { ...f, status: 'error', error: err.message } : f
          ));
          return null;
        })
    );

    const results = await Promise.all(uploadPromises);
    const successUrls = results.filter(Boolean) as string[];

    if (successUrls.length > 0) {
      toast(`${successUrls.length} image${successUrls.length > 1 ? 's' : ''} uploaded`, 'success');
      onUploadMultiple?.(successUrls);
      onUpload?.(successUrls[0]);
    }
    const errorCount = results.filter(r => r === null).length;
    if (errorCount > 0) {
      toast(`${errorCount} upload${errorCount > 1 ? 's' : ''} failed`, 'error');
    }
  }, [files.length, maxFiles, onUpload, onUploadMultiple]);

  /* File input change handler */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) uploadFiles(selected);
    e.target.value = ''; // reset so same files can be re-selected
  };

  /* Drag & drop */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (dropped.length) uploadFiles(dropped);
  };

  const doneUrls = files.filter(f => f.status === 'done').map(f => f.url);
  const uploading = files.some(f => f.status === 'uploading' || f.status === 'pending');

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Existing single image (backwards compat) */}
      {currentImage && files.length === 0 && (
        <div className="relative w-28 aspect-[3/4] overflow-hidden bg-[#F2D9D0]">
          <Image src={currentImage} alt="Current" fill className="object-cover" sizes="112px" />
        </div>
      )}

      {/* File preview grid */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map(item => (
            <FileCard key={item.id} item={item} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      {files.length < maxFiles && (
        <label
          className={`flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-[#c9a96e] bg-[#c9a96e]/5 scale-[1.01]'
              : 'border-[#C9B8A8] hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/5'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-[#7a6a60] pointer-events-none">
            <UploadCloud size={22} className={dragOver ? 'text-[#c9a96e]' : ''} />
            <p className="text-[10px] uppercase tracking-widest">
              {uploading ? 'Uploading…' : label}
            </p>
            <p className="text-[9px] text-[#C9B8A8] tracking-wide">
              Up to {maxFiles} images · JPG, PNG, WEBP
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
      )}

      {/* Completed URLs summary (for debugging / hidden field population) */}
      {doneUrls.length > 0 && (
        <p className="text-[9px] text-[#c9a96e] uppercase tracking-widest">
          {doneUrls.length} image{doneUrls.length > 1 ? 's' : ''} ready
        </p>
      )}
    </div>
  );
}
