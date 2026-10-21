import React from 'react';
import { Play, Info, Plus, Check, Star, Users } from 'lucide-react';
import { ContentItem } from '../types/streamnest.ts';
import { PosterArtwork } from './PosterArtwork.tsx';

interface HeroBannerProps {
  item: ContentItem;
  isInWatchlist: boolean;
  onPlay: (item: ContentItem) => void;
  onStartWatchParty?: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleWatchlist: (item: ContentItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  isInWatchlist,
  onPlay,
  onStartWatchParty,
  onOpenDetails,
  onToggleWatchlist,
}) => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
      {/* Framed Cinematic Showcase Card */}
      <div className="relative w-full min-h-[460px] sm:min-h-[540px] rounded-2xl overflow-hidden flex items-end shadow-xl border border-slate-200/80 bg-slate-900">
        {/* Background Cinematic Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <PosterArtwork item={item} variant="backdrop" showBadges={false} className="w-full h-full object-cover" />
          
          {/* Measured Cinematic Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 px-6 sm:px-10 pb-10 sm:pb-14 w-full">
          <div className="max-w-2xl space-y-3.5">
            {/* Metadata (zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="font-mono text-amber-400 font-bold tracking-wider uppercase">
                {item.type === 'series' ? 'StreamNest Original Series' : 'StreamNest Exclusive Premiere'}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {item.imdbScore}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>{item.year}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-emerald-400 font-mono">{item.videoQuality}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>{item.audioQuality}</span>
            </div>

            {/* Marquee Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
              {item.title}
            </h1>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed line-clamp-3 max-w-xl font-normal drop-shadow">
              {item.synopsis}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onPlay(item)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Watch Now</span>
              </button>

              <button
                onClick={() => onOpenDetails(item)}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm flex items-center gap-2 backdrop-blur-md border border-white/25 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Details & Cast</span>
              </button>

              {onStartWatchParty && (
                <button
                  onClick={() => onStartWatchParty(item)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Watch Party</span>
                </button>
              )}

              <button
                onClick={() => onToggleWatchlist(item)}
                className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                  isInWatchlist
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/20 border-white/25 text-white hover:bg-white/30'
                }`}
                title={isInWatchlist ? 'In My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
