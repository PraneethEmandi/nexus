
import { SearchResponse } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

// Input is now a single File
export const searchPhotos = async (file: File): Promise<SearchResponse> => {
  if (!file) {
    console.error("No file selected for upload.");
    return { matches: [], error: "No file selected for upload." };
  }

  const formData = new FormData();
  formData.append("file", file);

  // Debug: Log FormData keys and values
  for (const pair of formData.entries()) {
    console.log(`FormData: ${pair[0]} =`, pair[1]);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      body: formData,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON response:", jsonErr);
      data = null;
    }

    if (!response.ok) {
      // Extract error message from backend (FastAPI sends {detail: ...})
      const errorMessage = (data && data.detail) ? data.detail : "Failed to fetch photos";
      return { matches: [], error: errorMessage };
    }

    const matches = (data && data.matches ? data.matches : []).map((match: any) => {
      const url = match.url || match;
      const fullUrl = typeof url === 'string' ? (url.startsWith("http") ? url : `${API_BASE_URL}${url.replace(/ /g, "%20")}`) : '';
      return {
        url: fullUrl,
        distance: match.distance || 0
      };
    });

    return { matches };
  } catch (error: any) {
    console.error("API Error:", error);
    return { matches: [], error: "Failed to connect to server." };
  }
};