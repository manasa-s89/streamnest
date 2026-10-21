import React, { useState } from 'react';
import {
  X,
  Check,
  Shield,
  Zap,
  CreditCard,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Customer, SubscriptionTier } from '../types/user.ts';
import { crmTelemetry } from '../services/crmTelemetry.ts';

interface SubscriptionModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdateSubscription: (updatedCustomer: Customer) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  customer,
  onClose,
  onUpdateSubscription,
}) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    customer.subscription.tier === 'none' ? 'Standard' : customer.subscription.tier
  );
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'payment' | 'cancel_confirm'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState<string>('manasa@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Cost too high');

  const plans = [
    {
      tier: 'Basic' as SubscriptionTier,
      price: 99,
      badge: 'Starter',
      resolution: '720p HD',
      screens: 1,
      audio: 'Stereo',
      downloads: false,
      description: 'Ideal for personal mobile streaming with crisp high definition.',
      features: [
        '720p High Definition streaming',
        'Watch on 1 phone, tablet or laptop',
        'Unlimited movies & TV shows',
        'Standard Stereo Audio',
      ],
    },
    {
      tier: 'Standard' as SubscriptionTier,
      price: 199,
      badge: 'Most Popular',
      popular: true,
      resolution: '1080p FHD',
      screens: 2,
      audio: 'Dolby 5.1',
      downloads: true,
      description: 'Great for couples & shared screens with Full HD and surround sound.',
      features: [
        '1080p Full HD crystal streaming',
        'Watch on 2 screens simultaneously',
        'Full TV, laptop, tablet & phone access',
        'Dolby 5.1 cinematic audio',
        'Offline mobile downloads',
      ],
    },
    {
      tier: 'Premium' as SubscriptionTier,
      price: 299,
      badge: 'Cinematic 4K',
      resolution: '4K UHD + HDR',
      screens: 4,
      audio: 'Dolby Atmos',
      downloads: true,
      description: 'The ultimate home theatre experience with 4K Ultra HD and Dolby Atmos.',
      features: [
        '4K Ultra HD + HDR10+ visual mastery',
        'Watch on 4 screens at the same time',
        'Immersive spatial Dolby Atmos sound',
        'Ultra fast zero-buffer priority CDN',
        'Unlimited downloads on 4 devices',
      ],
    },
  ];

  const handleProceedToPayment = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setCheckoutStep('payment');
  };

  const handleConfirmSubscription = () => {
    setIsProcessing(true);
    const chosenPlan = plans.find(p => p.tier === selectedTier) || plans[1];

    setTimeout(() => {
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString();
      const updatedCustomer: Customer = {
        ...customer,
        subscription: {
          tier: chosenPlan.tier,
          price: chosenPlan.price,
          currency: '₹',
          status: 'active',
          validUntil: nextMonth,
          startedAt: new Date().toISOString(),
          autoRenew: true,
          screenLimit: chosenPlan.screens,
          maxQuality: chosenPlan.resolution as any,
          audioSupport: chosenPlan.audio as any,
          offlineDownloads: chosenPlan.downloads,
        },
      };

      crmTelemetry.recordEvent('subscription_changed', customer.id, {
        customer_id: customer.id,
        previous_tier: customer.subscription.tier,
        new_tier: chosenPlan.tier,
        price: chosenPlan.price,
        payment_method: paymentMethod,
        channel: 'OTT_Self_Checkout',
      });

      onUpdateSubscription(updatedCustomer);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  const handleRenewNow = () => {
    const currentPrice = customer.subscription.price || 199;
    const extendedDate = new Date(Date.now() + 30 * 86400000).toISOString();
    const updatedCustomer: Customer = {
      ...customer,
      subscription: {
        ...customer.subscription,
        status: 'active',
        validUntil: extendedDate,
        autoRenew: true,
      },
    };

    crmTelemetry.recordEvent('subscription_renewed', customer.id, {
      customer_id: customer.id,
      tier: customer.subscription.tier,
      price: currentPrice,
      valid_until: extendedDate,
    });

    onUpdateSubscription(updatedCustomer);
    onClose();
  };

  const handleCancelSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updatedCustomer: Customer = {
        ...customer,
        subscription: {
          ...customer.subscription,
          status: 'canceled',
          autoRenew: false,
        },
      };

      crmTelemetry.recordEvent('subscription_canceled', customer.id, {
        customer_id: customer.id,
        current_tier: customer.subscription.tier,
        reason: cancelReason,
        canceled_at: new Date().toISOString(),
      });

      onUpdateSubscription(updatedCustomer);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono mb-2 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>StreamNest Subscription Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Flexible Plans. Cancel Anytime.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Customer ID: <span className="font-mono text-emerald-700 font-bold">{customer.id}</span> · Active Plan: <strong className="text-slate-900">{customer.subscription.tier} (₹{customer.subscription.price}/mo)</strong>
          </p>
        </div>

        {/* Plan Comparison Grid */}
        {checkoutStep === 'plans' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {plans.map(p => {
                const isCurrent = customer.subscription.tier === p.tier && customer.subscription.status === 'active';
                const isSelected = selectedTier === p.tier;

                return (
                  <div
                    key={p.tier}
                    onClick={() => setSelectedTier(p.tier)}
                    className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all cursor-pointer ${
                      p.popular
                        ? 'bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 border-amber-400 shadow-md ring-1 ring-amber-300'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                    } ${isSelected ? 'ring-2 ring-emerald-600' : ''}`}
                  >
                    {/* Top Ribbon */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded">
                        {p.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{p.tier}</h3>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-3xl font-extrabold text-slate-900">₹{p.price}</span>
                        <span className="text-xs text-slate-500 font-medium">/ month</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-4 mb-6">
                        {p.features.map(f => (
                          <div key={f} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleProceedToPayment(p.tier);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : p.popular
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-sm'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isCurrent ? 'Renew Current Plan' : `Select ${p.tier} ₹${p.price}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions (Renew / Cancel) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>
                  Valid until: <strong className="text-slate-900">{new Date(customer.subscription.validUntil).toLocaleDateString()}</strong> ({customer.subscription.status === 'active' ? 'Active' : 'Canceled'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRenewNow}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors font-medium cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Instant 30-Day Renewal</span>
                </button>
                {customer.subscription.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cancel_confirm')}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 transition-colors font-medium cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Subscription</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Demo Payment Checkout Step */}
        {checkoutStep === 'payment' && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900">StreamNest {selectedTier}</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ₹{plans.find(p => p.tier === selectedTier)?.price} / mo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                30 days full streaming access. Demo billing simulation.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>NetBanking</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div>
                  <label className="text-xs text-slate-600 block mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('plans')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Back to Plans
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmSubscription}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Authorize ₹{plans.find(p => p.tier === selectedTier)?.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Step */}
        {checkoutStep === 'cancel_confirm' && (
          <div className="max-w-md mx-auto space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Cancel {customer.subscription.tier} Subscription?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your benefits will remain active until{' '}
              <strong className="text-slate-900">
                {new Date(customer.subscription.validUntil).toLocaleDateString()}
              </strong>
              . You will not be charged on the next billing cycle.
            </p>

            <div className="text-left">
              <label className="text-xs text-slate-700 font-medium block mb-1">
                Please share your reason:
              </label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="Cost too high">Cost too high / Found better deal</option>
                <option value="Not enough new content">Not enough new content</option>
                <option value="Streaming technical issues">Streaming technical issues</option>
                <option value="Temporary break">Temporary break / Traveling</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCheckoutStep('plans')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Keep My Plan
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCancelSubscription}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
