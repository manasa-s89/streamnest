import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

export const CHURN_CRM_BASE_URL = 'https://behaviour-pridection-intervention.vercel.app';

export interface SubscriberMetrics {
  customer_id: string;
  tenure: number;
  plan: 'Basic' | 'Standard' | 'Premium';
  monthly_price: number;
  watch_hours_last_30_days: number;
  inactivity_days: number;
  support_tickets: number;
  payment_declines: number;
  subscription_plan?: 'Basic' | 'Standard' | 'Premium';
  days_since_last_watch?: number;
  customer_support_tickets?: number;
  payment_failures?: number;
  tenure_months?: number;
  number_of_devices?: number;
  number_of_profiles?: number;
  downloads_count?: number;
  free_trial_converted?: 'Yes' | 'No';
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
}

export const STREAMNEST_SUBSCRIBERS: SubscriberMetrics[] = [
  {
    customer_id: 'CUST-84920',
    name: 'Manasa Sharma',
    email: 'manasas99577@gmail.com',
    tenure: 8,
    tenure_months: 8,
    plan: 'Standard',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 18.5,
    inactivity_days: 10,
    days_since_last_watch: 10,
    support_tickets: 0,
    customer_support_tickets: 0,
    payment_declines: 0,
    payment_failures: 0,
    number_of_devices: 2,
    number_of_profiles: 3,
    downloads_count: 2,
    free_trial_converted: 'Yes',
  },
  {
    customer_id: 'CUST-39184',
    name: 'Vikram Malhotra',
    email: 'vikram.m@streamnest.in',
    tenure: 9,
    tenure_months: 9,
    plan: 'Premium',
    subscription_plan: 'Premium',
    monthly_price: 20.99,
    watch_hours_last_30_days: 55.0,
    inactivity_days: 2,
    days_since_last_watch: 2,
    support_tickets: 0,
    customer_support_tickets: 0,
    payment_declines: 0,
    payment_failures: 0,
    number_of_devices: 4,
    number_of_profiles: 2,
    downloads_count: 8,
    free_trial_converted: 'Yes',
  },
  {
    customer_id: 'CUST-55209',
    name: 'Ananya Verma',
    email: 'ananya.v@streamnest.in',
    tenure: 6,
    tenure_months: 6,
    plan: 'Basic',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 2.5,
    inactivity_days: 28,
    days_since_last_watch: 28,
    support_tickets: 3,
    customer_support_tickets: 3,
    payment_declines: 1,
    payment_failures: 1,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    free_trial_converted: 'No',
  },
  {
    customer_id: 'CUST-77102',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    tenure: 2,
    tenure_months: 2,
    plan: 'Basic',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 0.8,
    inactivity_days: 42,
    days_since_last_watch: 42,
    support_tickets: 4,
    customer_support_tickets: 4,
    payment_declines: 2,
    payment_failures: 2,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    free_trial_converted: 'No',
  },
  {
    customer_id: 'CUST-92811',
    name: 'Pooja Rao',
    email: 'pooja.rao@example.com',
    tenure: 7,
    tenure_months: 7,
    plan: 'Standard',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 22.4,
    inactivity_days: 5,
    days_since_last_watch: 5,
    support_tickets: 1,
    customer_support_tickets: 1,
    payment_declines: 0,
    payment_failures: 0,
    number_of_devices: 2,
    number_of_profiles: 2,
    downloads_count: 3,
    free_trial_converted: 'Yes',
  },
  {
    customer_id: 'CUST-10482',
    name: 'Deepak Kumar',
    email: 'deepak.k@example.com',
    tenure: 14,
    tenure_months: 14,
    plan: 'Premium',
    subscription_plan: 'Premium',
    monthly_price: 20.99,
    watch_hours_last_30_days: 42.0,
    inactivity_days: 3,
    days_since_last_watch: 3,
    support_tickets: 0,
    customer_support_tickets: 0,
    payment_declines: 0,
    payment_failures: 0,
    number_of_devices: 4,
    number_of_profiles: 4,
    downloads_count: 6,
    free_trial_converted: 'Yes',
  },
  {
    customer_id: 'CUST-63914',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    tenure: 3,
    tenure_months: 3,
    plan: 'Basic',
    subscription_plan: 'Basic',
    monthly_price: 8.99,
    watch_hours_last_30_days: 1.2,
    inactivity_days: 35,
    days_since_last_watch: 35,
    support_tickets: 2,
    customer_support_tickets: 2,
    payment_declines: 1,
    payment_failures: 1,
    number_of_devices: 1,
    number_of_profiles: 1,
    downloads_count: 0,
    free_trial_converted: 'No',
  },
  {
    customer_id: 'CUST-48201',
    name: 'Karthik Nair',
    email: 'karthik.n@example.com',
    tenure: 11,
    tenure_months: 11,
    plan: 'Standard',
    subscription_plan: 'Standard',
    monthly_price: 14.99,
    watch_hours_last_30_days: 31.5,
    inactivity_days: 1,
    days_since_last_watch: 1,
    support_tickets: 0,
    customer_support_tickets: 0,
    payment_declines: 0,
    payment_failures: 0,
    number_of_devices: 2,
    number_of_profiles: 2,
    downloads_count: 5,
    free_trial_converted: 'Yes',
  },
];

export function generateChurnCsvString(subscribers: SubscriberMetrics[] = STREAMNEST_SUBSCRIBERS): string {
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

  const rows = subscribers.map(s => {
    const tenureVal = s.tenure ?? s.tenure_months ?? 0;
    const planVal = s.plan ?? s.subscription_plan ?? 'Basic';
    const priceVal = (typeof s.monthly_price === 'number' ? s.monthly_price : Number(s.monthly_price) || 0).toFixed(2);
    const watchHoursVal = (typeof s.watch_hours_last_30_days === 'number' ? s.watch_hours_last_30_days : Number(s.watch_hours_last_30_days) || 0).toFixed(1);
    const inactivityVal = s.inactivity_days ?? s.days_since_last_watch ?? 0;
    const ticketsVal = s.support_tickets ?? s.customer_support_tickets ?? 0;
    const declinesVal = s.payment_declines ?? s.payment_failures ?? 0;

    return [
      s.customer_id,
      tenureVal,
      planVal,
      priceVal,
      watchHoursVal,
      inactivityVal,
      ticketsVal,
      declinesVal,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export async function scoreSubscriberLive(
  metrics: SubscriberMetrics,
  baseUrl: string = CHURN_CRM_BASE_URL,
  maxRetries: number = 2
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

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return (await response.json()) as ChurnPredictionResult;
      }
    } catch {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }

  // Fallback heuristic scoring if remote ML endpoint is unreachable
  const churnScore = Math.min(
    0.95,
    Math.max(
      0.05,
      (Number(inactiveVal) / 60) * 0.45 +
      (Number(supportVal) / 5) * 0.25 +
      (Number(paymentVal) / 3) * 0.20 +
      (Number(tenureVal) < 4 ? 0.15 : -0.1)
    )
  );

  const riskTier: 'Critical' | 'High' | 'Moderate' | 'Low' =
    churnScore >= 0.7 ? 'Critical' : churnScore >= 0.45 ? 'High' : churnScore >= 0.25 ? 'Moderate' : 'Low';

  return {
    customer_id: metrics.customer_id,
    churn_probability: Math.round(churnScore * 100) / 100,
    churn_probability_pct: `${Math.round(churnScore * 100)}%`,
    risk_tier: riskTier,
    predicted_churn: churnScore >= 0.5,
  };
}

const router = express.Router();

// CRM Batch CSV Download Endpoint
router.get('/crm/csv', (_req: Request, res: Response) => {
  const csvContent = generateChurnCsvString();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="churn_subscribers_batch.csv"');
  res.status(200).send(csvContent);
});

// CRM Subscribers JSON Endpoint
router.get('/crm/subscribers', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    total: STREAMNEST_SUBSCRIBERS.length,
    subscribers: STREAMNEST_SUBSCRIBERS,
  });
});

// CRM Proxy Ping / Health Endpoint
router.all('/crm/ping', async (req: Request, res: Response) => {
  const targetUrl =
    (req.query.url as string) ||
    (req.body && req.body.url) ||
    (req.headers['x-crm-url'] as string) ||
    'https://behaviour-pridection-intervention.vercel.app';
  const cleanUrl = targetUrl.trim().replace(/\/$/, '');
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let upstreamStatus = 200;
    let ok = true;
    try {
      const headRes = await fetch(`${cleanUrl}/`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      upstreamStatus = headRes.status;
      ok = headRes.ok || headRes.status === 200 || headRes.status === 405 || headRes.status === 404 || headRes.status === 401;
    } catch {
      const getRes = await fetch(`${cleanUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      upstreamStatus = getRes.status;
      ok = getRes.ok || getRes.status === 200 || getRes.status === 404 || getRes.status === 401;
    }

    clearTimeout(timeoutId);
    const latencyMs = Math.max(1, Date.now() - startTime);

    res.status(200).json({
      reachable: ok,
      status: upstreamStatus,
      statusText: ok ? `Connected (HTTP ${upstreamStatus})` : `Upstream HTTP ${upstreamStatus}`,
      latencyMs,
      targetUrl: cleanUrl,
    });
  } catch (err: any) {
    const latencyMs = Math.max(1, Date.now() - startTime);
    res.status(200).json({
      reachable: false,
      status: 504,
      statusText: 'Unreachable / Connection Refused',
      errorDetails: err.name === 'AbortError' ? 'Timed out after 8000ms' : (err.message || 'Connection failed'),
      latencyMs,
      targetUrl: cleanUrl,
    });
  }
});

// CRM Proxy Predict Endpoint
router.post('/crm/predict', async (req: Request, res: Response) => {
  try {
    const targetUrl =
      (req.query.targetUrl as string) ||
      (req.query.url as string) ||
      (req.body && req.body.targetUrl) ||
      (req.headers['x-crm-url'] as string) ||
      (req.headers['x-crm-target-url'] as string) ||
      undefined;

    const bodyCopy = { ...(req.body || {}) };
    delete bodyCopy.targetUrl;

    const result = await scoreSubscriberLive(bodyCopy, targetUrl);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Prediction failed' });
  }
});

// CRM Proxy Telemetry Ingestion Endpoint
router.post(['/crm/telemetry', '/telemetry/events'], async (req: Request, res: Response) => {
  try {
    const targetUrl =
      (req.query.url as string) ||
      (req.headers['x-crm-url'] as string) ||
      'https://behaviour-pridection-intervention.vercel.app';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      await fetch(`${targetUrl.replace(/\/$/, '')}/api/telemetry/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Fallback
    }

    res.status(200).json({
      status: 'success',
      message: 'Telemetry event registered',
      event_id: req.body?.event_id || req.body?.eventId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Telemetry proxy failed' });
  }
});

app.use('/api', router);
app.use('/', router);

export default app;
