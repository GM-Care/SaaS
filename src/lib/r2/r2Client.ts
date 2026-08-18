/**
 * ============================================================================
 * CLOUDFLARE R2 BUCKET STORAGE ENGINE (ZERO EGRESS FEES)
 * ============================================================================
 * Handles auditorium photo uploads (up to 10 photos) and virtual video tour
 * assets directly on Cloudflare R2 object storage.
 * ============================================================================
 */

export interface R2UploadResult {
  success: boolean;
  publicUrl?: string;
  key?: string;
  error?: string;
}

export const r2Service = {
  /**
   * Uploads an image or media buffer directly to Cloudflare R2
   */
  uploadMedia: async (
    bucket: R2Bucket,
    key: string,
    fileData: ArrayBuffer | Uint8Array,
    contentType: string = 'image/jpeg'
  ): Promise<R2UploadResult> => {
    try {
      await bucket.put(key, fileData, {
        httpMetadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000'
        },
        customMetadata: {
          uploadedAt: new Date().toISOString()
        }
      });

      // Public asset URL or Worker edge proxy URL
      const publicUrl = `/api/media/${encodeURIComponent(key)}`;
      return { success: true, publicUrl, key };
    } catch (err: any) {
      console.error('[R2 Storage Error]', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Retrieves an object from Cloudflare R2
   */
  getMedia: async (bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> => {
    try {
      return await bucket.get(key);
    } catch (err) {
      console.error('[R2 Get Error]', err);
      return null;
    }
  },

  /**
   * Deletes an object from Cloudflare R2
   */
  deleteMedia: async (bucket: R2Bucket, key: string): Promise<boolean> => {
    try {
      await bucket.delete(key);
      return true;
    } catch (err) {
      console.error('[R2 Delete Error]', err);
      return false;
    }
  }
};
