'use client';

import { useState } from 'react';
import { CameraWidget } from './CameraWidget';
import { PhotoGrid } from './PhotoGrid';
import { searchPhotos } from '@/services/galleryApi';
import { Sparkles, Zap } from "lucide-react";

// Matches the type expected by PhotoGrid
type PhotoMatch = {
  url: string;
  distance: number;
};

export default function GalleryView() {
  const [photos, setPhotos] = useState<PhotoMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // We don't strictly need to store 'file' unless you plan to retry with it later
  // const [file, setFile] = useState<File | null>(null);

  const handleCapture = async (capturedFile: File) => {
    setLoading(true);
    setError(''); // Clear previous error state
    setPhotos([]);
    
    // Call the Service
    const result = await searchPhotos(capturedFile);

    if (result.error) {
      setError(result.error);
    } else if (result.matches && result.matches.length > 0) {
      // Cast the result to our type (Service should return objects now)
      setPhotos(result.matches as PhotoMatch[]);
    } else {
      setError('No matches found. Try better lighting or a different angle.');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen pt-12 pb-20 px-4 flex flex-col items-center w-full">
      
      {/* Hero Section */}
      <div className="text-center mb-10 max-w-2xl mx-auto space-y-4 animate-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3 h-3" /> AI Face Search
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
          SnapSort
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
          The fastest way to find your pictures. <br className="hidden sm:block"/>
          Just look into the camera.
        </p>
      </div>

      {/* Camera Component */}
      <div className="w-full max-w-md relative z-10">
        <CameraWidget 
          onCapture={handleCapture} 
          loading={loading} 
          error={error} 
        />
      </div>

      {/* Results Section */}
      <div className="w-full">
        <PhotoGrid photos={photos} />
      </div>
      
      {/* Footer */}
      <footer className="mt-auto pt-20 pb-8 text-slate-600 text-sm text-center flex flex-col items-center gap-2">
        <div className="w-8 h-[1px] bg-slate-800 mb-2"></div>
        <p className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <Zap className="w-3 h-3 text-indigo-500" /> 
          Powered by DeepFace & ArcFace
        </p>
        <p className="opacity-40">© 2026 SnapSort Event Gallery</p>
      </footer>
    </main>
  );
}