'use client';


import { useState } from 'react';
import { CameraWidget } from './CameraWidget';
import { PhotoGrid } from './PhotoGrid';
import { searchPhotos } from '@/services/galleryApi';

// Define the type for a match result
export default function GalleryView() {
  type PhotoMatch = {
    url: string;
    distance: number;
  };

  const [photos, setPhotos] = useState<PhotoMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // The CameraWidget now handles the logic of getting the file
  const handleCapture = async (capturedFile: File) => {
    setError(''); // Reset error at start
    setLoading(true);
    setPhotos([]);
    setFile(capturedFile);

    // Call the Service with the captured file
    const result = await searchPhotos(capturedFile);

    if (result.error) {
      setError(result.error);
    } else if (result.matches && result.matches.length > 0) {
      setPhotos(result.matches);
    } else {
      setError('No matches found. Try retaking the photo.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto text-center pb-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 Nexus Gallery</h1>
      <p className="text-gray-500 mb-8">
        Look into the camera to find your photos.
      </p>

      {/* Render Camera instead of Upload Input */}
      <CameraWidget 
        onCapture={handleCapture} 
        loading={loading} 
        error={error}
      />

      {/* Show error below camera only if not shown inside camera */}
      {error && <div className="block md:hidden"><p className="text-red-500 mt-4 font-medium">{error}</p></div>}

      <PhotoGrid photos={photos} />
    </div>
  );
}