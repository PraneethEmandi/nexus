import React from "react";
import Image from "next/image";

interface PhotoGridProps {
  photos: string[];
}

export const PhotoGrid = ({ photos }: PhotoGridProps) => {
  if (photos.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-left">
        Found {photos.length} Photos
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((src, idx) => (
          <div key={idx} className="relative aspect-[3/4] group overflow-hidden rounded-lg shadow-md">
            <Image
              src={src}
              alt={`Found photo ${idx}`}
              fill
              unoptimized={true}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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
  );
};