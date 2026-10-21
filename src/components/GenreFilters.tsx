import React from 'react';
import { GenreFilter, LanguageFilter } from '../types/streamnest.ts';
import { Film, Tv, Sparkles, Languages } from 'lucide-react';

interface GenreFiltersProps {
  selectedGenre: GenreFilter;
  onSelectGenre: (genre: GenreFilter) => void;
  selectedType: 'all' | 'movie' | 'series';
  onSelectType: (type: 'all' | 'movie' | 'series') => void;
  selectedLanguage: LanguageFilter;
  onSelectLanguage: (lang: LanguageFilter) => void;
}

const GENRES: GenreFilter[] = [
  'All',
  'Kids',
  'Family',
  'Animation',
  'Action',
  'Sci-Fi',
  'Drama',
  'Fantasy',
  'Thriller',
  'Crime',
  'Mystery',
  'Anime',
  'Romance',
];

const LANGUAGES: Array<{ key: LanguageFilter; label: string; native?: string }> = [
  { key: 'All', label: 'All Languages' },
  { key: 'Pan-India', label: 'Pan-India Hits' },
  { key: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { key: 'Hindi', label: 'Hindi', native: 'हिंदी' },
  { key: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { key: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { key: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
];

export const GenreFilters: React.FC<GenreFiltersProps> = ({
  selectedGenre,
  onSelectGenre,
  selectedType,
  onSelectType,
  selectedLanguage,
  onSelectLanguage,
}) => {
  return (
    <div className="space-y-3 py-4 border-b border-slate-200">
      {/* Top Filter Bar: Type + Language Segmented Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => onSelectType('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'all'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>All Content</span>
          </button>

          <button
            onClick={() => onSelectType('movie')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'movie'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-emerald-600" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => onSelectType('series')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'series'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-emerald-600" />
            <span>Series</span>
          </button>
        </div>

        {/* Pan-India Language Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mr-1 shrink-0">
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>Language:</span>
          </div>

          {LANGUAGES.map(lang => {
            const isActive = selectedLanguage === lang.key;
            return (
              <button
                key={lang.key}
                onClick={() => onSelectLanguage(lang.key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs font-semibold'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{lang.label}</span>
                {lang.native && (
                  <span className="text-[10px] text-slate-500 font-normal">({lang.native})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Horizontal Carousel / Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {GENRES.map(g => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => onSelectGenre(g)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
};
