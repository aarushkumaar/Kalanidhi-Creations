'use client';
import { useState } from 'react';
import { storage } from '@/utils/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/components/ui/Toast';

interface Props {
  bucket: string; // Used as folder path in Firebase
  onUpload: (url: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ bucket, onUpload, currentImage }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${bucket}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      const url = await getDownloadURL(storageRef);
      onUpload(url);
      toast('Image uploaded successfully', 'success');
    } catch (error: any) {
      console.error(error);
      toast('Error uploading image: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!currentImage) return;
    try {
      const storageRef = ref(storage, currentImage);
      await deleteObject(storageRef);
      onUpload('');
      toast('Image removed', 'success');
      } catch {
      // Even if delete fails (e.g. file moved), clear the state
      onUpload('');
    }
  };

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative aspect-square w-48 bg-muted border border-border">
          <Image src={currentImage} alt="Uploaded" fill className="object-cover" />
          <button 
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-background border border-gold rounded-full p-1 hover:text-red-500 z-10 shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-border hover:border-gold/50 hover:bg-gold/5 transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground group-hover:text-gold transition-colors">
            <UploadCloud className="w-6 h-6 mb-2" />
            <p className="text-xs uppercase tracking-widest">{uploading ? 'Uploading...' : 'Click to Upload'}</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
