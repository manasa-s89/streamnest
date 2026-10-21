import React from 'react';
import { Play, Plus, Check, Info } from 'lucide-react';
import { ContentItem, WatchProgress } from '../types/streamnest.ts';
import { PosterArtwork } from './PosterArtwork.tsx';

interface ContentCardProps {
  item: ContentItem;
  isInWatchlist: boolean;
  watchProgress?: WatchProgress;
  onPlay: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleWatchlist: (item: ContentItem) => void;
  variant?: 'poster' | 'backdrop';
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isInWatchlist,
  watchProgress,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  variant = 'poster',
}) => {
  return (
    <div
      onClick={() => onOpenDetails(item)}
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-white border border-slate-200 hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 shadow-sm"
    >
      {/* Poster Artwork Canvas */}
      <PosterArtwork
        item={item}
        variant={variant}
        showBadges={true}
        className="w-full transition-transform duration-500 group-hover:scale-105"
      />

      {/* Continue Watching Progress Overlay if present */}
      {watchProgress && watchProgress.progressPercent > 0 && !watchProgress.completed && (
        <div className="absolute bottom-0 inset-x-0 z-20">
          <div className="w-full bg-slate-900/80 h-1.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-r"
              style={{ width: `${watchProgress.progressPercent}%` }}
            />
          </div>
          <div className="px-3 py-1 bg-slate-900/90 flex items-center justify-between text-[10px] text-slate-200 font-mono">
            <span className="text-amber-300 font-semibold">{watchProgress.progressPercent}% watched</span>
            <span>
              {Math.max(1, Math.round((watchProgress.totalSeconds - watchProgress.progressSeconds) / 60))}m left
            </span>
          </div>
        </div>
      )}

      {/* Completed badge if finished */}
      {watchProgress?.completed && (
        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono shadow-sm">
          Watched
        </div>
      )}

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 z-30 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 backdrop-blur-[2px]">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 transition-transform hover:scale-110 shadow-lg shadow-amber-500/40 cursor-pointer"
            title="Play Now"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isInWatchlist
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
            }`}
            title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
          >
            {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="p-2.5 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-all cursor-pointer ml-auto"
            title="View Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
        <div className="flex items-center gap-2 text-[11px] text-slate-200 mt-0.5">
          <span className="text-amber-400 font-semibold">★ {item.imdbScore}</span>
          <span>·</span>
          <span>{item.genre[0]}</span>
          <span>·</span>
          <span>{item.duration}</span>
        </div>
      </div>
    </div>
  );
};
