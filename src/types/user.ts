export type SubscriptionTier = 'none' | 'Basic' | 'Standard' | 'Premium';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  price: number; // 99, 199, 299
  currency: string; // '₹'
  status: 'active' | 'canceled' | 'expired' | 'trial';
  validUntil: string;
  startedAt: string;
  autoRenew: boolean;
  screenLimit: number;
  maxQuality: '720p HD' | '1080p FHD' | '4K UHD + HDR';
  audioSupport: 'Stereo' | 'Dolby 5.1' | 'Dolby Atmos';
  offlineDownloads: boolean;
}

export interface SubProfile {
  id: string;
  name: string;
  avatarColor: string;
  isKids: boolean;
}

export interface Customer {
  id: string; // e.g. "CUST-98421"
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedAt: string;
  activeProfileId: string;
  profiles: SubProfile[];
  subscription: SubscriptionInfo;
}

export interface InAppNotification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  category: 'system' | 'release' | 'billing' | 'recommendation';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type TelemetryEventType =
  | 'user_registered'
  | 'user_login'
  | 'user_logout'
  | 'content_view_started'
  | 'watch_progress_tick'
  | 'watch_completed'
  | 'watchlist_changed'
  | 'subscription_changed'
  | 'subscription_renewed'
  | 'subscription_canceled';

export interface TelemetryEvent {
  eventId: string;
  eventType: TelemetryEventType;
  customerId: string;
  timestamp: string;
  payload: Record<string, any>;
  dispatchedToCrm: boolean;
  dispatchError?: string;
  dispatchAttemptAt?: string;
}
