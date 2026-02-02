import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, AlertCircle, ScanFace, X } from "lucide-react";

interface CameraWidgetProps {
  onCapture: (file: File) => void;
  loading: boolean;
  error?: string;
}

export const CameraWidget = ({ onCapture, loading, error }: CameraWidgetProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [localError, setLocalError] = useState("");

  // Sync error from parent
  useEffect(() => {
    setLocalError(error || "");
  }, [error]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      setStream(mediaStream);
      setCameraOn(true);
      setLocalError("");
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setLocalError("Camera access denied. Please allow permissions.");
      setCameraOn(false);
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOn(false);
  };

  // Ensure video element gets stream when re-rendering
  useEffect(() => {
    if (cameraOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext("2d");
    if (context) {
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "snap.jpg", { type: "image/jpeg" });
          onCapture(file);
          // Optional: Stop camera after snap? 
          // stopCamera(); // Uncomment if you want to close camera after 1 shot
        }
      }, "image/jpeg");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      {/* Ambient Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${localError ? "from-red-500 to-orange-500 opacity-40" : ""}`}></div>
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl overflow-hidden">
        
        {/* State 1: Camera OFF */}
        {!cameraOn ? (
          <div className="flex flex-col items-center justify-center aspect-[4/3] bg-slate-950 rounded-lg border-2 border-dashed border-slate-800">
            {localError ? (
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-red-400 font-medium">{localError}</p>
                <button 
                  onClick={startCamera}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
                  <ScanFace className="w-10 h-10" />
                </div>
                <p className="text-slate-400">Ready to find your photos?</p>
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-5 h-5" /> Open Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          /* State 2: Camera ON */
          <>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] bg-black mb-6 shadow-inner ring-1 ring-white/10">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`} 
              />
              
              {/* Face Guide Overlay */}
              <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-colors duration-300
                ${localError ? "bg-red-500/10" : ""}`}>
                {/* The Oval */}
                <div className={`w-48 h-64 border-2 border-dashed rounded-[50%] transition-all duration-300
                  ${localError ? "border-red-500 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "border-white/40"}`}></div>
              </div>

              {/* Close Button */}
              <button 
                onClick={stopCamera}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Error Banner */}
              {localError && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 z-20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{localError}</span>
                </div>
              )}

              {/* Loading Scanner Line */}
              {loading && (
                 <div className="absolute inset-0 z-10 overflow-hidden">
                   <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-scan"></div>
                 </div>
              )}
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} width="640" height="480" className="hidden" />

            {/* Action Button */}
            <button
              onClick={handleCapture}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-slate-700 cursor-wait' 
                  : localError 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25'
                }`}
            >
              {loading ? (
                 <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...</>
              ) : localError ? (
                 <><RefreshCw className="w-5 h-5" /> Retry</>
              ) : (
                 <><Camera className="w-5 h-5" /> Snap Photo</>
              )}
            </button>
            
            <p className="text-center text-xs text-slate-500 mt-4 font-medium uppercase tracking-wider">
              {localError ? "Check lighting & try again" : "Position face in oval • Good lighting helps"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};