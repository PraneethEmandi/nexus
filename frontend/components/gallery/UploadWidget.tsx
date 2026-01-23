import React from "react";

interface UploadWidgetProps {
  onFileSelect: (file: File) => void;
  onSearch: () => void;
  loading: boolean;
  error: string;
}

export const UploadWidget = ({ onFileSelect, onSearch, loading, error }: UploadWidgetProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="block w-full text-sm text-gray-500 mb-4 cursor-pointer
          file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
          file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      <button
        onClick={onSearch}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Searching...' : 'Find My Photos'}
      </button>
      
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
};