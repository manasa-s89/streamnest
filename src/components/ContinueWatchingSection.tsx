import React from 'react';
import { Clock } from 'lucide-react';
import { ContentItem, WatchProgress } from '../types/streamnest.ts';
import { ContentCard } from './ContentCard.tsx';

interface ContinueWatchingSectionProps {
  items: ContentItem[];
  progressMap: Record<string, WatchProgress>;
  watchlist: string[];
  onPlay: (item: ContentItem, episodeId?: string) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleWatchlist: (item: ContentItem) => void;
}

export const ContinueWatchingSection: React.FC<ContinueWatchingSectionProps> = ({
  items,
  progressMap,
  watchlist,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
}) => {
  // Filter items that have progress and are not marked 100% completed
  const inProgressItems = items.filter(item => {
    const p = progressMap[item.id];
    return p && p.progressSeconds > 10 && !p.completed;
  });

  if (inProgressItems.length === 0) {
    return null;
  }

  return (
    <section className="py-6 border-b border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Continue Watching for You
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {inProgressItems.length} in progress
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {inProgressItems.map(item => (
          <ContentCard
            key={item.id}
            item={item}
            isInWatchlist={watchlist.includes(item.id)}
            watchProgress={progressMap[item.id]}
            onPlay={onPlay}
            onOpenDetails={onOpenDetails}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </section>
  );
};
