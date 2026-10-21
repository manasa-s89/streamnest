import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Film,
  Tv,
  Bookmark,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Search,
} from 'lucide-react';
import { ContentItem, GenreFilter, LanguageFilter, WatchProgress, ViewingHistoryItem } from './types/streamnest.ts';
import { Customer, InAppNotification } from './types/user.ts';
import { MOCK_CONTENT } from './data/mockContent.ts';
import {
  INITIAL_CUSTOMER,
  INITIAL_WATCH_PROGRESS,
  INITIAL_WATCHLIST,
  INITIAL_HISTORY,
  INITIAL_NOTIFICATIONS,
} from './data/mockUser.ts';
import { crmTelemetry } from './services/crmTelemetry.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { GenreFilters } from './components/GenreFilters.tsx';
import { ContentCard } from './components/ContentCard.tsx';
import { ContinueWatchingSection } from './components/ContinueWatchingSection.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { PlayerModal } from './components/PlayerModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SubscriptionModal } from './components/SubscriptionModal.tsx';
import { ProfileDrawer } from './components/ProfileDrawer.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { CrmIntegrationDrawer } from './components/CrmIntegrationDrawer.tsx';
import { MyListView } from './components/MyListView.tsx';
import { PlansPage } from './components/PlansPage.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<'home' | 'movies' | 'series' | 'mylist' | 'plans'>('home');
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // User & Customer State
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('streamnest_customer_v1');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER;
    } catch {
      return INITIAL_CUSTOMER;
    }
  });

  // Watch Progress & Watchlist
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>(() => {
    try {
      const saved = localStorage.getItem('streamnest_progress_v1');
      return saved ? JSON.parse(saved) : INITIAL_WATCH_PROGRESS;
    } catch {
      return INITIAL_WATCH_PROGRESS;
    }
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('streamnest_watchlist_v1');
      return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
    } catch {
      return INITIAL_WATCHLIST;
    }
  });

  const [viewingHistory, setViewingHistory] = useState<ViewingHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('streamnest_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('streamnest_notifs_v1');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Modals & Drawers
  const [activeItemForDetail, setActiveItemForDetail] = useState<ContentItem | null>(null);
  const [activeItemForPlayer, setActiveItemForPlayer] = useState<{
    item: ContentItem;
    episodeId?: string;
    partyId?: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showCrmDrawer, setShowCrmDrawer] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    if (customer) {
      localStorage.setItem('streamnest_customer_v1', JSON.stringify(customer));
    }
  }, [customer]);

  useEffect(() => {
    localStorage.setItem('streamnest_progress_v1', JSON.stringify(watchProgress));
  }, [watchProgress]);

  useEffect(() => {
    localStorage.setItem('streamnest_watchlist_v1', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('streamnest_history_v1', JSON.stringify(viewingHistory));
  }, [viewingHistory]);

  useEffect(() => {
    localStorage.setItem('streamnest_notifs_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Check for Watch Party invite link in URL (?party=XYZ)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const party = params.get('party');
    if (party) {
      const item = MOCK_CONTENT.find(c => c.id === 'sn-mov-1') || MOCK_CONTENT[0];
      setActiveItemForPlayer({ item, partyId: party });
    }
  }, []);

  // Featured Marquee Item
  const featuredItem = useMemo(() => {
    return MOCK_CONTENT.find(c => c.id === 'sn-mov-1') || MOCK_CONTENT[0];
  }, []);

  // Filtered Content Engine
  const filteredContent = useMemo(() => {
    return MOCK_CONTENT.filter(item => {
      // Type Filter
      if (currentTab === 'movies' && item.type !== 'movie') return false;
      if (currentTab === 'series' && item.type !== 'series') return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Genre Filter
      if (selectedGenre !== 'All') {
        const matchesGenre =
          item.genre.includes(selectedGenre) ||
          (selectedGenre === 'Kids' && (item.isKids || item.genre.includes('Kids'))) ||
          (selectedGenre === 'Family' && (item.isFamily || item.genre.includes('Family'))) ||
          (selectedGenre === 'Animation' && (item.artStyle === 'animation' || item.genre.includes('Animation')));
        if (!matchesGenre) return false;
      }

      // Language Filter (Pan-India, Kannada, Hindi, Telugu, Malayalam, Tamil)
      if (selectedLanguage === 'Pan-India' && !item.isPanIndia) {
        return false;
      }
      if (
        selectedLanguage !== 'All' &&
        selectedLanguage !== 'Pan-India' &&
        item.language !== selectedLanguage &&
        !item.availableAudios?.some(a => a.toLowerCase().includes(selectedLanguage.toLowerCase()))
      ) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCast = item.cast.some(actor => actor.toLowerCase().includes(q));
        const matchesDirector = item.director.toLowerCase().includes(q);
        const matchesGenre = item.genre.some(g => g.toLowerCase().includes(q));
        return matchesTitle || matchesCast || matchesDirector || matchesGenre;
      }

      return true;
    });
  }, [currentTab, selectedType, selectedGenre, selectedLanguage, searchQuery]);

  // Curated Content Collections
  const trendingContent = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.isTrending);
  }, []);

  const panIndiaBlockbusters = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.isPanIndia);
  }, []);

  const kannadaCinema = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.language === 'Kannada');
  }, []);

  const kidsAnimatedContent = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.isKids || c.genre.includes('Kids') || c.genre.includes('Animation'));
  }, []);

  const familyFavorites = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.isFamily || c.genre.includes('Family'));
  }, []);

  const originalSeries = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.type === 'series');
  }, []);

  const newReleases = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.isNewRelease);
  }, []);

  const sciFiFantasy = useMemo(() => {
    return MOCK_CONTENT.filter(c => c.genre.includes('Sci-Fi') || c.genre.includes('Fantasy'));
  }, []);

  const watchlistItems = useMemo(() => {
    return MOCK_CONTENT.filter(c => watchlist.includes(c.id));
  }, [watchlist]);

  // Handlers
  const handleToggleWatchlist = (item: ContentItem) => {
    const isAdded = watchlist.includes(item.id);
    const updated = isAdded ? watchlist.filter(id => id !== item.id) : [...watchlist, item.id];
    setWatchlist(updated);

    if (customer) {
      crmTelemetry.recordEvent('watchlist_changed', customer.id, {
        customer_id: customer.id,
        content_id: item.id,
        title: item.title,
        action: isAdded ? 'removed' : 'added',
        watchlist_count: updated.length,
      });
    }
  };

  const handlePlayContent = (item: ContentItem, episodeId?: string) => {
    setActiveItemForDetail(null);
    setActiveItemForPlayer({ item, episodeId });
  };

  const handleStartWatchParty = (item: ContentItem) => {
    const newPartyId = `nest-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveItemForDetail(null);
    setActiveItemForPlayer({ item, partyId: newPartyId });
  };

  const handleUpdateWatchProgress = (
    contentId: string,
    seconds: number,
    totalSeconds: number,
    completed: boolean
  ) => {
    const pct = Math.min(100, Math.round((seconds / totalSeconds) * 100));

    setWatchProgress(prev => ({
      ...prev,
      [contentId]: {
        contentId,
        progressSeconds: seconds,
        totalSeconds,
        progressPercent: pct,
        lastWatchedAt: new Date().toISOString(),
        completed,
      },
    }));

    // Add or update viewing history record
    const targetItem = MOCK_CONTENT.find(c => c.id === contentId);
    if (targetItem) {
      setViewingHistory(prev => {
        const existingIdx = prev.findIndex(h => h.contentId === contentId);
        const record: ViewingHistoryItem = {
          id: existingIdx !== -1 ? prev[existingIdx].id : `hist-${Date.now()}`,
          contentId,
          title: targetItem.title,
          contentType: targetItem.type,
          watchedAt: new Date().toISOString(),
          durationMinutes: Math.round(seconds / 60),
          completed,
        };

        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = record;
          return updated;
        }
        return [record, ...prev];
      });
    }
  };

  const handleClearHistory = () => {
    setViewingHistory([]);
  };

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleSelectSubProfile = (profileId: string) => {
    if (customer) {
      setCustomer({ ...customer, activeProfileId: profileId });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-950">
      {/* Universal Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenProfile={() => setShowProfileDrawer(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenCrm={() => setShowCrmDrawer(true)}
        customer={customer}
      />

      {/* MAIN VIEW AREA */}
      <main className="flex-1">
        {/* TAB: PLANS VIEW */}
        {currentTab === 'plans' && (
          <PlansPage
            customer={customer}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* TAB: MY LIST & HISTORY VIEW */}
        {currentTab === 'mylist' && (
          <MyListView
            watchlistItems={watchlistItems}
            historyItems={viewingHistory}
            progressMap={watchProgress}
            watchlist={watchlist}
            onPlay={item => handlePlayContent(item)}
            onOpenDetails={item => setActiveItemForDetail(item)}
            onToggleWatchlist={handleToggleWatchlist}
            onClearHistory={handleClearHistory}
            allContent={MOCK_CONTENT}
          />
        )}

        {/* TAB: HOME, MOVIES & SERIES BROWSING */}
        {(currentTab === 'home' || currentTab === 'movies' || currentTab === 'series') && (
          <div>
            {/* Show Marquee Hero Banner on Home when no search active */}
            {currentTab === 'home' && !searchQuery.trim() && (
              <HeroBanner
                item={featuredItem}
                isInWatchlist={watchlist.includes(featuredItem.id)}
                onPlay={item => handlePlayContent(item)}
                onStartWatchParty={item => handleStartWatchParty(item)}
                onOpenDetails={item => setActiveItemForDetail(item)}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Content Explorer Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              {/* Category Page Title if on Movies or Series */}
              {currentTab !== 'home' && (
                <div className="border-b border-slate-200 pb-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentTab === 'movies' ? 'Blockbuster Movies' : 'Original TV Series'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Stream all titles in crystal 4K Ultra HD and immersive Dolby Atmos audio.
                  </p>
                </div>
              )}

              {/* Genre and Content Filter Controls */}
              <GenreFilters
                selectedGenre={selectedGenre}
                onSelectGenre={setSelectedGenre}
                selectedType={selectedType}
                onSelectType={setSelectedType}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
              />

              {/* Search Active Notification if searching */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>
                      Results for &quot;<strong className="text-slate-900">{searchQuery}</strong>&quot; ({filteredContent.length} found)
                    </span>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Continue Watching Carousel (Feature 5) - Shown on Home when not searching */}
              {currentTab === 'home' && !searchQuery.trim() && (
                <ContinueWatchingSection
                  items={MOCK_CONTENT}
                  progressMap={watchProgress}
                  watchlist={watchlist}
                  onPlay={(item, epId) => handlePlayContent(item, epId)}
                  onOpenDetails={item => setActiveItemForDetail(item)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}

              {/* Filtered Grid (When genre, language, or search is applied) */}
              {(selectedGenre !== 'All' || selectedType !== 'all' || selectedLanguage !== 'All' || searchQuery.trim()) ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {selectedLanguage !== 'All' ? `${selectedLanguage} Titles` : selectedGenre === 'All' ? 'Filtered Titles' : `${selectedGenre} Titles`}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      {filteredContent.length} titles
                    </span>
                  </div>
                  {filteredContent.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <Film className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
                      <h3 className="text-base font-bold text-slate-900 mb-1">No titles matched</h3>
                      <p className="text-xs text-slate-500">
                        Try selecting another genre or clearing your search keywords.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredContent.map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Curated Rails when no filter applied */
                <div className="space-y-12">
                  {/* Rail 1: Pan-India Multilingual Blockbusters */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          Pan-India
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Pan-India Mega Blockbusters
                        </h2>
                        <span className="hidden sm:inline-block text-xs text-amber-700 font-medium">
                          (ಕನ್ನಡ · हिंदी · తెలుగు · മലയാളം · தமிழ்)
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Multilingual 4K Atmos</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {panIndiaBlockbusters.slice(0, 5).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 2: Kannada Cinema Sensations */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          ಕನ್ನಡ
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Kannada & Karavali Cinema Legends
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Coastal Folklore & Empires</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {kannadaCinema.map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 3: Trending Now */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Trending on StreamNest
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Top Pick Blockbusters</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {trendingContent.slice(0, 5).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 4: KIDS ZONE & ANIMATED WONDERS */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          KIDS & FAMILY
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Kids Zone & Animated Adventures
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-emerald-800 font-medium">
                          Tenali Rama · Bal Hanuman · Chhota Bheem · Vrindavan
                        </span>
                        <button
                          onClick={() => setSelectedGenre('Kids')}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 cursor-pointer"
                        >
                          View All ({kidsAnimatedContent.length})
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {kidsAnimatedContent.slice(0, 10).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 5: FAMILY MOVIE NIGHT & HEARTFELT STORIES */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          ALL AGES
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Family Movie Night & Heartfelt Stories
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-amber-800 font-medium">
                          Gullak Days · Coorg Safari · Family Caravan · Treehouse
                        </span>
                        <button
                          onClick={() => setSelectedGenre('Family')}
                          className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-4 cursor-pointer"
                        >
                          View All ({familyFavorites.length})
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {familyFavorites.slice(0, 10).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 6: StreamNest Original Series */}
                  {currentTab !== 'movies' && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Tv className="w-5 h-5 text-emerald-600" />
                          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            Binge-Worthy Original Series
                          </h2>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">Multi-Season Stories</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {originalSeries.map(item => (
                          <ContentCard
                            key={item.id}
                            item={item}
                            isInWatchlist={watchlist.includes(item.id)}
                            watchProgress={watchProgress[item.id]}
                            onPlay={item => handlePlayContent(item)}
                            onOpenDetails={item => setActiveItemForDetail(item)}
                            onToggleWatchlist={handleToggleWatchlist}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Rail 7: Fresh New Releases */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          New Releases in 4K HDR
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Added This Month</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {newReleases.slice(0, 5).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Rail 8: Sci-Fi & High Fantasy Universes */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Sci-Fi & Cosmic Worlds
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Immersive Epics</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {sciFiFantasy.slice(0, 5).map(item => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          isInWatchlist={watchlist.includes(item.id)}
                          watchProgress={watchProgress[item.id]}
                          onPlay={item => handlePlayContent(item)}
                          onOpenDetails={item => setActiveItemForDetail(item)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Universal Quiet Footer */}
      <Footer
        onOpenCrm={() => setShowCrmDrawer(true)}
        onOpenPlans={() => setCurrentTab('plans')}
      />

      {/* MODAL 1: Detail Modal */}
      {activeItemForDetail && (
        <DetailModal
          item={activeItemForDetail}
          isInWatchlist={watchlist.includes(activeItemForDetail.id)}
          watchProgress={watchProgress[activeItemForDetail.id]}
          onClose={() => setActiveItemForDetail(null)}
          onPlay={(item, epId) => handlePlayContent(item, epId)}
          onStartWatchParty={item => handleStartWatchParty(item)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* MODAL 2: Simulated Player with Scrubbing, Episodes & Telemetry */}
      {activeItemForPlayer && (
        <PlayerModal
          item={activeItemForPlayer.item}
          initialEpisodeId={activeItemForPlayer.episodeId}
          initialPartyId={activeItemForPlayer.partyId}
          initialProgressSeconds={watchProgress[activeItemForPlayer.item.id]?.progressSeconds || 0}
          customerId={customer?.id || 'CUST-GUEST'}
          customer={customer}
          onClose={() => setActiveItemForPlayer(null)}
          onUpdateProgress={handleUpdateWatchProgress}
        />
      )}

      {/* MODAL 3: Customer Registration & Login */}
      {showAuthModal && (
        <AuthModal
          currentCustomer={customer}
          onClose={() => setShowAuthModal(false)}
          onLogin={c => {
            setCustomer(c);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* MODAL 4: Subscription Plans & Demo Checkout */}
      {showSubscriptionModal && customer && (
        <SubscriptionModal
          customer={customer}
          onClose={() => setShowSubscriptionModal(false)}
          onUpdateSubscription={updated => setCustomer(updated)}
        />
      )}

      {/* DRAWER 1: Profile & Connected Devices */}
      {showProfileDrawer && customer && (
        <ProfileDrawer
          customer={customer}
          onClose={() => setShowProfileDrawer(false)}
          onOpenSubscription={() => setShowSubscriptionModal(true)}
          onOpenCrmInspector={() => setShowCrmDrawer(true)}
          onLogout={() => {
            setCustomer(null);
            setShowProfileDrawer(false);
          }}
          onSelectSubProfile={handleSelectSubProfile}
          watchHistoryCount={viewingHistory.length}
        />
      )}

      {/* MODAL 5: In-App Notifications */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          onClearAll={handleClearAllNotifs}
        />
      )}

      {/* DRAWER 2: CRM & Antigravity Telemetry Bridge Inspector */}
      {showCrmDrawer && (
        <CrmIntegrationDrawer
          onClose={() => setShowCrmDrawer(false)}
          customerId={customer?.id || 'CUST-84920'}
        />
      )}
    </div>
  );
}
