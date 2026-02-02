import React, { useRef, useState, useEffect } from "react";


interface CameraWidgetProps {
  onCapture: (file: File) => void;
  loading: boolean;
  error?: string;
}


export const CameraWidget = ({ onCapture, loading, error }: CameraWidgetProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [localError, setLocalError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [count, setCount] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);

    // Ensure video element always gets the stream when camera is on
  useEffect(() => {
    if (cameraOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);

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


  // Single Capture Logic
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    setCount(1);
    const context = canvasRef.current.getContext("2d");
    let capturedFile: File | null = null;
    if (context) {
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const blob = await new Promise<Blob | null>(resolve =>
        canvasRef.current?.toBlob(resolve, "image/jpeg")
      );
      if (blob) {
        capturedFile = new File([blob], `photo.jpg`, { type: "image/jpeg" });
      }
    }
    setCapturing(false);
    setCount(0);
    stopCamera();
    if (capturedFile) {
      console.log("Captured file:", capturedFile);
      onCapture(capturedFile);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg max-w-md mx-auto border border-gray-200">
      {localError && !cameraOn && (
        <div className="text-red-500 py-8">{localError} <br/> <button onClick={startCamera} className="text-blue-500 underline mt-2">Try Again</button></div>
      )}
      {!cameraOn && !localError && (
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
      {cameraOn && (
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
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-48 h-64 border-2 border-dashed rounded-full opacity-70 ${localError ? 'border-red-500' : 'border-white/50'}`}
              ></div>
            </div>
            {/* Countdown Overlay */}
            {capturing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="text-white text-6xl font-bold">{count}/1</span>
              </div>
            )}
            {/* Error Banner (bottom of video area) */}
            {localError && (
              <div className="absolute bottom-0 left-0 w-full py-2 px-4 bg-red-600/80 text-white text-center text-sm font-semibold z-20 rounded-b-lg">
                {localError}
              </div>
            )}
          </div>
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} width="640" height="480" className="hidden" />
          {/* Controls */}
          <button
            onClick={handleCapture}
            disabled={capturing || loading}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95
              ${capturing 
                ? 'bg-yellow-500' 
                : loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg'
              }`}
          >
            {capturing ? "Taking Photo..." : loading ? "Analyzing..." : "📸 Take Photo"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            Position your face in the oval and click Take Photo.
          </p>
        </>
      )}
    </div>
  );
};






