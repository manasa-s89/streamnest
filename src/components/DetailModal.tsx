import React from 'react';
import {
  Play,
  Plus,
  Check,
  X,
  Star,
  Tv,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ContentItem } from '../types/streamnest.ts';
import { WatchProgress } from '../types/streamnest.ts';
import { PosterArtwork } from './PosterArtwork.tsx';

interface DetailModalProps {
  item: ContentItem;
  isInWatchlist: boolean;
  watchProgress?: WatchProgress;
  onClose: () => void;
  onPlay: (item: ContentItem, episodeId?: string) => void;
  onStartWatchParty?: (item: ContentItem) => void;
  onToggleWatchlist: (item: ContentItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  isInWatchlist,
  watchProgress,
  onClose,
  onPlay,
  onStartWatchParty,
  onToggleWatchlist,
}) => {
  const hasProgress = watchProgress && watchProgress.progressSeconds > 10 && !watchProgress.completed;

  const formatProgressTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Visual */}
        <div className="relative aspect-video max-h-[380px] w-full overflow-hidden bg-slate-950">
          <PosterArtwork item={item} variant="backdrop" showBadges={false} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Action Row on Backdrop */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 z-20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider bg-emerald-600 text-white shadow-xs uppercase">
                  {item.type}
                </span>
                <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {item.imdbScore} IMDb
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-300">{item.year}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-emerald-300 font-mono">{item.duration}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {item.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlay(item)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>{hasProgress ? 'Resume' : 'Play'}</span>
              </button>

              {onStartWatchParty && (
                <button
                  onClick={() => onStartWatchParty(item)}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  title="Watch together in synchronized party"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Watch Party</span>
                </button>
              )}

              <button
                onClick={() => onToggleWatchlist(item)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isInWatchlist
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                }`}
                title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Continue Watching Bar if in Progress */}
        {hasProgress && (
          <div className="bg-amber-50 border-y border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                You were at <strong className="text-slate-900">{formatProgressTime(watchProgress.progressSeconds)}</strong> ({watchProgress.progressPercent}% watched)
              </span>
            </div>
            <button
              onClick={() => onPlay(item)}
              className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer"
            >
              Jump in
            </button>
          </div>
        )}

        {/* Content Body Details */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {item.synopsis}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags.map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-slate-600">
              <div>
                <span className="text-slate-900 font-semibold block mb-0.5">Director</span>
                <span>{item.director}</span>
              </div>
              <div>
                <span className="text-slate-900 font-semibold block mb-0.5">Cast</span>
                <span className="text-slate-700">{item.cast.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-900 font-semibold block mb-0.5">Genres</span>
                <span className="text-emerald-700 font-medium">{item.genre.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-900 font-semibold block mb-0.5">Available Audio & Video</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-800">
                    {item.videoQuality}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-800">
                    {item.audioQuality}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-800">
                    {item.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TV Series Episodes List */}
          {item.episodes && item.episodes.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-600" />
                  <span>Season 1 Episodes ({item.episodes.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.episodes.map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => onPlay(item, ep.id)}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {ep.episodeNumber}. {ep.title}
                        </span>
                        <span className="font-mono text-emerald-700 font-semibold">{ep.duration}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ep.synopsis}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                      <Play className="w-3.5 h-3.5 fill-current mr-1 text-amber-500" />
                      <span>Play Episode</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
