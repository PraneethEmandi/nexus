import React, { useRef, useState, useEffect } from "react";

interface CameraWidgetProps {
  onCapture: (files: File[]) => void;
  loading: boolean;
}


export const CameraWidget = ({ onCapture, loading }: CameraWidgetProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [count, setCount] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);

    // Ensure video element always gets the stream when camera is on
  useEffect(() => {
    if (cameraOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      setStream(mediaStream);
      setCameraOn(true);
      setError("");
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied. Please allow permissions.");
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

  // 2. The Burst Capture Logic
  const handleBurstCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);
    const capturedFiles: File[] = [];
    const TOTAL_FRAMES = 1;

    // We take 3 photos with a 200ms delay between them
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      setCount(i + 1); // Update UI counter
      // Draw video frame to canvas
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        // Convert canvas to Blob -> File
        const blob = await new Promise<Blob | null>(resolve => 
          canvasRef.current?.toBlob(resolve, "image/jpeg")
        );
        if (blob) {
          const file = new File([blob], `burst_frame_${i}.jpg`, { type: "image/jpeg" });
          capturedFiles.push(file);
        }
      }
      // Wait 200ms before next shot (Simulates movement capture)
      await new Promise(r => setTimeout(r, 200));
    }

    setCapturing(false);
    setCount(0);
    stopCamera(); // Stop camera after capture
    console.log("Captured files:", capturedFiles);
    // Send all 3 files to the parent
    onCapture(capturedFiles);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200">
      {error && (
        <div className="text-red-500 py-8">{error} <br/> <button onClick={startCamera} className="text-blue-500 underline mt-2">Try Again</button></div>
      )}
      {!cameraOn && !error && (
        <button
          onClick={startCamera}
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 mb-4
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg'
            }`}
        >
          {loading ? "Analyzing..." : "📷 Open Camera"}
        </button>
      )}
      {cameraOn && !error && (
        <>
          {/* Live Video Feed */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-4/3 mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
            {/* Overlay Grid for Alignment */}
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full opacity-70"></div>
            </div>
            {/* Countdown Overlay */}
            {capturing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="text-white text-6xl font-bold">{count}/1</span>
              </div>
            )}
          </div>
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} width="640" height="480" className="hidden" />
          {/* Controls */}
          <button
            onClick={handleBurstCapture}
            disabled={capturing || loading}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95
              ${capturing 
                ? 'bg-yellow-500' 
                : loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg'
              }`}
          >
            {capturing ? "Scanning Face..." : loading ? "Analyzing..." : "📸 Scan Face"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            Position your face in the oval and click Scan.
          </p>
        </>
      )}
    </div>
  );
};






