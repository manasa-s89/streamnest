import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  CreditCard,
  Film,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { InAppNotification } from '../types/user.ts';

interface NotificationsModalProps {
  notifications: InAppNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const getIcon = (cat: InAppNotification['category']) => {
    switch (cat) {
      case 'release':
        return <Film className="w-4 h-4 text-emerald-600" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4 pr-8">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">In-App Notifications</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications right now. You&apos;re completely up to date!
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs">
                    {getIcon(notif.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-amber-800 font-mono font-semibold whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
