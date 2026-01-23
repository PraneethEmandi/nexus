import { SearchResponse } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

export const searchPhotos = async (file: File): Promise<SearchResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch photos");
    }

    // Fix URL spaces here in the service layer
    const matches = (data.matches || []).map((url: string) =>
      url.startsWith("http") ? url : `${API_BASE_URL}${url.replace(/ /g, "%20")}`
    );

    return { matches };
  } catch (error) {
    console.error("API Error:", error);
    return { matches: [], error: "Failed to connect to server." };
  }
};