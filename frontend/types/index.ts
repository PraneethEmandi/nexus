export interface PhotoMatch {
  url: string;
  distance: number;
}

export interface SearchResponse {
  matches: PhotoMatch[];
  error?: string;
}

export interface GalleryState {
  photos: PhotoMatch[];
  loading: boolean;
  error: string;
}