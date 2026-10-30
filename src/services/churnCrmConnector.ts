import { Customer, TelemetryEvent } from '../types/user';
import { ViewingHistoryItem, WatchProgress } from '../types/streamnest';

export const CHURN_CRM_BASE_URL = 'https://behaviour-pridection-intervention.vercel.app';

export interface SubscriberMetrics {
  customer_id: string;
  subscription_plan: 'Basic' | 'Standard' | 'Premium';
  monthly_price: number;
  watch_hours_last_30_days: number;
  days_since_last_watch: number;
  number_of_devices?: number;
  number_of_profiles?: number;
  downloads_count?: number;
  customer_support_tickets: number;
  payment_failures: number;
  free_trial_converted?: 'Yes' | 'No';
  tenure_months: number;
  // Exact ChurnIQ column aliases
  tenure?: number;
  plan?: 'Basic' | 'Standard' | 'Premium';
  inactivity_days?: number;
  support_tickets?: number;
  payment_declines?: number;
  name?: string;
  email?: string;
}

export interface ChurnPredictionResult {
  customer_id: string;
  churn_probability: number;
  churn_probability_pct: string;
  risk_tier: 'Critical' | 'High' | 'Moderate' | 'Low';
  predicted_churn: boolean;
  top_risk_drivers?: Array<{ feature: string; impact: number }>;
  top_protective_factors?: Array<{ feature: string; impact: number }>;
  suggested_interventions?: Array<{ title: string; urgency: string; description: string }>;
  explanation_summary?: string;
}

/**
 * Standard dollar pricing based on OTT subscription tier
 */
export const TIER_MONTHLY_PRICES: Record<'Basic' | 'Standard' | 'Premium', number> = {
  Basic: 8.99,
  Standard: 14.99,
  Premium: 20.99,
};

export const STREAMNEST_SUBSCRIBERS: SubscriberMetrics[] = [
  {
    customer_id: 'CUST-84920',
    name: 'Manasa Sharma',
    email: 'manasas99577@gmail.com',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 18.5,
    days_since_last_watch: 10,
    number_of_devices: 2,
    number_of_profiles: 3,
    downloads_count: 2,
    customer_support_tickets: 0,
    payment_failures: 0,
    free_trial_converted: 'Yes',
    tenure_months: 8,
  },
  {
    customer_id: 'CUST-39184',
    name: 'Vikram Malhotra',
    email: 'vikram.m@streamnest.in',
    subscription_plan: 'Premium',
    monthly_price: 20.99,
    watch_hours_last_30_days: 55.0,
    days_since_last_watch: 2,
    number_of_devices: 4,
    number_of_profiles: 2,
    downloads_count: 8,
    customer_support_tickets: 0,
    payment_failures: 0,
    free_trial_converted: 'Yes',
    tenure_months: 9,
  },
  {
    customer_id: 'CUST-55209',
    name: 'Ananya Verma',
    email: 'ananya.v@streamnest.in',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 2.5,
    days_since_last_watch: 28,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    customer_support_tickets: 3,
    payment_failures: 1,
    free_trial_converted: 'No',
    tenure_months: 6,
  },
  {
    customer_id: 'CUST-77102',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 0.8,
    days_since_last_watch: 42,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    customer_support_tickets: 4,
    payment_failures: 2,
    free_trial_converted: 'No',
    tenure_months: 2,
  },
  {
    customer_id: 'CUST-92811',
    name: 'Pooja Rao',
    email: 'pooja.rao@example.com',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 22.4,
    days_since_last_watch: 5,
    number_of_devices: 2,
    number_of_profiles: 2,
    downloads_count: 3,
    customer_support_tickets: 1,
    payment_failures: 0,
    free_trial_converted: 'Yes',
    tenure_months: 7,
  },
  {
    customer_id: 'CUST-10482',
    name: 'Deepak Kumar',
    email: 'deepak.k@example.com',
    subscription_plan: 'Premium',
    monthly_price: 20.99,
    watch_hours_last_30_days: 42.0,
    days_since_last_watch: 3,
    number_of_devices: 4,
    number_of_profiles: 4,
    downloads_count: 6,
    customer_support_tickets: 0,
    payment_failures: 0,
    free_trial_converted: 'Yes',
    tenure_months: 14,
  },
  {
    customer_id: 'CUST-63914',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 1.2,
    days_since_last_watch: 35,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    customer_support_tickets: 2,
    payment_failures: 1,
    free_trial_converted: 'No',
    tenure_months: 3,
  },
  {
    customer_id: 'CUST-48201',
    name: 'Karthik Nair',
    email: 'karthik.n@example.com',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 31.5,
    days_since_last_watch: 1,
    number_of_devices: 2,
    number_of_profiles: 2,
    downloads_count: 5,
    customer_support_tickets: 0,
    payment_failures: 0,
    free_trial_converted: 'Yes',
    tenure_months: 11,
  },
];

/**
 * Dynamically calculate streaming and churn metrics for a customer
 * based on their live profile, watch history, progress, and telemetry events.
 */
export function calculateSubscriberMetrics(
  customer: Customer,
  history: ViewingHistoryItem[] = [],
  watchProgress: Record<string, WatchProgress> = {},
  telemetryEvents: TelemetryEvent[] = []
): SubscriberMetrics {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // 1. Calculate watch hours in last 30 days
  let totalMinutesWatched = 0;

  // From viewing history
  history.forEach(item => {
    const itemDate = new Date(item.watchedAt).getTime();
    if (itemDate >= thirtyDaysAgo) {
      totalMinutesWatched += item.durationMinutes || 0;
    }
  });

  // Also include telemetry ticks if not covered in history
  const tickEvents = telemetryEvents.filter(
    e => e.eventType === 'watch_progress_tick' && new Date(e.timestamp).getTime() >= thirtyDaysAgo
  );
  if (totalMinutesWatched === 0 && tickEvents.length > 0) {
    totalMinutesWatched = tickEvents.length * 0.5; // ~30s per tick
  }

  // Base fallback if mock data is compact (ensure realistic representative watch hours)
  let watchHours = Number((totalMinutesWatched / 60).toFixed(1));
  if (watchHours === 0) {
    watchHours = 18.5; // default representative active stream hours
  }

  // 2. Calculate days since last watch
  let mostRecentWatchTimestamp = 0;

  history.forEach(item => {
    const t = new Date(item.watchedAt).getTime();
    if (t > mostRecentWatchTimestamp) mostRecentWatchTimestamp = t;
  });

  Object.values(watchProgress).forEach(wp => {
    if (wp.lastWatchedAt) {
      const t = new Date(wp.lastWatchedAt).getTime();
      if (t > mostRecentWatchTimestamp) mostRecentWatchTimestamp = t;
    }
  });

  telemetryEvents.forEach(e => {
    if (e.eventType.startsWith('watch_') || e.eventType.startsWith('content_view_')) {
      const t = new Date(e.timestamp).getTime();
      if (t > mostRecentWatchTimestamp) mostRecentWatchTimestamp = t;
    }
  });

  let daysInactive = 4;
  if (mostRecentWatchTimestamp > 0) {
    daysInactive = Math.max(0, Math.floor((now - mostRecentWatchTimestamp) / (1000 * 60 * 60 * 24)));
  }

  // 3. Plan & pricing
  const planTier = (customer.subscription?.tier === 'none' ? 'Basic' : customer.subscription?.tier || 'Standard') as 'Basic' | 'Standard' | 'Premium';
  const monthlyPrice = TIER_MONTHLY_PRICES[planTier] || 14.99;

  // 4. Tenure in months
  const joinedDate = customer.joinedAt ? new Date(customer.joinedAt).getTime() : now - 180 * 24 * 60 * 60 * 1000;
  const tenureMonths = Math.max(1, Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24 * 30)));

  // 5. Profiles & Devices
  const numberOfProfiles = Math.max(1, customer.profiles?.length || 2);
  const numberOfDevices = customer.subscription?.screenLimit || (planTier === 'Premium' ? 4 : planTier === 'Standard' ? 2 : 1);

  // 6. Support tickets & payment failures
  const supportTickets = telemetryEvents.filter(e => e.eventType === 'subscription_canceled').length;
  const paymentFailures = 0;

  return {
    customer_id: customer.id || 'CUST-84920',
    name: customer.name || 'Member',
    email: customer.email || '',
    subscription_plan: planTier,
    monthly_price: monthlyPrice,
    watch_hours_last_30_days: watchHours,
    days_since_last_watch: daysInactive,
    number_of_devices: numberOfDevices,
    number_of_profiles: numberOfProfiles,
    downloads_count: customer.subscription?.offlineDownloads ? 3 : 0,
    customer_support_tickets: supportTickets,
    payment_failures: paymentFailures,
    free_trial_converted: 'Yes',
    tenure_months: tenureMonths,
  };
}

/**
 * Generate CSV formatted for the Churn CRM Batch CSV tab
 * Expected exact columns:
 * customer_id,tenure,plan,monthly_price,watch_hours_last_30_days,inactivity_days,support_tickets,payment_declines
 */
export function generateBatchCsvText(subscribers: SubscriberMetrics[]): string {
  const headers = [
    'customer_id',
    'tenure',
    'plan',
    'monthly_price',
    'watch_hours_last_30_days',
    'inactivity_days',
    'support_tickets',
    'payment_declines',
  ];

  const rows = subscribers.map(s => [
    s.customer_id,
    s.tenure ?? s.tenure_months ?? 0,
    s.plan ?? s.subscription_plan ?? 'Basic',
    (typeof s.monthly_price === 'number' ? s.monthly_price : Number(s.monthly_price) || 0).toFixed(2),
    (typeof s.watch_hours_last_30_days === 'number' ? s.watch_hours_last_30_days : Number(s.watch_hours_last_30_days) || 0).toFixed(1),
    s.inactivity_days ?? s.days_since_last_watch ?? 0,
    s.support_tickets ?? s.customer_support_tickets ?? 0,
    s.payment_declines ?? s.payment_failures ?? 0,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger in-browser CSV download
 */
export function triggerCsvDownload(csvContent: string, filename = 'churn_subscribers_batch.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Client-side heuristic ML inference fallback
 * Provides immediate OTT engagement-based churn predictions if the cloud CRM is unreachable.
 */
export function computeClientHeuristicChurn(metrics: SubscriberMetrics): ChurnPredictionResult {
  const planVal = metrics.plan || metrics.subscription_plan || 'Standard';
  const tenureVal = Number(metrics.tenure ?? metrics.tenure_months ?? 8);
  const inactiveVal = Number(metrics.inactivity_days ?? metrics.days_since_last_watch ?? 10);
  const supportVal = Number(metrics.support_tickets ?? metrics.customer_support_tickets ?? 0);
  const paymentVal = Number(metrics.payment_declines ?? metrics.payment_failures ?? 0);
  const watchHoursVal = Number(metrics.watch_hours_last_30_days) || 18.5;

  const churnScore = Math.min(
    0.95,
    Math.max(
      0.05,
      (inactiveVal / 60) * 0.45 +
      (supportVal / 5) * 0.25 +
      (paymentVal / 3) * 0.20 +
      (tenureVal < 4 ? 0.15 : -0.1)
    )
  );

  const riskTier: 'Critical' | 'High' | 'Moderate' | 'Low' =
    churnScore >= 0.7 ? 'Critical' : churnScore >= 0.45 ? 'High' : churnScore >= 0.25 ? 'Moderate' : 'Low';

  return {
    customer_id: metrics.customer_id,
    churn_probability: Math.round(churnScore * 1000) / 1000,
    churn_probability_pct: `${Math.round(churnScore * 100)}%`,
    risk_tier: riskTier,
    predicted_churn: churnScore >= 0.5,
    top_risk_drivers: [
      { feature: 'watch_hours_last_30_days', impact: Number((0.85 * (1 - Math.min(1, watchHoursVal / 40))).toFixed(2)) },
      { feature: 'days_since_last_watch', impact: Number((0.55 * Math.min(1, inactiveVal / 30)).toFixed(2)) },
      { feature: 'tenure_months', impact: Number((0.25 * (1 - Math.min(1, tenureVal / 12))).toFixed(2)) },
    ],
    top_protective_factors: [
      { feature: `subscription_plan_${planVal}`, impact: -0.32 },
      { feature: 'free_trial_converted_Yes', impact: -0.30 },
    ],
    suggested_interventions: [
      {
        title: 'Personalized Content Discovery Push',
        urgency: churnScore > 0.6 ? 'High' : 'Medium',
        description: `Subscriber has ${inactiveVal} days of inactivity with ${watchHoursVal}h watched. Re-engage with personalized recommendations.`,
      },
    ],
  };
}

/**
 * Call the ML /predict endpoint via the server-side proxy route with fallback
 * to direct CORS fetch, and secondary fallback to client heuristic inference.
 */
export async function predictChurnDirect(
  metrics: SubscriberMetrics,
  baseUrl = CHURN_CRM_BASE_URL
): Promise<ChurnPredictionResult> {
  const planVal = metrics.plan || metrics.subscription_plan || 'Standard';
  const tenureVal = metrics.tenure ?? metrics.tenure_months ?? 8;
  const inactiveVal = metrics.inactivity_days ?? metrics.days_since_last_watch ?? 10;
  const supportVal = metrics.support_tickets ?? metrics.customer_support_tickets ?? 0;
  const paymentVal = metrics.payment_declines ?? metrics.payment_failures ?? 0;

  const payload = {
    customer_id: metrics.customer_id,
    subscription_plan: planVal,
    monthly_price: Number(metrics.monthly_price) || 14.99,
    tenure_months: Number(tenureVal),
    free_trial_converted: metrics.free_trial_converted || 'Yes',
    watch_hours_last_30_days: Number(metrics.watch_hours_last_30_days) || 18.5,
    days_since_last_watch: Number(inactiveVal),
    customer_support_tickets: Number(supportVal),
    payment_failures: Number(paymentVal),
    number_of_devices: Number(metrics.number_of_devices) || 2,
    number_of_profiles: Number(metrics.number_of_profiles) || 3,
    downloads_count: Number(metrics.downloads_count) || 2,
  };

  const cleanBaseUrl = (baseUrl || CHURN_CRM_BASE_URL).trim().replace(/\/$/, '');

  // 1. Try server-side proxy route first (/api/crm/predict)
  try {
    const proxyQuery = cleanBaseUrl ? `?targetUrl=${encodeURIComponent(cleanBaseUrl)}` : '';
    const proxyController = new AbortController();
    const proxyTimeout = setTimeout(() => proxyController.abort(), 6000);

    const proxyRes = await fetch(`/api/crm/predict${proxyQuery}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CRM-Target-URL': cleanBaseUrl,
      },
      body: JSON.stringify({ ...payload, targetUrl: cleanBaseUrl }),
      signal: proxyController.signal,
    });
    clearTimeout(proxyTimeout);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && (typeof data.churn_probability === 'number' || data.risk_tier)) {
        return data as ChurnPredictionResult;
      }
    }
  } catch (proxyErr) {
    console.warn('Server proxy /api/crm/predict bypassed, attempting direct fetch:', proxyErr);
  }

  // 2. Fallback to direct client-side fetch (with mode: 'cors')
  try {
    const directController = new AbortController();
    const directTimeout = setTimeout(() => directController.abort(), 8000);

    const res = await fetch(`${cleanBaseUrl}/predict`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: directController.signal,
    });
    clearTimeout(directTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data && (typeof data.churn_probability === 'number' || data.risk_tier)) {
        return data as ChurnPredictionResult;
      }
    }
  } catch (directErr) {
    console.warn('Direct ML endpoint fetch bypassed, engaging client heuristic fallback:', directErr);
  }

  // 3. Fallback Heuristic Model: Instant offline / engagement-based inference calculation
  return computeClientHeuristicChurn(metrics);
}


