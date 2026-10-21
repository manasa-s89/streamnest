import React from 'react';
import { Check, Zap, Star } from 'lucide-react';
import { Customer, SubscriptionTier } from '../types/user.ts';

interface PlansPageProps {
  customer: Customer | null;
  onOpenSubscriptionModal: () => void;
  onOpenAuth: () => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({
  customer,
  onOpenSubscriptionModal,
  onOpenAuth,
}) => {
  const plans = [
    {
      tier: 'Basic' as SubscriptionTier,
      price: 99,
      badge: 'Starter Choice',
      resolution: '720p HD',
      screens: 1,
      audio: 'Stereo',
      downloads: 'No',
      devices: 'Phone, Tablet, Laptop',
      description: 'Stream unlimited movies and series on your personal devices.',
      features: [
        '720p High Definition video stream',
        'Watch on 1 device at a time',
        'Unlimited access to full library',
        'Standard Stereo audio',
        'Cancel or upgrade anytime',
      ],
    },
    {
      tier: 'Standard' as SubscriptionTier,
      price: 199,
      badge: 'Most Popular',
      popular: true,
      resolution: '1080p Full HD',
      screens: 2,
      audio: 'Dolby 5.1 Surround',
      downloads: 'Yes (2 devices)',
      devices: 'TV, Computer, Phone, Tablet',
      description: 'Crystal Full HD clarity with 2 simultaneous screens for family and friends.',
      features: [
        '1080p Full HD crystal streaming',
        'Watch on 2 screens simultaneously',
        'TV app, web and mobile support',
        'Dolby 5.1 cinematic surround sound',
        'Offline downloads on 2 mobile devices',
      ],
    },
    {
      tier: 'Premium' as SubscriptionTier,
      price: 299,
      badge: 'Ultimate 4K Cinema',
      resolution: '4K Ultra HD + HDR10+',
      screens: 4,
      audio: 'Spatial Dolby Atmos',
      downloads: 'Yes (4 devices)',
      devices: 'All Supported Devices',
      description: 'The definitive cinema hall experience in your living room with 4K HDR and spatial sound.',
      features: [
        '4K Ultra HD + HDR10+ visual brilliance',
        'Watch on 4 screens simultaneously',
        'Spatial Dolby Atmos audio mastering',
        'Priority high-speed streaming CDN',
        'Offline downloads on 4 devices',
      ],
    },
  ];

  const handleAction = () => {
    if (!customer) {
      onOpenAuth();
    } else {
      onOpenSubscriptionModal();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>StreamNest Membership</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Plans
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          No hidden fees, no lock-in contracts. Upgrade, switch, or cancel anytime in one click.
        </p>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map(p => {
          const isCurrent = customer?.subscription.tier === p.tier && customer?.subscription.status === 'active';

          return (
            <div
              key={p.tier}
              className={`rounded-2xl p-6 sm:p-8 border flex flex-col justify-between transition-all ${
                p.popular
                  ? 'bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 border-amber-400 shadow-md ring-1 ring-amber-300'
                  : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-900 bg-amber-100 border border-amber-200 px-3 py-1 rounded">
                    {p.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                      Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{p.tier}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {p.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono">₹{p.price}</span>
                  <span className="text-sm text-slate-500 font-medium">/ month</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAction}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-xs ${
                  p.popular
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-sm'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isCurrent ? 'Manage Subscription' : `Choose ${p.tier} ₹${p.price}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 overflow-x-auto shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Detailed Plan Specifications</h3>
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-4">Feature</th>
              <th className="pb-4">Basic ₹99</th>
              <th className="pb-4 text-amber-700 font-bold">Standard ₹199</th>
              <th className="pb-4 text-emerald-700 font-bold">Premium ₹299</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-4 font-semibold text-slate-900">Monthly Price</td>
              <td className="py-4 font-mono">₹99</td>
              <td className="py-4 font-mono font-bold text-slate-900">₹199</td>
              <td className="py-4 font-mono font-bold text-emerald-700">₹299</td>
            </tr>
            <tr>
              <td className="py-4 font-semibold text-slate-900">Video Quality & Resolution</td>
              <td className="py-4">720p HD</td>
              <td className="py-4 font-medium text-slate-900">1080p Full HD</td>
              <td className="py-4 font-bold text-emerald-700">4K Ultra HD + HDR10+</td>
            </tr>
            <tr>
              <td className="py-4 font-semibold text-slate-900">Simultaneous Screens</td>
              <td className="py-4 font-mono">1 Screen</td>
              <td className="py-4 font-mono font-medium text-slate-900">2 Screens</td>
              <td className="py-4 font-mono font-bold text-emerald-700">4 Screens</td>
            </tr>
            <tr>
              <td className="py-4 font-semibold text-slate-900">Spatial Audio Engineering</td>
              <td className="py-4">Stereo</td>
              <td className="py-4">Dolby 5.1</td>
              <td className="py-4 font-bold text-emerald-700">Dolby Atmos</td>
            </tr>
            <tr>
              <td className="py-4 font-semibold text-slate-900">Offline Device Downloads</td>
              <td className="py-4 text-slate-400">Not included</td>
              <td className="py-4">2 Devices</td>
              <td className="py-4 font-bold text-emerald-700">4 Devices</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Claim-to-Proof Adjacency Testimonial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            &quot;The 4K HDR playback and Dolby Atmos on StreamNest Premium rivals physical Blu-ray discs. Unmatched fidelity for ₹299.&quot;
          </p>
          <p className="text-xs font-semibold text-slate-900">Rohit Venkat</p>
          <p className="text-[11px] text-slate-500">Home Theater Enthusiast, Bengaluru</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            &quot;Upgrading to Standard for 2 screens was seamless. The instant resume across our TV and iPad works every single time.&quot;
          </p>
          <p className="text-xs font-semibold text-slate-900">Sneha Roy</p>
          <p className="text-[11px] text-slate-500">Standard Plan Subscriber, Mumbai</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            &quot;Basic ₹99 plan is the best value streaming subscription in India for mobile commuters. Zero lag and clean UI.&quot;
          </p>
          <p className="text-xs font-semibold text-slate-900">Arjun Nair</p>
          <p className="text-[11px] text-slate-500">Mobile Subscriber, Hyderabad</p>
        </div>
      </div>
    </div>
  );
};
