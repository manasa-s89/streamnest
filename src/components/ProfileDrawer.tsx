import React from 'react';
import {
  X,
  CreditCard,
  Tv,
  Laptop,
  LogOut,
  Clock,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Customer } from '../types/user.ts';
import { crmTelemetry } from '../services/crmTelemetry.ts';

interface ProfileDrawerProps {
  customer: Customer;
  onClose: () => void;
  onOpenSubscription: () => void;
  onOpenCrmInspector: () => void;
  onLogout: () => void;
  onSelectSubProfile: (profileId: string) => void;
  watchHistoryCount: number;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  customer,
  onClose,
  onOpenSubscription,
  onOpenCrmInspector,
  onLogout,
  onSelectSubProfile,
  watchHistoryCount,
}) => {
  const handleLogout = () => {
    crmTelemetry.recordEvent('user_logout', customer.id, {
      customer_id: customer.id,
      email: customer.email,
      session_duration_minutes: 42,
    });
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white border-l border-slate-200 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">StreamNest Account</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 shadow-xs">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-600 border-2 border-emerald-500 shrink-0 shadow-sm">
              <img
                src={customer.avatar}
                alt={customer.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 text-base truncate">{customer.name}</h3>
              <p className="text-xs text-slate-500 truncate">{customer.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold">
                <span>{customer.id}</span>
              </div>
            </div>
          </div>

          {/* Sub Profiles Switcher */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Streaming Profiles
            </label>
            <div className="grid grid-cols-3 gap-2">
              {customer.profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectSubProfile(p.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    customer.activeProfileId === p.id
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow-xs"
                    style={{ backgroundColor: p.avatarColor || '#EAB308' }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 border border-emerald-200 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                Active Membership
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                {customer.subscription.status === 'active' ? 'Active' : 'Canceled'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <h4 className="text-xl font-extrabold text-slate-900">
                {customer.subscription.tier} Plan
              </h4>
              <span className="text-sm font-bold text-amber-700">
                ₹{customer.subscription.price}/mo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 mb-4 bg-white/90 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Quality</span>
                <span className="font-semibold text-slate-900">{customer.subscription.maxQuality}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Screens</span>
                <span className="font-semibold text-slate-900">{customer.subscription.screenLimit} Simultaneous</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSubscription();
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-950" />
              <span>Change or Renew Plan</span>
            </button>
          </div>

          {/* Viewing Statistics */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Viewing Analytics (Linked to CRM)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hours Streamed</span>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono">18.4 hrs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Titles in History</span>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono">{watchHistoryCount}</span>
              </div>
            </div>
          </div>

          {/* Connected Devices */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Active Connected Devices
            </label>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <span>Web Applet Browser</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">Active Now</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Tv className="w-4 h-4 text-slate-400" />
                  <span>Living Room Smart TV</span>
                </div>
                <span className="text-[10px] text-slate-500">2d ago</span>
              </div>
            </div>
          </div>

          {/* Direct link to Antigravity CRM telemetry */}
          <button
            onClick={() => {
              onClose();
              onOpenCrmInspector();
            }}
            className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer mb-4 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>CRM Backend & Telemetry Bridge</span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
