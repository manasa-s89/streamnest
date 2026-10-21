export interface Episode {
  id: string;
  season: number;
  episodeNumber: number;
  title: string;
  duration: string;
  durationMinutes: number;
  synopsis: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  genre: string[];
  rating: string; // e.g. "U/A 16+", "U/A 13+", "A", "U"
  imdbScore: number;
  year: number;
  duration: string; // e.g. "2h 18m" or "3 Seasons"
  durationMinutes: number;
  synopsis: string;
  director: string;
  cast: string[];
  tags: string[];
  themeColor: string;
  accentGradient: string;
  artStyle: 'scifi' | 'cyberpunk' | 'fantasy' | 'heist' | 'ocean' | 'noir' | 'space' | 'anime' | 'drama' | 'crime' | 'romance' | 'kids' | 'family' | 'animation';
  backdropUrl?: string;
  posterUrl?: string;
  language?: ContentLanguage;
  availableAudios?: string[];
  isPanIndia?: boolean;
  isKids?: boolean;
  isFamily?: boolean;
  episodes?: Episode[];
  featured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  videoQuality: '4K UHD' | '1080p FHD' | 'HDR10+';
  audioQuality: 'Dolby Atmos' | 'Dolby 5.1' | 'Stereo';
}

export type ContentLanguage =
  | 'Kannada'
  | 'Hindi'
  | 'Telugu'
  | 'Malayalam'
  | 'Tamil'
  | 'English';

export type LanguageFilter =
  | 'All'
  | 'Pan-India'
  | 'Kannada'
  | 'Hindi'
  | 'Telugu'
  | 'Malayalam'
  | 'Tamil';

export type GenreFilter = 
  | 'All' 
  | 'Kids'
  | 'Family'
  | 'Animation'
  | 'Sci-Fi' 
  | 'Action' 
  | 'Thriller' 
  | 'Drama' 
  | 'Fantasy' 
  | 'Crime' 
  | 'Mystery' 
  | 'Anime' 
  | 'Romance';

export interface WatchProgress {
  contentId: string;
  progressSeconds: number;
  totalSeconds: number;
  progressPercent: number;
  lastWatchedAt: string;
  completed: boolean;
  episodeId?: string;
}

export interface ViewingHistoryItem {
  id: string;
  contentId: string;
  title: string;
  contentType: 'movie' | 'series';
  watchedAt: string;
  durationMinutes: number;
  completed: boolean;
  season?: number;
  episodeNumber?: number;
}
