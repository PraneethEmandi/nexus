import { SearchResponse, PhotoMatch } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

export const searchPhotos = async (file: File): Promise<SearchResponse> => {
  if (!file) {
    console.error("No file selected for upload.");
    return { matches: [], error: "No file selected." };
  }

  const formData = new FormData();
  formData.append("file", file);

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
      return { matches: [], error: "Invalid server response." };
    }

    if (!response.ok) {
      // Extract specific error from backend (e.g., "Image too blurry")
      const errorMessage = data.detail || "Failed to fetch photos.";
      return { matches: [], error: errorMessage };
    }

    // ROBUST MAPPING: Handles both string[] and Object[] responses
    const matches: PhotoMatch[] = (data.matches || []).map((match: any) => {
      // 1. Normalize the URL path
      let rawPath = "";
      let distance = 0;

      if (typeof match === "string") {
        // Legacy support: ["/photos/a.jpg"]
        rawPath = match;
      } else {
        // New Object support: [{ url: "/photos/a.jpg", distance: 0.4 }]
        rawPath = match.url || "";
        distance = match.distance || 0;
      }

      // 2. Construct Full URL
      const fullUrl = rawPath.startsWith("http") 
        ? rawPath 
        : `${API_BASE_URL}${rawPath.replace(/ /g, "%20")}`;

      return {
        url: fullUrl,
        distance: distance,
      };
    });

    return { matches };
  } catch (error: any) {
    console.error("API Error:", error);
    return { matches: [], error: "Failed to connect to the server." };
  }
};