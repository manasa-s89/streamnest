import { Customer, InAppNotification } from '../types/user.ts';
import { WatchProgress, ViewingHistoryItem } from '../types/streamnest.ts';

export const INITIAL_CUSTOMER: Customer = {
  id: 'CUST-84920',
  name: 'Manasa Sharma',
  email: 'manasas99577@gmail.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  joinedAt: '2026-02-10T12:00:00Z',
  activeProfileId: 'prof-1',
  profiles: [
    { id: 'prof-1', name: 'Manasa', avatarColor: '#7C3AED', isKids: false },
    { id: 'prof-2', name: 'Family', avatarColor: '#3B82F6', isKids: false },
    { id: 'prof-3', name: 'Kids Zone', avatarColor: '#10B981', isKids: true },
  ],
  subscription: {
    tier: 'Standard',
    price: 199,
    currency: '₹',
    status: 'active',
    validUntil: '2026-11-15T23:59:59Z',
    startedAt: '2026-03-15T10:00:00Z',
    autoRenew: true,
    screenLimit: 2,
    maxQuality: '1080p FHD',
    audioSupport: 'Dolby 5.1',
    offlineDownloads: true,
  },
};

export const INITIAL_WATCH_PROGRESS: Record<string, WatchProgress> = {
  'sn-mov-1': {
    contentId: 'sn-mov-1',
    progressSeconds: 5880, // ~1h 38m out of 2h 24m (144m = 8640s)
    totalSeconds: 8640,
    progressPercent: 68,
    lastWatchedAt: '2026-10-15T19:40:00Z',
    completed: false,
  },
  'sn-ser-1': {
    contentId: 'sn-ser-1',
    progressSeconds: 1400, // 23m of 52m (3120s)
    totalSeconds: 3120,
    progressPercent: 45,
    lastWatchedAt: '2026-10-14T21:15:00Z',
    completed: false,
    episodeId: 'sn-ser-1-s1e1',
  },
};

export const INITIAL_WATCHLIST: string[] = ['sn-mov-2', 'sn-ser-1', 'sn-mov-7'];

export const INITIAL_HISTORY: ViewingHistoryItem[] = [
  {
    id: 'hist-1',
    contentId: 'sn-mov-1',
    title: 'Quantum Veil: Beyond Epoch',
    contentType: 'movie',
    watchedAt: '2026-10-15T19:40:00Z',
    durationMinutes: 98,
    completed: false,
  },
  {
    id: 'hist-2',
    contentId: 'sn-ser-1',
    title: 'Neon Syndicate (S1:E1)',
    contentType: 'series',
    watchedAt: '2026-10-14T21:15:00Z',
    durationMinutes: 23,
    completed: false,
    season: 1,
    episodeNumber: 1,
  },
  {
    id: 'hist-3',
    contentId: 'sn-mov-4',
    title: 'The Sovereign Heist',
    contentType: 'movie',
    watchedAt: '2026-10-10T22:30:00Z',
    durationMinutes: 132,
    completed: true,
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    customerId: 'CUST-84920',
    title: 'New Release: Quantum Veil',
    message: 'The acclaimed sci-fi blockbuster is now streaming in 4K Dolby Atmos.',
    category: 'release',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    customerId: 'CUST-84920',
    title: 'Subscription Active: Standard ₹199',
    message: 'Your next renewal is scheduled for 15 Nov 2026 via UPI Autopay.',
    category: 'billing',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif-3',
    customerId: 'CUST-84920',
    title: 'New Season: Neon Syndicate S3',
    message: 'All 8 episodes of the final chapter are now available to binge.',
    category: 'release',
    timestamp: '3 days ago',
    read: false,
  },
];
