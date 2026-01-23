'use client'; // This is a Client Component

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!file) {
      setError('Please select a selfie first!');
      return;
    }

    setLoading(true);
    setError('');
    setPhotos([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        // Fix spaces in URLs for valid image sources
        const fixedUrls = data.matches.map((url: string) => 
          "http://127.0.0.1:8000" + url.replace(/ /g, "%20")
        );
        setPhotos(fixedUrls);
      } else {
        setError('No matches found. Try a clearer photo.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 Event Gallery</h1>
        <p className="text-gray-500 mb-8">Upload a selfie to find your photos from the event.</p>

        {/* Upload Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 mb-4 cursor-pointer"
          />
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Searching...' : 'Find My Photos'}
          </button>
          
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Results Grid */}
        {photos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-left">
              Found {photos.length} Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((src, idx) => (
                <div key={idx} className="relative aspect-[3/4] group overflow-hidden rounded-lg shadow-md">
                  {/* Next.js Image Component for Optimization */}
                  <Image
                    src={src}
                    alt={`Found photo ${idx}`}
                    fill
                    unoptimized={true}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Download Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={src} 
                      download 
                      target="_blank"
                      className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}