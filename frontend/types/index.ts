export interface MatchResult {
  url: string;
  distance: number;
}

export interface SearchResponse {
  matches: MatchResult[];
  error?: string;
}

export interface GalleryState {
  photos: MatchResult[];
  loading: boolean;
  error: string;
}