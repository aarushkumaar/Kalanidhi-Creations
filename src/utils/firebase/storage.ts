import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadPieceImage(
  pieceId: string,
  file: File
): Promise<string> {
  const ext      = file.name.split('.').pop();
  const filename = `${Date.now()}.${ext}`;
  const path     = `pieces/${pieceId}/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000',
  });

  return getDownloadURL(storageRef);
}

export async function uploadCategoryImage(
  categorySlug: string,
  file: File
): Promise<string> {
  const ext      = file.name.split('.').pop();
  const filename = `cover.${ext}`;
  const path     = `categories/${categorySlug}/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  // Extract path from full Storage URL
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}
