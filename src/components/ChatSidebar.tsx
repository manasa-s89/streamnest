import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  Copy,
  Check,
  X,
  Radio,
  Crown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  simulatedMessageBus,
  BusMessage,
  BusParticipant,
} from '../services/simulatedMessageBus.ts';

export interface ChatSidebarProps {
  partyId: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  currentUserColor?: string;
  onClose: () => void;
  isPlaying?: boolean;
  currentTime?: number;
  contentTitle?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  partyId,
  currentUserId = 'CUST-84920',
  currentUserName = 'Manasa Sharma',
  currentUserAvatar,
  currentUserColor = '#EAB308',
  onClose,
  isPlaying,
  currentTime = 0,
}) => {
  const [messages, setMessages] = useState<BusMessage[]>([]);
  const [participants, setParticipants] = useState<BusParticipant[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showParticipantsList, setShowParticipantsList] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevPlayingRef = useRef<boolean | undefined>(isPlaying);
  const prevTimeRef = useRef<number>(currentTime);

  // Connect to Simulated Message Bus on mount or when partyId changes
  useEffect(() => {
    if (!partyId) return;

    const currentUser = {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
      color: currentUserColor,
    };

    const { initialMessages, initialParticipants } = simulatedMessageBus.connectParty(
      partyId,
      currentUser
    );

    setMessages(initialMessages);
    setParticipants(initialParticipants);

    // Subscribe to new real-time messages from participants
    const unsubMsg = simulatedMessageBus.subscribeMessages(partyId, newMsg => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Subscribe to participants changes
    const unsubPart = simulatedMessageBus.subscribeParticipants(partyId, updatedParts => {
      setParticipants(updatedParts);
    });

    // Subscribe to typing indicators
    const unsubTyping = simulatedMessageBus.subscribeTyping(partyId, name => {
      setTypingUser(name);
    });

    return () => {
      unsubMsg();
      unsubPart();
      unsubTyping();
      simulatedMessageBus.disconnectParty(partyId);
    };
  }, [partyId, currentUserId, currentUserName, currentUserAvatar, currentUserColor]);

  // Notify playback actions (pause / play / seek) to the message bus
  useEffect(() => {
    if (prevPlayingRef.current !== undefined && prevPlayingRef.current !== isPlaying) {
      if (isPlaying) {
        simulatedMessageBus.sendSystemBroadcast(
          partyId,
          `${currentUserName} resumed synchronized playback`
        );
      } else {
        simulatedMessageBus.sendSystemBroadcast(
          partyId,
          `${currentUserName} paused the video`
        );
      }
      prevPlayingRef.current = isPlaying;
    }
  }, [isPlaying, partyId, currentUserName]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    simulatedMessageBus.sendMessage(
      partyId,
      {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        color: currentUserColor,
      },
      inputText.trim()
    );

    setInputText('');
  };

  const handleSendReaction = (emoji: string) => {
    simulatedMessageBus.sendMessage(
      partyId,
      {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        color: currentUserColor,
      },
      emoji
    );
  };

  const handleCopyInvite = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?party=${partyId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const quickReactions = ['🔥', '🍿', '😮', '❤️', '👏', '😂'];

  return (
    <aside
      aria-label="Synchronized Watch Party Chat"
      className="w-80 sm:w-88 h-full bg-white/95 backdrop-blur-xl border-l border-slate-200 flex flex-col justify-between z-40 select-text transition-all duration-300 text-slate-900 shadow-xl"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Watch Party</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                LIVE BUS
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipantsList(!showParticipantsList)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                showParticipantsList
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="Toggle Participants"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{participants.length}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Chat Chimes' : 'Unmute Chat Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Close Chat Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room ID & 1-Click Copy Invite Button */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            <span className="font-mono text-slate-700 text-[11px] font-medium truncate">
              Room: {partyId}
            </span>
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer shrink-0"
            title="Copy shareable invite link"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Participants Dropdown */}
      {showParticipantsList && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 max-h-48 overflow-y-auto space-y-2 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block mb-1">
            Connected In This Party ({participants.length})
          </span>
          {participants.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0"
                  style={{ backgroundColor: p.color || '#FACC15' }}
                >
                  {p.name.charAt(0)}
                </div>
                <span className="text-slate-900 text-xs font-medium truncate max-w-[130px]">
                  {p.name} {p.id === currentUserId ? '(You)' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {p.isHost && (
                  <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-semibold">
                    <Crown className="w-2.5 h-2.5" />
                    <span>Host</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Synchronized Live Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
        {messages.map(msg => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center my-2 text-[10px] text-emerald-800 font-mono py-1 px-3 rounded-full bg-emerald-50 border border-emerald-200 max-w-fit mx-auto"
              >
                {msg.text}
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {!isMe && (
                <div className="flex items-center gap-1.5 mb-1 ml-1">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: msg.senderColor || '#059669' }}
                  >
                    {msg.senderName}
                  </span>
                </div>
              )}
              <div
                className={`px-3.5 py-2 rounded-2xl max-w-[85%] break-words leading-relaxed text-xs shadow-xs ${
                  isMe
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-medium rounded-br-none'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 font-mono px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-mono py-1 px-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Emoji Pills & Chat Input */}
      <div className="p-3 border-t border-slate-200 bg-white space-y-2">
        <div className="flex items-center justify-between px-1">
          {quickReactions.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendReaction(emoji)}
              className="p-1 text-base hover:scale-125 transition-transform cursor-pointer"
              title={`Send reaction: ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Message party (${participants.length} viewers)...`}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};

export default ChatSidebar;
