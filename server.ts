import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Use /ws endpoint for WebSocket real-time connection
const wss = new WebSocketServer({ server, path: '/ws' });

interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  ws: WebSocket;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

interface WatchPartyRoom {
  partyId: string;
  contentId: string;
  contentTitle: string;
  episodeId?: string;
  hostId: string;
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
  participants: Map<string, Participant>;
  messages: ChatMessage[];
}

const rooms = new Map<string, WatchPartyRoom>();

function broadcastToRoom(partyId: string, data: any, excludeWs?: WebSocket) {
  const room = rooms.get(partyId);
  if (!room) return;
  const payload = JSON.stringify(data);
  room.participants.forEach(participant => {
    if (participant.ws !== excludeWs && participant.ws.readyState === WebSocket.OPEN) {
      participant.ws.send(payload);
    }
  });
}

function getSafeRoomData(room: WatchPartyRoom) {
  const participantsList = Array.from(room.participants.values()).map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    isHost: p.isHost,
  }));

  return {
    partyId: room.partyId,
    contentId: room.contentId,
    contentTitle: room.contentTitle,
    episodeId: room.episodeId,
    hostId: room.hostId,
    isPlaying: room.isPlaying,
    currentTime: room.currentTime,
    participants: participantsList,
    messages: room.messages,
  };
}

wss.on('connection', (ws: WebSocket) => {
  let currentPartyId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (raw: string) => {
    try {
      const data = JSON.parse(raw.toString());

      switch (data.type) {
        case 'join_party': {
          const { partyId, user, contentId, contentTitle, episodeId, initialSeconds } = data;
          currentPartyId = partyId;
          currentUserId = user.id;

          let room = rooms.get(partyId);
          const isNewRoom = !room;

          if (!room) {
            room = {
              partyId,
              contentId,
              contentTitle: contentTitle || 'StreamNest Title',
              episodeId,
              hostId: user.id,
              isPlaying: false,
              currentTime: initialSeconds || 0,
              lastUpdated: Date.now(),
              participants: new Map(),
              messages: [],
            };
            rooms.set(partyId, room);
          }

          // Register participant
          const isHost = isNewRoom || room.hostId === user.id;
          room.participants.set(user.id, {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            color: user.color || '#8B5CF6',
            isHost,
            ws,
          });

          // System greeting message
          const joinMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: 'system',
            senderName: 'System',
            senderColor: '#A78BFA',
            text: `${user.name} joined the Watch Party`,
            timestamp: new Date().toISOString(),
            isSystem: true,
          };
          room.messages.push(joinMessage);

          // Send current state to newly joined client
          ws.send(JSON.stringify({
            type: 'party_state',
            room: getSafeRoomData(room),
          }));

          // Broadcast participant joined to others
          broadcastToRoom(partyId, {
            type: 'participant_joined',
            participant: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              color: user.color || '#8B5CF6',
              isHost,
            },
            message: joinMessage,
          }, ws);
          break;
        }

        case 'sync_playback': {
          if (!currentPartyId) return;
          const room = rooms.get(currentPartyId);
          if (!room) return;

          const { isPlaying, currentTime, updatedBy } = data;
          room.isPlaying = isPlaying;
          room.currentTime = currentTime;
          room.lastUpdated = Date.now();

          // Broadcast playback synchronization to all other participants
          broadcastToRoom(currentPartyId, {
            type: 'sync_playback',
            isPlaying,
            currentTime,
            updatedBy,
          }, ws);

          // Optional system log in chat when user pauses/plays
          const actionText = isPlaying
            ? `resumed at ${Math.floor(currentTime / 60)}m ${Math.floor(currentTime % 60)}s`
            : `paused at ${Math.floor(currentTime / 60)}m ${Math.floor(currentTime % 60)}s`;

          const sysMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: 'system',
            senderName: 'System',
            senderColor: '#60A5FA',
            text: `${updatedBy.name} ${actionText}`,
            timestamp: new Date().toISOString(),
            isSystem: true,
          };
          room.messages.push(sysMsg);
          if (room.messages.length > 100) room.messages.shift();

          broadcastToRoom(currentPartyId, {
            type: 'chat_message',
            message: sysMsg,
          });
          break;
        }

        case 'send_chat': {
          if (!currentPartyId) return;
          const room = rooms.get(currentPartyId);
          if (!room) return;

          const { text, user } = data;
          if (!text || !text.trim()) return;

          const newMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: user.id,
            senderName: user.name,
            senderColor: user.color || '#A78BFA',
            text: text.trim(),
            timestamp: new Date().toISOString(),
          };

          room.messages.push(newMsg);
          if (room.messages.length > 100) room.messages.shift();

          broadcastToRoom(currentPartyId, {
            type: 'chat_message',
            message: newMsg,
          });
          break;
        }

        case 'leave_party': {
          cleanupUser();
          break;
        }
      }
    } catch (e) {
      console.error('Error handling WebSocket message', e);
    }
  });

  const cleanupUser = () => {
    if (currentPartyId && currentUserId) {
      const room = rooms.get(currentPartyId);
      if (room) {
        const leavingParticipant = room.participants.get(currentUserId);
        room.participants.delete(currentUserId);

        if (room.participants.size === 0) {
          // Remove empty room after 5 minutes
          setTimeout(() => {
            const r = rooms.get(currentPartyId!);
            if (r && r.participants.size === 0) {
              rooms.delete(currentPartyId!);
            }
          }, 300000);
        } else {
          // Notify remaining participants
          const leaveMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: 'system',
            senderName: 'System',
            senderColor: '#94A3B8',
            text: `${leavingParticipant?.name || 'A user'} left the Watch Party`,
            timestamp: new Date().toISOString(),
            isSystem: true,
          };
          room.messages.push(leaveMsg);

          broadcastToRoom(currentPartyId, {
            type: 'participant_left',
            participantId: currentUserId,
            participantName: leavingParticipant?.name || 'A user',
            message: leaveMsg,
          });
        }
      }
    }
    currentPartyId = null;
    currentUserId = null;
  };

  ws.on('close', cleanupUser);
  ws.on('error', cleanupUser);
});

// App configuration and Vite integration
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`StreamNest server running on port ${PORT}`);
  });
}

startServer();
