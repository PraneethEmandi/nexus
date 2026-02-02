import React from "react";
import Image from "next/image";
import { Download, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface PhotoMatch {
  url: string;
  distance: number;
}

interface PhotoGridProps {
  photos: PhotoMatch[];
}

export const PhotoGrid = ({ photos }: PhotoGridProps) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-5xl mx-auto px-4 pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          Gallery 
          <span className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full font-medium border border-slate-700">
            {photos.length} Found
          </span>
        </h2>
        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold hidden sm:block">
          Personalized Results
        </span>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((photo, idx) => (
          <div 
            key={idx} 
            className="relative aspect-[3/4] group rounded-xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            {/* Image */}
            <Image
              src={photo.url}
              alt={`Match ${idx}`}
              fill
              unoptimized={true}
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            
            {/* Gradient Overlay (Always visible at bottom for text readability, strengthens on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              
              {/* Match Score Badge */}
              <div className="mb-3 flex items-center gap-2">
                 <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                   <CheckCircle2 className="w-3 h-3" />
                   {(100 - (photo.distance * 100)).toFixed(0)}% Match
                 </span>
              </div>

              {/* Download Button */}
              <a 
                href={photo.url} 
                download 
                target="_blank"
                className="w-full bg-white text-slate-950 hover:bg-indigo-50 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" /> Save Photo
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};