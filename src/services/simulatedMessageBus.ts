export interface BusMessage {
  id: string;
  partyId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  reactionEmoji?: string;
}

export interface BusParticipant {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'active' | 'idle';
  isHost?: boolean;
}

type MessageListener = (message: BusMessage) => void;
type ParticipantsListener = (participants: BusParticipant[]) => void;
type TypingListener = (name: string | null) => void;

class SimulatedMessageBus {
  private messagesByParty: Map<string, BusMessage[]> = new Map();
  private participantsByParty: Map<string, BusParticipant[]> = new Map();
  private messageListeners: Map<string, Set<MessageListener>> = new Map();
  private participantListeners: Map<string, Set<ParticipantsListener>> = new Map();
  private typingListeners: Map<string, Set<TypingListener>> = new Map();
  private simulationIntervals: Map<string, any> = new Map();

  // Simulated co-viewers pool
  private defaultParticipants: BusParticipant[] = [
    {
      id: 'part-vikram',
      name: 'Vikram Malhotra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      color: '#F59E0B',
      status: 'active',
    },
    {
      id: 'part-ananya',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      color: '#10B981',
      status: 'active',
    },
    {
      id: 'part-rohan',
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      color: '#3B82F6',
      status: 'active',
    },
    {
      id: 'part-pooja',
      name: 'Pooja Hegde',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      color: '#EC4899',
      status: 'active',
    },
  ];

  private simulatedComments = [
    'That visual shot was unbelievable! 🔥',
    'Wait, keep an eye on the background coordinates... 👀',
    'The Dolby Atmos audio mix here is unreal through headphones',
    'Did you catch that subtle clue in the dialogue?!',
    '4K HDR looks pristine on this stream 🚀',
    'Haha loved that reaction 😂',
    'This plot twist caught me completely off guard 😱',
    'The score in this scene gives me chills every time 🎶',
    'Grabbed fresh popcorn just in time 🍿',
    '10/10 acting performance right there 👏',
    'Who do you think is behind the syndicate?',
    'Brilliant pacing in this sequence!',
  ];

  public connectParty(partyId: string, currentUser: { id: string; name: string; avatar?: string; color?: string }): {
    initialMessages: BusMessage[];
    initialParticipants: BusParticipant[];
  } {
    if (!this.messagesByParty.has(partyId)) {
      this.messagesByParty.set(partyId, [
        {
          id: `sys-welcome-${Date.now()}`,
          partyId,
          senderId: 'system',
          senderName: 'System',
          senderColor: '#A78BFA',
          text: `Watch Party room ${partyId} initialized. Playback is synchronized.`,
          timestamp: new Date().toISOString(),
          isSystem: true,
        },
      ]);
    }

    if (!this.participantsByParty.has(partyId)) {
      const initialRoster: BusParticipant[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          color: currentUser.color || '#8B5CF6',
          status: 'active',
          isHost: true,
        },
        ...this.defaultParticipants.slice(0, 3),
      ];
      this.participantsByParty.set(partyId, initialRoster);
    } else {
      const roster = this.participantsByParty.get(partyId)!;
      if (!roster.some(p => p.id === currentUser.id)) {
        roster.unshift({
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          color: currentUser.color || '#8B5CF6',
          status: 'active',
          isHost: false,
        });
      }
    }

    // Start background simulated participant banter for this party
    this.startSimulationForParty(partyId);

    return {
      initialMessages: this.messagesByParty.get(partyId) || [],
      initialParticipants: this.participantsByParty.get(partyId) || [],
    };
  }

  private startSimulationForParty(partyId: string) {
    if (this.simulationIntervals.has(partyId)) return;

    // Periodically post a simulated participant message every 12 to 24 seconds
    const scheduleNext = () => {
      const delay = Math.floor(10000 + Math.random() * 14000);
      const timer = setTimeout(() => {
        this.emitRandomSimulatedMessage(partyId);
        scheduleNext();
      }, delay);
      this.simulationIntervals.set(partyId, timer);
    };

    scheduleNext();
  }

  private emitRandomSimulatedMessage(partyId: string) {
    const participants = this.participantsByParty.get(partyId);
    if (!participants || participants.length <= 1) return;

    // Pick a non-host participant
    const bots = participants.filter(p => !p.isHost);
    if (bots.length === 0) return;
    const bot = bots[Math.floor(Math.random() * bots.length)];

    // Show "typing..." briefly
    this.notifyTyping(partyId, bot.name);

    setTimeout(() => {
      this.notifyTyping(partyId, null);

      const text = this.simulatedComments[Math.floor(Math.random() * this.simulatedComments.length)];
      const newMsg: BusMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        partyId,
        senderId: bot.id,
        senderName: bot.name,
        senderAvatar: bot.avatar,
        senderColor: bot.color,
        text,
        timestamp: new Date().toISOString(),
      };

      const msgs = this.messagesByParty.get(partyId) || [];
      msgs.push(newMsg);
      if (msgs.length > 80) msgs.shift();

      this.notifyMessage(partyId, newMsg);
    }, 2000);
  }

  public sendMessage(partyId: string, user: { id: string; name: string; avatar?: string; color?: string }, text: string): BusMessage {
    const msg: BusMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      partyId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color || '#8B5CF6',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const msgs = this.messagesByParty.get(partyId) || [];
    msgs.push(msg);
    if (msgs.length > 80) msgs.shift();

    this.notifyMessage(partyId, msg);

    // Occasionally trigger a friendly simulated response back
    if (Math.random() > 0.4) {
      setTimeout(() => {
        const participants = this.participantsByParty.get(partyId) || [];
        const bots = participants.filter(p => p.id !== user.id);
        if (bots.length > 0) {
          const responder = bots[Math.floor(Math.random() * bots.length)];
          const responses = [
            `Totally agree with ${user.name}! 💯`,
            '100% same thoughts haha',
            'Right?! That moment was so well done',
            'Wait for the next scene, it gets even crazier 🍿',
            '🙌🙌',
          ];
          const respMsg: BusMessage = {
            id: `msg-resp-${Date.now()}`,
            partyId,
            senderId: responder.id,
            senderName: responder.name,
            senderAvatar: responder.avatar,
            senderColor: responder.color,
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
          };
          msgs.push(respMsg);
          this.notifyMessage(partyId, respMsg);
        }
      }, 2500);
    }

    return msg;
  }

  public sendReaction(partyId: string, user: { id: string; name: string; color?: string }, emoji: string): BusMessage {
    return this.sendMessage(partyId, user, emoji);
  }

  public sendSystemBroadcast(partyId: string, text: string): BusMessage {
    const sysMsg: BusMessage = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      partyId,
      senderId: 'system',
      senderName: 'System',
      senderColor: '#10B981',
      text,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    const msgs = this.messagesByParty.get(partyId) || [];
    msgs.push(sysMsg);
    if (msgs.length > 80) msgs.shift();
    this.notifyMessage(partyId, sysMsg);
    return sysMsg;
  }

  public notifyPlaybackEvent(partyId: string, user: { name: string }, action: 'played' | 'paused' | 'seeked', timestampSecs: number) {
    const mins = Math.floor(timestampSecs / 60);
    const secs = Math.floor(timestampSecs % 60);
    const timeFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

    let text = `${user.name} resumed playback at ${timeFormatted}`;
    if (action === 'paused') {
      text = `${user.name} paused playback at ${timeFormatted}`;
    } else if (action === 'seeked') {
      text = `${user.name} scrubbed to ${timeFormatted}`;
    }

    const sysMsg: BusMessage = {
      id: `sys-${Date.now()}`,
      partyId,
      senderId: 'system',
      senderName: 'System',
      senderColor: '#60A5FA',
      text,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };

    const msgs = this.messagesByParty.get(partyId) || [];
    msgs.push(sysMsg);
    this.notifyMessage(partyId, sysMsg);
  }

  public subscribeMessages(partyId: string, listener: MessageListener): () => void {
    if (!this.messageListeners.has(partyId)) {
      this.messageListeners.set(partyId, new Set());
    }
    this.messageListeners.get(partyId)!.add(listener);

    return () => {
      this.messageListeners.get(partyId)?.delete(listener);
    };
  }

  public subscribeParticipants(partyId: string, listener: ParticipantsListener): () => void {
    if (!this.participantListeners.has(partyId)) {
      this.participantListeners.set(partyId, new Set());
    }
    this.participantListeners.get(partyId)!.add(listener);

    return () => {
      this.participantListeners.get(partyId)?.delete(listener);
    };
  }

  public subscribeTyping(partyId: string, listener: TypingListener): () => void {
    if (!this.typingListeners.has(partyId)) {
      this.typingListeners.set(partyId, new Set());
    }
    this.typingListeners.get(partyId)!.add(listener);

    return () => {
      this.typingListeners.get(partyId)?.delete(listener);
    };
  }

  private notifyMessage(partyId: string, message: BusMessage) {
    this.messageListeners.get(partyId)?.forEach(cb => cb(message));
  }

  private notifyParticipants(partyId: string, participants: BusParticipant[]) {
    this.participantListeners.get(partyId)?.forEach(cb => cb(participants));
  }

  private notifyTyping(partyId: string, name: string | null) {
    this.typingListeners.get(partyId)?.forEach(cb => cb(name));
  }

  public disconnectParty(partyId: string) {
    const timer = this.simulationIntervals.get(partyId);
    if (timer) {
      clearTimeout(timer);
      this.simulationIntervals.delete(partyId);
    }
  }
}

export const simulatedMessageBus = new SimulatedMessageBus();
