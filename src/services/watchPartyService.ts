export interface WatchPartyParticipant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
}

export interface WatchPartyMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface WatchPartyRoomState {
  partyId: string;
  contentId: string;
  contentTitle: string;
  episodeId?: string;
  hostId: string;
  isPlaying: boolean;
  currentTime: number;
  participants: WatchPartyParticipant[];
  messages: WatchPartyMessage[];
}

type EventCallback<T = any> = (data: T) => void;

class WatchPartyService {
  private ws: WebSocket | null = null;
  private partyId: string | null = null;
  private currentUser: any = null;
  private currentContent: any = null;
  private episodeId?: string;
  private reconnectTimer: any = null;
  private isConnecting: boolean = false;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public isConnected: boolean = false;

  constructor() {
    this.listeners.set('party_state', new Set());
    this.listeners.set('sync_playback', new Set());
    this.listeners.set('chat_message', new Set());
    this.listeners.set('participant_joined', new Set());
    this.listeners.set('participant_left', new Set());
    this.listeners.set('connection_change', new Set());
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in WatchParty listener for ${event}:`, err);
      }
    });
  }

  public join(
    partyId: string,
    user: { id: string; name: string; avatar: string; color: string },
    contentItem: { id: string; title: string },
    episodeId?: string,
    initialSeconds: number = 0
  ) {
    this.partyId = partyId;
    this.currentUser = user;
    this.currentContent = contentItem;
    this.episodeId = episodeId;

    this.connect(initialSeconds);
  }

  private connect(initialSeconds: number = 0) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.ws.readyState === WebSocket.OPEN && this.partyId) {
        this.sendJoinMessage(initialSeconds);
      }
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.emit('connection_change', true);
        if (this.partyId) {
          this.sendJoinMessage(initialSeconds);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'party_state':
              this.emit('party_state', data.room);
              break;
            case 'sync_playback':
              this.emit('sync_playback', data);
              break;
            case 'chat_message':
              this.emit('chat_message', data.message);
              break;
            case 'participant_joined':
              this.emit('participant_joined', data);
              if (data.message) this.emit('chat_message', data.message);
              break;
            case 'participant_left':
              this.emit('participant_left', data);
              if (data.message) this.emit('chat_message', data.message);
              break;
          }
        } catch (e) {
          console.error('WatchParty failed to parse WS frame', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.emit('connection_change', false);
        // Attempt reconnection if party is still active
        if (this.partyId) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.partyId) this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.emit('connection_change', false);
      };
    } catch (e) {
      this.isConnecting = false;
      this.isConnected = false;
      this.emit('connection_change', false);
    }
  }

  private sendJoinMessage(initialSeconds: number = 0) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'join_party',
      partyId: this.partyId,
      user: this.currentUser,
      contentId: this.currentContent?.id,
      contentTitle: this.currentContent?.title,
      episodeId: this.episodeId,
      initialSeconds,
    }));
  }

  public syncPlayback(isPlaying: boolean, currentTime: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.partyId) return;
    this.ws.send(JSON.stringify({
      type: 'sync_playback',
      partyId: this.partyId,
      isPlaying,
      currentTime,
      updatedBy: {
        id: this.currentUser?.id,
        name: this.currentUser?.name,
      },
    }));
  }

  public sendChat(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.partyId) return;
    this.ws.send(JSON.stringify({
      type: 'send_chat',
      partyId: this.partyId,
      text,
      user: this.currentUser,
    }));
  }

  public leave() {
    clearTimeout(this.reconnectTimer);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'leave_party' }));
      this.ws.close();
    }
    this.partyId = null;
    this.currentUser = null;
    this.currentContent = null;
    this.ws = null;
    this.isConnected = false;
    this.emit('connection_change', false);
  }
}

export const watchPartyService = new WatchPartyService();
