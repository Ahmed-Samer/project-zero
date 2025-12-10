import { useState } from 'react';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // الاسم اللي انت جبته
    formData.append('cloud_name', 'docnda9v9');     // الاسم اللي انت جبته

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/docnda9v9/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      setUploading(false);
      return data.secure_url; // ده رابط الصورة اللي هنحفظه
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message);
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, error };
}