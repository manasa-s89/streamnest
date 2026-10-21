import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogIn,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { Customer } from '../types/user.ts';
import { crmTelemetry } from '../services/crmTelemetry.ts';

interface AuthModalProps {
  currentCustomer: Customer | null;
  onClose: () => void;
  onLogin: (customer: Customer) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentCustomer,
  onClose,
  onLogin,
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(!currentCustomer);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const presetUsers: Customer[] = [
    {
      id: 'CUST-84920',
      name: 'Manasa Sharma',
      email: 'manasas99577@gmail.com',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: '2026-02-10T12:00:00Z',
      activeProfileId: 'prof-1',
      profiles: [
        { id: 'prof-1', name: 'Manasa', avatarColor: '#EAB308', isKids: false },
        { id: 'prof-2', name: 'Family', avatarColor: '#10B981', isKids: false },
        { id: 'prof-3', name: 'Kids Zone', avatarColor: '#059669', isKids: true },
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
    },
    {
      id: 'CUST-39184',
      name: 'Vikram Malhotra',
      email: 'vikram.m@streamnest.in',
      phone: '+91 91234 56789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      joinedAt: '2026-01-20T08:00:00Z',
      activeProfileId: 'prof-1',
      profiles: [
        { id: 'prof-1', name: 'Vikram', avatarColor: '#F59E0B', isKids: false },
        { id: 'prof-2', name: 'Weekend Binge', avatarColor: '#10B981', isKids: false },
      ],
      subscription: {
        tier: 'Premium',
        price: 299,
        currency: '₹',
        status: 'active',
        validUntil: '2026-12-01T23:59:59Z',
        startedAt: '2026-01-20T08:00:00Z',
        autoRenew: true,
        screenLimit: 4,
        maxQuality: '4K UHD + HDR',
        audioSupport: 'Dolby Atmos',
        offlineDownloads: true,
      },
    },
    {
      id: 'CUST-55209',
      name: 'Ananya Verma',
      email: 'ananya.v@streamnest.in',
      phone: '+91 99887 76655',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      joinedAt: '2026-04-05T14:30:00Z',
      activeProfileId: 'prof-1',
      profiles: [
        { id: 'prof-1', name: 'Ananya', avatarColor: '#10B981', isKids: false },
      ],
      subscription: {
        tier: 'Basic',
        price: 99,
        currency: '₹',
        status: 'active',
        validUntil: '2026-10-30T23:59:59Z',
        startedAt: '2026-04-05T14:30:00Z',
        autoRenew: true,
        screenLimit: 1,
        maxQuality: '720p HD',
        audioSupport: 'Stereo',
        offlineDownloads: false,
      },
    },
  ];

  const handleSelectPreset = (cust: Customer) => {
    onLogin(cust);
    crmTelemetry.recordEvent('user_login', cust.id, {
      customer_id: cust.id,
      email: cust.email,
      name: cust.name,
      subscription_tier: cust.subscription.tier,
      login_method: 'demo_credential',
      device: navigator.userAgent,
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (isRegister) {
      const newCustId = `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
      const newCustomer: Customer = {
        id: newCustId,
        name: name.trim() || 'New Member',
        email: email.trim(),
        phone: phone.trim() || '+91 90000 00000',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinedAt: new Date().toISOString(),
        activeProfileId: 'prof-1',
        profiles: [
          { id: 'prof-1', name: name.trim().split(' ')[0] || 'Default', avatarColor: '#EAB308', isKids: false },
        ],
        subscription: {
          tier: 'Basic',
          price: 99,
          currency: '₹',
          status: 'active',
          validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          startedAt: new Date().toISOString(),
          autoRenew: true,
          screenLimit: 1,
          maxQuality: '720p HD',
          audioSupport: 'Stereo',
          offlineDownloads: false,
        },
      };

      crmTelemetry.recordEvent('user_registered', newCustId, {
        customer_id: newCustId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        initial_plan: 'Basic (₹99 Demo Trial)',
        source: 'OTT_Self_Registration',
      });

      crmTelemetry.recordEvent('user_login', newCustId, {
        customer_id: newCustId,
        email: newCustomer.email,
        name: newCustomer.name,
        device: navigator.userAgent,
      });

      onLogin(newCustomer);
    } else {
      // Find matching preset or create signed-in session
      const matched = presetUsers.find(p => p.email.toLowerCase() === email.toLowerCase()) || presetUsers[0];
      crmTelemetry.recordEvent('user_login', matched.id, {
        customer_id: matched.id,
        email: matched.email,
        name: matched.name,
        device: navigator.userAgent,
      });
      onLogin(matched);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-extrabold tracking-tight text-xl text-slate-900">StreamNest</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              Customer Auth
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Create your StreamNest customer ID and start streaming instantly.'
              : 'Sign in to access your watchlists, continue watching queue, and billing.'}
          </p>
        </div>

        {/* Quick Demo Customer Switcher */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Quick Switch Demo Customer
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Linked to CRM</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {presetUsers.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  currentCustomer?.id === p.id
                    ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-slate-950'
                }`}
              >
                <p className="text-xs font-bold truncate">{p.name.split(' ')[0]}</p>
                <p className="text-[10px] text-amber-600 font-mono truncate font-semibold">{p.id}</p>
                <p className="text-[10px] text-slate-500">{p.subscription.tier} ₹{p.subscription.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegister
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Customer</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isRegister}
                  placeholder="e.g. Manasa Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="manasas99577@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{isRegister ? 'Register & Generate Customer ID' : 'Continue to StreamNest'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Persistent Telemetry Sync</span>
          </div>
          <span className="font-mono text-emerald-700 font-medium">Demo Authentication</span>
        </div>
      </div>
    </div>
  );
};
