import { SearchResponse } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

// CHANGED: Input is now File[]
export const searchPhotos = async (files: File[]): Promise<SearchResponse> => {
  if (!files || files.length === 0) {
    console.error("No files selected for upload.");
    return { matches: [], error: "No files selected for upload." };
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

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
      console.error("Backend error response:", data);
      throw new Error((data && data.detail) || "Failed to fetch photos");
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
    return { matches: [], error: error.message || "Failed to connect to server." };
  }
};