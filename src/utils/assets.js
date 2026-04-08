export const proxify = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // If it's already a proxied URL or local, return as is
  if (url.startsWith('http://localhost') || url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }

  // Only proxify R2 or Cloudflare urls
  if (url.includes('.r2.dev/') || url.includes('cloudflarestorage.com/')) {
    try {
      // Handle the case where the URL might have multiple path segments
      // Typical: https://bucket.r2.dev/images/user-id/filename.png
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      
      if (segments.length >= 3) {
        const filename = segments.pop();
        const userId = segments.pop();
        const fileType = segments.pop();
        return `http://localhost:8000/api/v1/assets/${fileType}/${userId}/${filename}`;
      }
    } catch (e) {
      console.error("[Proxify] Failed to parse URL:", url, e);
    }
  }
  
  return url;
};
