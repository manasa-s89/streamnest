import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { TelemetryEvent } from '../types/user.ts';
import { crmTelemetry, DEFAULT_CRM_ENDPOINT } from '../services/crmTelemetry.ts';
import {
  calculateSubscriberMetrics,
  predictChurnDirect,
  generateBatchCsvText,
  triggerCsvDownload,
  CHURN_CRM_BASE_URL,
  STREAMNEST_SUBSCRIBERS,
  ChurnPredictionResult,
} from '../services/churnCrmConnector.ts';
import { INITIAL_CUSTOMER, INITIAL_HISTORY, INITIAL_WATCH_PROGRESS } from '../data/mockUser.ts';

interface CrmIntegrationDrawerProps {
  onClose: () => void;
  customerId: string;
}

export const CrmIntegrationDrawer: React.FC<CrmIntegrationDrawerProps> = ({
  onClose,
  customerId,
}) => {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [crmUrl, setCrmUrl] = useState<string>(() => crmTelemetry.getCrmEndpoint());
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    reachable: boolean;
    statusText: string;
    errorDetails?: string;
    latencyMs?: number;
  }>({
    tested: false,
    reachable: false,
    statusText: 'Not tested yet',
  });
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'churniq' | 'stream' | 'contract' | 'flask_code'>('churniq');
  const [isScoring, setIsScoring] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<ChurnPredictionResult | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [csvDownloaded, setCsvDownloaded] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch of recorded events
    setEvents(crmTelemetry.getStoredEvents());

    // Subscribe to live telemetry emission updates
    const unsubscribe = crmTelemetry.subscribe((allEvents: TelemetryEvent[]) => {
      setEvents([...allEvents]);
    });

    return () => unsubscribe();
  }, []);

  const handleTestPing = async () => {
    setIsTesting(true);
    const result = await crmTelemetry.testConnection(crmUrl);
    setConnectionStatus({
      tested: true,
      reachable: result.reachable,
      statusText: result.statusText,
      errorDetails: result.errorDetails,
      latencyMs: result.latencyMs,
    });
    setIsTesting(false);
  };

  const handleSaveUrl = () => {
    crmTelemetry.setCrmEndpoint(crmUrl);
    handleTestPing();
  };

  const handleRetryPending = async () => {
    setIsRetrying(true);
    await crmTelemetry.flushPendingEvents();
    setEvents(crmTelemetry.getStoredEvents());
    setIsRetrying(false);
  };

  const handleClearEvents = () => {
    crmTelemetry.clearEvents();
    setEvents([]);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const liveMetrics = calculateSubscriberMetrics(
    INITIAL_CUSTOMER,
    INITIAL_HISTORY,
    INITIAL_WATCH_PROGRESS,
    events
  );

  const handleScoreLive = async () => {
    setIsScoring(true);
    setScoringError(null);
    try {
      const res = await predictChurnDirect(liveMetrics, crmUrl);
      setPredictionResult(res);
    } catch (err: any) {
      let message = 'Failed to score churn prediction';
      if (typeof err === 'string') {
        message = err;
      } else if (err?.message && typeof err.message === 'string' && err.message !== '[object Object]') {
        message = err.message;
      } else if (typeof err?.error === 'string') {
        message = err.error;
      } else if (typeof err?.error?.message === 'string') {
        message = err.error.message;
      } else if (err?.message && typeof err.message === 'object') {
        message = err.message.message || JSON.stringify(err.message);
      }
      setScoringError(message);
    } finally {
      setIsScoring(false);
    }
  };

  const handleDownloadBatchCsv = () => {
    const csv = generateBatchCsvText(STREAMNEST_SUBSCRIBERS);
    triggerCsvDownload(csv, 'churn_subscribers_batch.csv');
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3000);
  };

  const pythonFlaskSnippet = `# StreamNest CRM Telemetry Receiver - Flask Backend
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for http://127.0.0.1:8000

@app.route('/api/telemetry/events', methods=['POST'])
def receive_telemetry():
    data = request.json
    customer_id = data.get('customer_id')
    event_type = data.get('event_type')
    payload = data.get('payload', {})
    
    # Ingest event directly into your existing CRM database / ML feature pipeline:
    print(f"[{datetime.now().isoformat()}] CRM Event: {event_type} for customer {customer_id}")
    
    # Return 200 OK to OTT website
    return jsonify({
        "status": "success",
        "message": f"Event {event_type} registered in CRM",
        "customer_id": customer_id
    }), 200

@app.route('/health', methods=['GET'])
@app.route('/', methods=['GET'])
def health():
    return jsonify({
        "service": "StreamNest CRM Antigravity Backend",
        "status": "online",
        "version": "1.0.0"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  CRM & Antigravity Telemetry Bridge
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Unified persistent event pipeline linked to customer_id:{' '}
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{customerId}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CRM Endpoint & Honest Live Ping Diagnostic */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Target CRM Backend URL
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                {connectionStatus.tested ? (
                  connectionStatus.reachable ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-mono font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected ({connectionStatus.latencyMs}ms)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-mono font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Not Connected / Awaiting Server</span>
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 font-mono">Unchecked</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={crmUrl}
                onChange={e => setCrmUrl(e.target.value)}
                placeholder="https://behaviour-pridection-intervention.vercel.app"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestPing}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>

            {/* Diagnostic Message */}
            {connectionStatus.tested && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed border ${
                  connectionStatus.reachable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <p className="font-semibold">{connectionStatus.statusText}</p>
                {connectionStatus.errorDetails && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    {connectionStatus.errorDetails}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('churniq')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'churniq'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ChurnIQ ML & CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Telemetry ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              API Spec
            </button>
            <button
              onClick={() => setActiveTab('flask_code')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'flask_code'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python / Flask
            </button>
          </div>

          {/* TAB 0: ChurnIQ ML & CSV Scoring Bridge */}
          {activeTab === 'churniq' && (
            <div className="space-y-4 text-xs">
              {/* Subscriber Live Telemetry Metrics Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-sm tracking-wide text-white">
                      Live Streaming Metrics ({liveMetrics.customer_id})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    {liveMetrics.subscription_plan} Plan (${liveMetrics.monthly_price}/mo)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Watch Hours (30d)</span>
                    <span className="text-base font-extrabold text-white font-mono">{liveMetrics.watch_hours_last_30_days}h</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Inactivity</span>
                    <span className="text-base font-extrabold text-amber-300 font-mono">{liveMetrics.days_since_last_watch}d ago</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Tenure</span>
                    <span className="text-base font-extrabold text-emerald-300 font-mono">{liveMetrics.tenure_months} mos</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Profiles / Devices</span>
                    <span className="text-base font-extrabold text-white font-mono">{liveMetrics.number_of_profiles} / {liveMetrics.number_of_devices}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleScoreLive}
                    disabled={isScoring}
                    className="flex-1 min-w-[170px] px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isScoring ? 'animate-spin' : ''}`} />
                    <span>{isScoring ? 'Inference Running...' : 'Score Churn Risk (Direct API)'}</span>
                  </button>

                  <button
                    onClick={handleDownloadBatchCsv}
                    className="flex-1 min-w-[170px] px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{csvDownloaded ? 'Downloaded CSV!' : 'Download Batch CSV'}</span>
                  </button>

                  <a
                    href="https://behaviour-pridection-intervention.vercel.app/#batch"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                    title="Open Churn CRM Batch CSV Scoring tab"
                  >
                    <span>Open CRM</span>
                    <ExternalLink className="w-3 h-3 text-slate-300" />
                  </a>
                </div>
              </div>

              {/* Scoring Error Alert */}
              {scoringError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Prediction Request Failed: </span>
                    <span>{scoringError}</span>
                  </div>
                </div>
              )}

              {/* Live ML Prediction Output */}
              {predictionResult && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-xs">ML Inference Prediction Result:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        predictionResult.risk_tier === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : predictionResult.risk_tier === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : predictionResult.risk_tier === 'Moderate'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {predictionResult.risk_tier} Risk
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center p-3 rounded-xl bg-white border border-slate-200 min-w-[90px]">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Probability</span>
                      <span className="text-xl font-extrabold text-purple-700 font-mono">
                        {predictionResult.churn_probability_pct}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Predicted Churn Status</span>
                        <span>{predictionResult.predicted_churn ? 'Likely to Cancel' : 'Likely Retained'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            predictionResult.churn_probability > 0.6
                              ? 'bg-rose-500'
                              : predictionResult.churn_probability > 0.3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(predictionResult.churn_probability * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Evaluated via Logistic Regression model trained on OTT streaming engagement.
                      </span>
                    </div>
                  </div>

                  {/* SHAP Risk Drivers */}
                  {predictionResult.top_risk_drivers && predictionResult.top_risk_drivers.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Top Contributing Risk Factors (SHAP):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {predictionResult.top_risk_drivers.slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px]"
                          >
                            + {r.feature.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Batch CSV Information Guide */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Batch CSV Scoring Instructions</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The generated CSV file (<code className="text-emerald-800 font-mono font-bold bg-white px-1 py-0.5 rounded border border-slate-200">churn_subscribers_batch.csv</code>) contains 8 full subscriber records formatted with the exact 8 columns required by ChurnIQ:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[10px] overflow-x-auto">
                  customer_id,tenure,plan,monthly_price,watch_hours_last_30_days,inactivity_days,support_tickets,payment_declines
                </div>
                <p className="text-[11px] text-slate-500">
                  Click <strong>Download Batch CSV</strong> above or run <code className="bg-slate-200 px-1 rounded font-mono text-slate-800">npm run crm:csv</code> in your terminal, then drag the file into your dashboard at <a href="https://behaviour-pridection-intervention.vercel.app/" target="_blank" rel="noreferrer" className="text-purple-600 underline font-semibold">https://behaviour-pridection-intervention.vercel.app/</a>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: Live Event Stream */}
          {activeTab === 'stream' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Recorded in persistent store: <strong className="text-slate-900">{events.length} events</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryPending}
                    disabled={isRetrying}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1 cursor-pointer font-medium border border-slate-200"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>Flush Pending</span>
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy className="w-3 h-3 text-amber-700" />
                    <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleClearEvents}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Clear Buffer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No telemetry events yet. Watch a movie, change a subscription plan, or add items to your watchlist!
                  </div>
                ) : (
                  events.map(evt => {
                    const isExpanded = expandedEventId === evt.eventId;
                    return (
                      <div
                        key={evt.eventId}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all text-xs"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.eventId)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                                evt.eventType.includes('subscription')
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : evt.eventType.includes('watch')
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {evt.eventType}
                            </span>
                            <span className="font-mono text-slate-600 text-[11px]">
                              {evt.customerId}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                evt.dispatchedToCrm
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {evt.dispatchedToCrm ? 'Dispatched' : 'Buffered Local'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Payload view */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200">
                            <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-amber-300 overflow-x-auto shadow-inner">
                              {JSON.stringify(evt.payload, null, 2)}
                            </pre>
                            {evt.dispatchError && (
                              <p className="text-[10px] text-amber-700 font-medium mt-1">
                                Notice: {evt.dispatchError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: API Contract */}
          {activeTab === 'contract' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-bold text-slate-900 mb-1">CRM Antigravity Connection Architecture</h4>
                <p className="text-slate-600 text-[11px]">
                  StreamNest OTT acts as the event publisher. All real user activities are buffered locally in localStorage and automatically forwarded via HTTP POST to your Python/Flask backend at <code className="text-emerald-800 font-mono font-bold bg-white px-1 py-0.5 rounded border border-emerald-200">{crmUrl}</code>.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1 font-mono">Endpoint: POST /api/telemetry/events</h5>
                <p className="text-[11px] text-slate-500 mb-2">
                  Called automatically whenever a user registers, logs in, plays content, reaches milestones, changes subscriptions, renews, or cancels.
                </p>
                <pre className="p-3.5 rounded-xl bg-slate-900 font-mono text-[11px] text-emerald-300 border border-slate-800 shadow-inner">
{`{
  "event_id": "EVT-1718000000000-8491",
  "event_type": "subscription_changed",
  "customer_id": "CUST-84920",
  "timestamp": "2026-10-16T12:00:00.000Z",
  "payload": {
    "old_tier": "Basic",
    "new_tier": "Premium",
    "amount_inr": 299,
    "payment_method": "upi"
  }
}`}
                </pre>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1 font-mono">Customer ID Unified Linkage</h5>
                <p className="text-[11px] text-slate-600">
                  Every single event has a mandatory <code className="text-emerald-800 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">customer_id</code>. Your CRM dashboard in Antigravity can query records by customer ID to calculate engagement, watch duration, and churn risk in your ML model without creating duplicate dashboards.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Python/Flask Code */}
          {activeTab === 'flask_code' && (
            <div className="space-y-3 text-xs max-h-[50vh] overflow-y-auto pr-1">
              <p className="text-slate-600 text-[11px]">
                Copy and run this minimal Flask endpoint in your Antigravity project environment to receive all events from this OTT frontend:
              </p>
              <div className="relative">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pythonFlaskSnippet);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy Python'}</span>
                </button>
                <pre className="p-4 rounded-xl bg-slate-900 font-mono text-[11px] text-slate-200 border border-slate-800 overflow-x-auto leading-relaxed pt-10 shadow-inner">
                  {pythonFlaskSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer status */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>StreamNest Telemetry v1.0</span>
          <span className="font-mono text-[11px] text-emerald-800 font-semibold">
            Storage: IndexedDB/LocalStorage
          </span>
        </div>
      </div>
    </div>
  );
};
