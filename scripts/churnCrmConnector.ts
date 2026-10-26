/**
 * StreamNest -> ChurnIQ CRM Connector Script & API Helper
 *
 * Connects StreamNest OTT streaming watch events, subscriber plans, and inactivity metrics
 * directly to the Churn CRM dashboard at https://behaviour-pridection-intervention.vercel.app/
 * and generates the exact matching CSV for the "Batch CSV Scoring" tab.
 *
 * CSV Columns expected by ChurnIQ:
 *   customer_id, tenure, plan, monthly_price, watch_hours_last_30_days, inactivity_days, support_tickets, payment_declines
 *
 * Usage:
 *   npx tsx scripts/churnCrmConnector.ts --csv     # Generate churn_subscribers_batch.csv
 *   npx tsx scripts/churnCrmConnector.ts --sync    # Live score subscribers against ML API
 *   npx tsx scripts/churnCrmConnector.ts --all     # Both generate CSV and score live
 */

import fs from 'fs';
import path from 'path';

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
  // Full OTT metadata & backward-compatibility aliases
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

/**
 * Standard pricing conversion for StreamNest OTT plans
 */
export const PLAN_PRICING: Record<'Basic' | 'Standard' | 'Premium', number> = {
  Basic: 8.99,
  Standard: 14.99,
  Premium: 20.99,
};

/**
 * Default cohort of subscribers mapped from StreamNest OTT application data
 * Includes exact lowercase ChurnIQ columns:
 * customer_id, tenure, plan, monthly_price, watch_hours_last_30_days, inactivity_days, support_tickets, payment_declines
 */
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

/**
 * Generate CSV formatted specifically for ChurnIQ's Batch CSV Scoring tab.
 * Exact expected lowercase columns:
 * customer_id,tenure,plan,monthly_price,watch_hours_last_30_days,inactivity_days,support_tickets,payment_declines
 */
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

/**
 * Export CSV to local filesystem
 */
export function writeChurnCsvFile(
  filePath: string = path.resolve(process.cwd(), 'churn_subscribers_batch.csv'),
  subscribers: SubscriberMetrics[] = STREAMNEST_SUBSCRIBERS
): string {
  const csvContent = generateChurnCsvString(subscribers);
  fs.writeFileSync(filePath, csvContent, 'utf-8');
  return filePath;
}

/**
 * Call the live ChurnIQ ML inference endpoint directly for a subscriber
 */
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

  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Churn CRM API returned HTTP ${response.status}: ${errorText}`);
      }

      return (await response.json()) as ChurnPredictionResult;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Inference request failed after retries');
}

/**
 * Log a retention intervention play directly to the Churn CRM Interventions Hub
 */
export async function logInterventionLive(
  customerId: string,
  actionType: string,
  details: string,
  channel: 'in_app' | 'email' | 'phone' | 'sms' = 'in_app',
  baseUrl: string = CHURN_CRM_BASE_URL
) {
  const payload = {
    customer_id: customerId,
    action_type: actionType,
    details,
    channel,
    status: 'Sent',
    notes: 'Triggered from StreamNest automated telemetry connector',
  };

  const response = await fetch(`${baseUrl}/interventions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to log intervention HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Score all subscribers in batch against the live ChurnIQ ML API
 */
export async function syncAllSubscribersLive(
  subscribers: SubscriberMetrics[] = STREAMNEST_SUBSCRIBERS,
  autoIntervene: boolean = true
): Promise<Array<{ subscriber: SubscriberMetrics; result: ChurnPredictionResult }>> {
  const outcomes: Array<{ subscriber: SubscriberMetrics; result: ChurnPredictionResult }> = [];

  console.log(`\n🔗 Connecting to Churn CRM: ${CHURN_CRM_BASE_URL}`);
  console.log(`📊 Processing ${subscribers.length} StreamNest subscribers through ML inference pipeline...\n`);

  for (const sub of subscribers) {
    try {
      const result = await scoreSubscriberLive(sub);
      outcomes.push({ subscriber: sub, result });

      const tierBadge =
        result.risk_tier === 'Critical'
          ? '🔴 CRITICAL'
          : result.risk_tier === 'High'
          ? '🟠 HIGH'
          : result.risk_tier === 'Moderate'
          ? '🔵 MODERATE'
          : '🟢 LOW';

      console.log(
        `[${sub.customer_id}] ${(sub.name || 'Member').padEnd(16)} | Plan: ${sub.plan.padEnd(8)} | Watch: ${sub.watch_hours_last_30_days.toFixed(1)}h | Inactive: ${sub.inactivity_days}d -> ${tierBadge} (${result.churn_probability_pct})`
      );

      // Auto-trigger retention playbook for Critical accounts
      if (autoIntervene && (result.risk_tier === 'Critical' || result.risk_tier === 'High')) {
        try {
          const action = result.risk_tier === 'Critical' ? 'pause_subscription_offer' : 'personalized_content_discovery';
          const msg =
            result.risk_tier === 'Critical'
              ? `High churn risk detected (${result.churn_probability_pct}). 1-month pause retention offer activated.`
              : `Viewing inactivity detected (${sub.inactivity_days} days). Tailored watchlist notification queued.`;

          await logInterventionLive(sub.customer_id, action, msg);
          console.log(`   ✨ Auto-Intervention logged: ${action}`);
        } catch (intErr: any) {
          console.warn(`   ⚠️ (Intervention note: ${intErr.message})`);
        }
      }
    } catch (err: any) {
      console.error(`❌ Error scoring subscriber ${sub.customer_id}:`, err.message);
    }

    // Gentle pacing between calls to respect network and free-tier serverless functions
    await new Promise(resolve => setTimeout(resolve, 350));
  }

  return outcomes;
}

// CLI Execution entrypoint
async function runCli() {
  const args = process.argv.slice(2);
  const doCsv = args.includes('--csv') || args.includes('--all') || args.length === 0;
  const doSync = args.includes('--sync') || args.includes('--all');

  console.log('================================================================');
  console.log('       StreamNest OTT -> ChurnIQ Analytics Connector            ');
  console.log('================================================================');

  if (doCsv) {
    const csvPath = path.resolve(process.cwd(), 'churn_subscribers_batch.csv');
    writeChurnCsvFile(csvPath);
    console.log(`\n✅ Generated Batch CSV file successfully!`);
    console.log(`📁 File location: ${csvPath}`);
    console.log(`📋 Rows generated: ${STREAMNEST_SUBSCRIBERS.length} subscribers`);
    console.log(`🏷️  Columns: customer_id, tenure, plan, monthly_price, watch_hours_last_30_days, inactivity_days, support_tickets, payment_declines`);
    console.log(`💡 You can now upload this directly into the "Batch CSV Scoring" tab at:`);
    console.log(`   ${CHURN_CRM_BASE_URL}#batch\n`);
  }

  if (doSync) {
    const results = await syncAllSubscribersLive();
    const criticals = results.filter(r => r.result.risk_tier === 'Critical').length;
    const highs = results.filter(r => r.result.risk_tier === 'High').length;
    const moderates = results.filter(r => r.result.risk_tier === 'Moderate').length;
    const lows = results.filter(r => r.result.risk_tier === 'Low').length;

    console.log('\n----------------- Ingest Summary -----------------');
    console.log(`Total Evaluated : ${results.length}`);
    console.log(`🔴 Critical Risk : ${criticals}`);
    console.log(`🟠 High Risk     : ${highs}`);
    console.log(`🔵 Moderate Risk : ${moderates}`);
    console.log(`🟢 Low Risk      : ${lows}`);
    console.log('--------------------------------------------------\n');
  }

  if (!doSync && !args.includes('--all')) {
    console.log('Tip: Run with --sync to score live against the ML model:');
    console.log('  npx tsx scripts/churnCrmConnector.ts --sync');
  }
}

// Run if directly executed
if (process.argv[1]?.includes('churnCrmConnector')) {
  runCli().catch(err => {
    console.error('Connector failed:', err);
    process.exit(1);
  });
}
