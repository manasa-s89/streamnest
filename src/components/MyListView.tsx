import React, { useState } from 'react';
import { Bookmark, Clock, Film, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { ContentItem, ViewingHistoryItem, WatchProgress } from '../types/streamnest.ts';
import { ContentCard } from './ContentCard.tsx';

interface MyListViewProps {
  watchlistItems: ContentItem[];
  historyItems: ViewingHistoryItem[];
  progressMap: Record<string, WatchProgress>;
  watchlist: string[];
  onPlay: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleWatchlist: (item: ContentItem) => void;
  onClearHistory: () => void;
  allContent: ContentItem[];
}

export const MyListView: React.FC<MyListViewProps> = ({
  watchlistItems,
  historyItems,
  progressMap,
  watchlist,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onClearHistory,
  allContent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'watchlist' | 'history'>('watchlist');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sub Tab Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('watchlist')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'watchlist'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Watchlist ({watchlistItems.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Viewing History ({historyItems.length})</span>
          </button>
        </div>

        {activeSubTab === 'history' && historyItems.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* WATCHLIST TAB */}
      {activeSubTab === 'watchlist' && (
        <div>
          {watchlistItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto p-8 shadow-sm">
              <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your Watchlist is empty</h3>
              <p className="text-xs text-slate-600 mb-5">
                Explore trending movies and series on StreamNest and click the &quot;+&quot; button to save them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistItems.map(item => (
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
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          {historyItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto p-8 shadow-sm">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No viewing history recorded yet</h3>
              <p className="text-xs text-slate-600">
                Titles you stream will be cataloged here and linked with your customer ID in the CRM.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {historyItems.map(hist => {
                const matchedContent = allContent.find(c => c.id === hist.contentId);
                return (
                  <div
                    key={hist.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{hist.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">
                            {new Date(hist.watchedAt).toLocaleDateString()} at{' '}
                            {new Date(hist.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>·</span>
                          <span className="text-amber-600 font-semibold">{hist.durationMinutes} min watched</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {hist.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finished</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          In Progress
                        </span>
                      )}

                      {matchedContent && (
                        <button
                          onClick={() => onPlay(matchedContent)}
                          className="p-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold transition-all cursor-pointer shadow-sm"
                          title="Play Again"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
