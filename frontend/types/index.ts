export interface SearchResponse {
  matches: string[];
  error?: string;
}

export interface GalleryState {
  photos: string[];
  loading: boolean;
  error: string;
}