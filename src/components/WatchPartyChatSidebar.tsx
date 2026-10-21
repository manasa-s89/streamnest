import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  Copy,
  Check,
  X,
  MessageSquare,
  Crown,
  Wifi,
  WifiOff,
} from 'lucide-react';

export interface WatchPartyMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface WatchPartyParticipant {
  id: string;
  name: string;
  color?: string;
  isHost?: boolean;
}

interface WatchPartyChatSidebarProps {
  partyId: string;
  currentUserId?: string;
  currentUserName?: string;
  messages: WatchPartyMessage[];
  participants: WatchPartyParticipant[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isConnected?: boolean;
}

export const WatchPartyChatSidebar: React.FC<WatchPartyChatSidebarProps> = ({
  partyId,
  currentUserId = 'CUST-84920',
  currentUserName = 'Manasa Sharma',
  messages,
  participants,
  onSendMessage,
  onClose,
  isConnected = true,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}?party=${partyId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const quickReactions = ['🍿', '🔥', '😱', '😂', '👏', '🚀'];

  return (
    <aside aria-label="Watch Party Chat" className="w-80 sm:w-88 h-full bg-[#050B08]/95 backdrop-blur-2xl border-l border-emerald-500/25 flex flex-col justify-between z-40 select-text">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 bg-[#0A1611]/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Watch Party</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                showParticipants ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold' : 'bg-white/10 text-slate-300 hover:text-white'
              }`}
              title="Toggle Participants"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{participants.length}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Hide Chat Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room ID & 1-Click Copy Invite */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/50 border border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            )}
            <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
              Room: {partyId}
            </span>
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1 text-[11px] text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied' : 'Invite'}</span>
          </button>
        </div>
      </div>

      {/* Participants Drawer (Collapsible) */}
      {showParticipants && (
        <div className="p-3 bg-emerald-950/40 border-b border-emerald-500/20 max-h-48 overflow-y-auto space-y-2 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
            Connected Members ({participants.length})
          </span>
          {participants.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0"
                  style={{ backgroundColor: p.color || '#FACC15' }}
                >
                  {p.name.charAt(0)}
                </div>
                <span className="text-white text-xs font-medium truncate max-w-[130px]">
                  {p.name} {p.id === currentUserId ? '(You)' : ''}
                </span>
              </div>
              {p.isHost && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-300 bg-yellow-950/60 border border-yellow-500/40 px-1.5 py-0.5 rounded">
                  <Crown className="w-3 h-3" />
                  <span>Host</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Synchronized Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">Party chat is ready</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Playback actions (play, pause, seek) and comments synchronize live for everyone in this room.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="text-center my-2 text-[10px] text-yellow-300/80 font-mono py-1 px-2.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 max-w-fit mx-auto"
                >
                  {msg.text}
                </div>
              );
            }

            const isMe = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span
                    className="text-[10px] font-semibold mb-0.5 ml-1"
                    style={{ color: msg.senderColor || '#34D399' }}
                  >
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] break-words leading-relaxed text-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-medium rounded-br-none shadow-md'
                      : 'bg-[#0A1611] text-slate-200 rounded-bl-none border border-emerald-500/20'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 font-mono px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Bar & Message Input Form */}
      <div className="p-3 border-t border-white/10 bg-[#0A1611]/90 space-y-2">
        {/* Quick Reaction Emoji Pills */}
        <div className="flex items-center justify-between px-1">
          {quickReactions.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSendMessage(emoji)}
              className="p-1 text-base hover:scale-125 transition-transform cursor-pointer"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Comment on scene..."
            className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
