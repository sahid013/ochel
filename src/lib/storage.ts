import { supabase } from './supabase';

const BUCKET_NAME = 'menu-images';

export type StorageFolder = 'menu-item' | 'add-ons';

interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param folder - The folder to upload to ('menu-item' or 'add-ons')
 * @returns The storage path and public URL
 */
export async function uploadImage(
  file: File,
  folder: StorageFolder
): Promise<UploadResult> {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path - The storage path of the file to delete
 */
export async function deleteImage(path: string): Promise<void> {
  if (!path) return;

  try {
    // Extract the path without the public URL prefix if present
    const storagePath = path.includes(BUCKET_NAME)
      ? path.split(`${BUCKET_NAME}/`)[1]
      : path;

    if (!storagePath) {
      console.warn('Invalid storage path:', path);
      return;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Delete error:', error);
      // Don't throw - we don't want to block deletion if image removal fails
      console.warn(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    // Don't throw - we don't want to block deletion if image removal fails
  }
}

/**
 * Replace an image (delete old, upload new)
 * @param oldPath - The storage path of the old image to delete
 * @param newFile - The new file to upload
 * @param folder - The folder to upload to
 * @returns The new storage path and public URL
 */
export async function replaceImage(
  oldPath: string | null,
  newFile: File,
  folder: StorageFolder
): Promise<UploadResult> {
  try {
    // Upload new image first
    const result = await uploadImage(newFile, folder);

    // Delete old image if it exists (don't wait for it)
    if (oldPath) {
      deleteImage(oldPath).catch((err) =>
        console.warn('Failed to delete old image:', err)
      );
    }

    return result;
  } catch (error) {
    console.error('Replace error:', error);
    throw error;
  }
}

/**
 * Extract storage path from a full URL or path
 * @param urlOrPath - Full URL or storage path
 * @returns Storage path only
 */
export function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return '';

  // If it's a full URL, extract the path
  if (urlOrPath.includes('supabase.co/storage/v1/object/public/')) {
    const parts = urlOrPath.split(`${BUCKET_NAME}/`);
    return parts[1] || '';
  }

  // If it starts with bucket name, remove it
  if (urlOrPath.startsWith(`${BUCKET_NAME}/`)) {
    return urlOrPath.substring(`${BUCKET_NAME}/`.length);
  }

  return urlOrPath;
}

/**
 * Check if a path is a Supabase Storage URL
 * @param path - The path to check
 * @returns True if it's a Supabase URL
 */
export function isSupabaseUrl(path: string): boolean {
  return path?.includes('supabase.co/storage/v1/object/public/') || false;
}

/**
 * Check if a path is a local file path
 * @param path - The path to check
 * @returns True if it's a local path
 */
export function isLocalPath(path: string): boolean {
  return path?.startsWith('/images/') || false;
}
