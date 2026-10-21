import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  CheckCircle2,
  ListVideo,
  Settings,
  Subtitles,
  Sparkles,
  Users,
  MessageSquare,
  Share2,
  Radio,
} from 'lucide-react';
import { ContentItem, Episode } from '../types/streamnest.ts';
import { Customer } from '../types/user.ts';
import { crmTelemetry } from '../services/crmTelemetry.ts';
import {
  watchPartyService,
  WatchPartyParticipant,
  WatchPartyMessage,
} from '../services/watchPartyService.ts';
import { ChatSidebar } from './ChatSidebar.tsx';

interface PlayerModalProps {
  item: ContentItem;
  initialProgressSeconds?: number;
  initialEpisodeId?: string;
  customerId: string;
  customer?: Customer | null;
  initialPartyId?: string;
  onClose: () => void;
  onUpdateProgress: (contentId: string, seconds: number, totalSeconds: number, completed: boolean) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  item,
  initialProgressSeconds = 0,
  initialEpisodeId,
  customerId,
  customer,
  initialPartyId,
  onClose,
  onUpdateProgress,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | undefined>(() => {
    if (item.episodes && item.episodes.length > 0) {
      if (initialEpisodeId) {
        return item.episodes.find(e => e.id === initialEpisodeId) || item.episodes[0];
      }
      return item.episodes[0];
    }
    return undefined;
  });

  const totalDurationSeconds = selectedEpisode
    ? selectedEpisode.durationMinutes * 60
    : item.durationMinutes * 60;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(() =>
    Math.min(initialProgressSeconds, totalDurationSeconds - 5)
  );
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quality, setQuality] = useState<string>(item.videoQuality);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showEpisodes, setShowEpisodes] = useState<boolean>(false);
  const [selectedAudio, setSelectedAudio] = useState<string>('English [Original] (Dolby Atmos)');
  const [subtitlesOn, setSubtitlesOn] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [userOverlayVisible, setUserOverlayVisible] = useState<boolean>(true);

  // Watch Party States
  const [partyId, setPartyId] = useState<string | null>(initialPartyId || null);
  const [isPartyActive, setIsPartyActive] = useState<boolean>(Boolean(initialPartyId));
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState<boolean>(Boolean(initialPartyId));
  const [partyParticipants, setPartyParticipants] = useState<WatchPartyParticipant[]>([]);
  const [partyMessages, setPartyMessages] = useState<WatchPartyMessage[]>([]);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [showPartyStartModal, setShowPartyStartModal] = useState<boolean>(false);
  const [partyCodeInput, setPartyCodeInput] = useState<string>('');

  const isRemoteUpdateRef = useRef<boolean>(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const overlayTimeoutRef = useRef<any>(null);
  const sessionIdRef = useRef<string>(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Record content_view_started on mount
  useEffect(() => {
    crmTelemetry.recordEvent('content_view_started', customerId, {
      content_id: item.id,
      title: item.title,
      type: item.type,
      genres: item.genre,
      duration_minutes: item.durationMinutes,
      session_id: sessionIdRef.current,
      episode_id: selectedEpisode?.id,
      episode_title: selectedEpisode?.title,
      resumed_from_seconds: initialProgressSeconds,
    });
  }, [item.id, selectedEpisode?.id]);

  // Connect to Watch Party if active
  useEffect(() => {
    if (!partyId || !isPartyActive) return;

    const userPayload = {
      id: customer?.id || customerId,
      name: customer?.name || 'Guest Streamer',
      avatar: customer?.avatar || '',
      color: '#8B5CF6',
    };

    watchPartyService.join(
      partyId,
      userPayload,
      { id: item.id, title: item.title },
      selectedEpisode?.id,
      currentTime
    );

    const unsubState = watchPartyService.on('party_state', room => {
      setPartyParticipants(room.participants);
      setPartyMessages(room.messages);
      // Synchronize initial state
      if (typeof room.currentTime === 'number') {
        isRemoteUpdateRef.current = true;
        setCurrentTime(room.currentTime);
        setIsPlaying(room.isPlaying);
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 150);
      }
    });

    const unsubSync = watchPartyService.on('sync_playback', data => {
      isRemoteUpdateRef.current = true;
      setIsPlaying(data.isPlaying);
      setCurrentTime(data.currentTime);
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 150);
    });

    const unsubChat = watchPartyService.on('chat_message', (msg: WatchPartyMessage) => {
      setPartyMessages(prev => [...prev, msg]);
    });

    const unsubJoin = watchPartyService.on('participant_joined', data => {
      setPartyParticipants(prev => {
        if (prev.some(p => p.id === data.participant.id)) return prev;
        return [...prev, data.participant];
      });
    });

    const unsubLeave = watchPartyService.on('participant_left', data => {
      setPartyParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });

    const unsubConn = watchPartyService.on('connection_change', (conn: boolean) => {
      setIsWsConnected(conn);
    });

    return () => {
      unsubState();
      unsubSync();
      unsubChat();
      unsubJoin();
      unsubLeave();
      unsubConn();
      watchPartyService.leave();
    };
  }, [partyId, isPartyActive]);

  // Telemetry tick every 5 simulated seconds while playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          const completedNow = next >= totalDurationSeconds;

          // Emit watch progress tick every 5 seconds
          if (next % 5 === 0 || completedNow) {
            const pct = Math.min(100, Math.round((next / totalDurationSeconds) * 100));
            crmTelemetry.recordEvent('watch_progress_tick', customerId, {
              content_id: item.id,
              watch_seconds: next,
              total_seconds: totalDurationSeconds,
              progress_percent: pct,
              session_id: sessionIdRef.current,
              episode_id: selectedEpisode?.id,
              watch_party_id: isPartyActive ? partyId : undefined,
            });

            onUpdateProgress(item.id, next, totalDurationSeconds, completedNow);
          }

          if (completedNow) {
            setIsPlaying(false);
            setIsCompleted(true);
            crmTelemetry.recordEvent('watch_completed', customerId, {
              content_id: item.id,
              title: item.title,
              session_id: sessionIdRef.current,
              duration_watched_seconds: totalDurationSeconds,
              episode_id: selectedEpisode?.id,
            });
            return totalDurationSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDurationSeconds, item.id, customerId, selectedEpisode?.id, isPartyActive, partyId]);

  // Hide overlay on inactivity (unless settings/chat is open)
  const handleMouseMove = () => {
    setUserOverlayVisible(true);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    overlayTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings && !showEpisodes && !showPartyStartModal) {
        setUserOverlayVisible(false);
      }
    }, 4000);
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Playback control triggers with real-time sync broadcast
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (isPartyActive && !isRemoteUpdateRef.current) {
      watchPartyService.syncPlayback(nextState, currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newSeconds = Math.floor(pct * totalDurationSeconds);
    setCurrentTime(newSeconds);
    onUpdateProgress(item.id, newSeconds, totalDurationSeconds, newSeconds >= totalDurationSeconds);

    if (isPartyActive && !isRemoteUpdateRef.current) {
      watchPartyService.syncPlayback(isPlaying, newSeconds);
    }
  };

  const handleJumpSeconds = (delta: number) => {
    const newTime = Math.max(0, Math.min(totalDurationSeconds, currentTime + delta));
    setCurrentTime(newTime);
    if (isPartyActive && !isRemoteUpdateRef.current) {
      watchPartyService.syncPlayback(isPlaying, newTime);
    }
  };

  const handleMarkAsComplete = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    setCurrentTime(totalDurationSeconds);
    onUpdateProgress(item.id, totalDurationSeconds, totalDurationSeconds, true);
    if (isPartyActive && !isRemoteUpdateRef.current) {
      watchPartyService.syncPlayback(false, totalDurationSeconds);
    }
    crmTelemetry.recordEvent('watch_completed', customerId, {
      content_id: item.id,
      title: item.title,
      session_id: sessionIdRef.current,
      duration_watched_seconds: totalDurationSeconds,
      manual_override: true,
      episode_id: selectedEpisode?.id,
    });
  };

  const handleSwitchEpisode = (ep: Episode) => {
    setSelectedEpisode(ep);
    setCurrentTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setShowEpisodes(false);
    if (isPartyActive) {
      watchPartyService.syncPlayback(true, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Watch Party Actions
  const handleStartWatchParty = () => {
    const newPartyId = `nest-${Math.floor(1000 + Math.random() * 9000)}`;
    setPartyId(newPartyId);
    setIsPartyActive(true);
    setIsChatSidebarOpen(true);
    setShowPartyStartModal(false);
  };

  const handleJoinExistingParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyCodeInput.trim()) return;
    setPartyId(partyCodeInput.trim());
    setIsPartyActive(true);
    setIsChatSidebarOpen(true);
    setShowPartyStartModal(false);
  };

  const handleLeaveWatchParty = () => {
    watchPartyService.leave();
    setPartyId(null);
    setIsPartyActive(false);
    setIsChatSidebarOpen(false);
  };

  const progressPercent = Math.min(100, (currentTime / totalDurationSeconds) * 100);

  return (
    <div
      ref={playerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-stretch justify-center select-none overflow-hidden"
    >
      {/* Main Video Stage Area */}
      <div className="relative flex-1 h-full flex items-center justify-center overflow-hidden">
        {/* Animated ambient cosmic / neon canvas */}
        <div
          className={`w-full h-full transition-transform duration-1000 ${
            isPlaying ? 'scale-105' : 'scale-100'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 40%, ${item.themeColor}33 0%, #080C16 75%, #020408 100%)`,
          }}
        >
          {/* Animated SVG Graphic Scene */}
          <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#060913" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="960" cy="540" r="420" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="8 12" opacity="0.3" />
            <circle cx="960" cy="540" r="280" fill="none" stroke="#C084FC" strokeWidth="1.5" opacity="0.4" />
            <circle cx="960" cy="540" r="140" fill="none" stroke="#E9D5FF" strokeWidth="2" opacity="0.6" />
            <line x1="0" y1="540" x2="1920" y2="540" stroke="#7C3AED" strokeWidth="0.5" opacity="0.25" />
            <line x1="960" y1="0" x2="960" y2="1080" stroke="#7C3AED" strokeWidth="0.5" opacity="0.25" />
            <ellipse cx="960" cy="540" rx="700" ry="12" fill="url(#laserBeam)" />
          </svg>
        </div>

        {/* Center Live Simulation Status Indicator */}
        <div className="absolute text-center pointer-events-none px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
            {isPartyActive ? (
              <>
                <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span className="text-white font-semibold">Watch Party ({partyId})</span>
                <span className="text-slate-400">· {partyParticipants.length} synchronized</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Simulated StreamNest Stream ({quality})</span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            {item.title}
          </h2>
          {selectedEpisode && (
            <p className="text-sm sm:text-base text-yellow-300 font-medium mt-1">
              Season {selectedEpisode.season} · Episode {selectedEpisode.episodeNumber}: {selectedEpisode.title}
            </p>
          )}

          {/* Subtitles Simulation */}
          {subtitlesOn && isPlaying && (
            <div className="mt-28 px-4 py-1.5 bg-black/80 rounded border border-white/10 text-white text-sm sm:text-base font-medium max-w-xl mx-auto shadow-2xl">
              [Subtitles · English] &quot;The boundary between coordinates is collapsing...&quot;
            </div>
          )}
        </div>

        {/* Top Header Bar */}
        <div
          className={`absolute top-0 inset-x-0 p-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            userOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Player"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>{item.rating}</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">{item.videoQuality}</span>
                <span>·</span>
                <span>{item.audioQuality}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Watch Party Button */}
            {isPartyActive ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 p-1 rounded-xl">
                <button
                  onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                  title="Toggle Watch Party Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                  <span>Party Chat ({partyMessages.length})</span>
                </button>
                <button
                  onClick={handleLeaveWatchParty}
                  className="px-2 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-medium cursor-pointer"
                  title="Leave Watch Party"
                >
                  Leave
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPartyStartModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                title="Start a synchronized Watch Party with friends"
              >
                <Users className="w-4 h-4 text-slate-950" />
                <span>Watch Party</span>
              </button>
            )}

            {item.episodes && item.episodes.length > 0 && (
              <button
                onClick={() => {
                  setShowEpisodes(!showEpisodes);
                  setShowSettings(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showEpisodes
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <ListVideo className="w-4 h-4" />
                <span>Episodes</span>
              </button>
            )}

            <button
              onClick={handleMarkAsComplete}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Mark as finished"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Watched</span>
            </button>

            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowEpisodes(false);
              }}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                showSettings ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Audio & Quality Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Start / Join Watch Party Modal Dialog */}
        {showPartyStartModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Start a StreamNest Watch Party</span>
                </div>
                <button
                  onClick={() => setShowPartyStartModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Watch <strong className="text-slate-900">{item.title}</strong> together in perfect real-time sync with friends. Playback events (play, pause, scrub) and messages synchronize instantly.
              </p>

              {/* Start new */}
              <button
                onClick={handleStartWatchParty}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer mb-5"
              >
                <Radio className="w-4 h-4 text-slate-950" />
                <span>Host New Watch Party</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-mono">
                  Or Join Existing Party
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleJoinExistingParty} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Party Code (e.g. nest-8491)"
                  value={partyCodeInput}
                  onChange={e => setPartyCodeInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!partyCodeInput.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Episode Selection Sidebar */}
        {showEpisodes && item.episodes && (
          <div className="absolute right-6 top-24 w-80 max-h-[70vh] overflow-y-auto glass-dropdown rounded-xl p-4 z-50 shadow-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Season 1 Episodes</h4>
              <span className="text-xs text-slate-400 font-mono">{item.episodes.length} Episodes</span>
            </div>
            <div className="space-y-2">
              {item.episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => handleSwitchEpisode(ep)}
                  className={`p-2.5 rounded-lg text-left cursor-pointer transition-all ${
                    selectedEpisode?.id === ep.id
                      ? 'bg-emerald-600/40 border border-yellow-400 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>EP {ep.episodeNumber}: {ep.title}</span>
                    <span className="font-mono text-emerald-300">{ep.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ep.synopsis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio / Subtitle / Quality Settings Popover */}
        {showSettings && (
          <div className="absolute right-6 top-24 w-72 glass-dropdown rounded-xl p-4 z-50 shadow-2xl border border-emerald-500/30 text-xs">
            <div className="border-b border-white/10 pb-2 mb-3">
              <h4 className="font-bold text-white tracking-wide uppercase">Streaming Settings</h4>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['4K UHD', '1080p FHD', '720p HD'].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-1.5 px-2 rounded font-mono text-center transition-colors cursor-pointer ${
                      quality === q
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {q.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio */}
            <div className="mb-4">
              <label className="text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                Audio Track ({item.availableAudios?.length || 3} Languages)
              </label>
              {(item.availableAudios || [
                'Kannada (Original)',
                'Hindi (Dolby 5.1)',
                'Telugu (Dolby 5.1)',
                'Malayalam (Dolby 5.1)',
                'Tamil (Dolby 5.1)',
                'English [Original] (Dolby Atmos)',
              ]).map(a => (
                <button
                  key={a}
                  onClick={() => setSelectedAudio(a)}
                  className={`w-full py-1.5 px-2 text-left rounded mb-1 transition-colors cursor-pointer text-xs ${
                    selectedAudio === a
                      ? 'bg-emerald-600/30 text-yellow-300 border border-emerald-500/50 font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Subtitles */}
            <div>
              <label className="text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                Subtitles
              </label>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-slate-200">English (Closed Captions)</span>
                <button
                  onClick={() => setSubtitlesOn(!subtitlesOn)}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                    subtitlesOn ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {subtitlesOn ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-6 z-40 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
            userOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Scrub Progress Bar */}
          <div className="mb-4">
            <div
              onClick={handleSeek}
              className="w-full h-2 hover:h-3.5 bg-slate-800/80 rounded-full cursor-pointer relative group transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-400 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Action Controls & Timers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Play/Pause */}
              <button
                onClick={handleTogglePlay}
                className="p-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* Skip -10s */}
              <button
                onClick={() => handleJumpSeconds(-10)}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => handleJumpSeconds(10)}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Fast Forward 10s"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-16 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
              </div>

              {/* Timestamp */}
              <div className="text-xs font-mono text-slate-300">
                <span className="font-semibold text-white">{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(totalDurationSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSubtitlesOn(!subtitlesOn)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  subtitlesOn ? 'text-yellow-400 bg-emerald-950/60' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle Subtitles"
              >
                <Subtitles className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Watch Party Chat Sidebar via Simulated Message Bus */}
      {isPartyActive && isChatSidebarOpen && partyId && (
        <ChatSidebar
          partyId={partyId}
          currentUserId={customer?.id || customerId}
          currentUserName={customer?.name || 'Guest Streamer'}
          currentUserAvatar={customer?.avatar}
          currentUserColor="#7C3AED"
          isPlaying={isPlaying}
          currentTime={currentTime}
          contentTitle={item.title}
          onClose={() => setIsChatSidebarOpen(false)}
        />
      )}
    </div>
  );
};
