'use client';

import { useState } from 'react';
import { UploadWidget } from './UploadWidget';
import { PhotoGrid } from './PhotoGrid';
import { searchPhotos } from '@/services/galleryApi';

export default function GalleryView() {
  const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!file) {
      setError('Please select a selfie first!');
      return;
    }

    setLoading(true);
    setError('');
    setPhotos([]);

    // Call the Service
    const result = await searchPhotos(file);

    if (result.error) {
      setError(result.error);
    } else if (result.matches.length > 0) {
      setPhotos(result.matches);
    } else {
      setError('No matches found. Try a clearer photo.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 Event Gallery</h1>
      <p className="text-gray-500 mb-8">Upload a selfie to find your photos from the event.</p>

      <UploadWidget 
        onFileSelect={setFile} 
        onSearch={handleSearch} 
        loading={loading} 
        error={error} 
      />

      <PhotoGrid photos={photos} />
    </div>
  );
}