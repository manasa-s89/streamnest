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
} from 'lucide-react';
import { TelemetryEvent } from '../types/user.ts';
import { crmTelemetry, DEFAULT_CRM_ENDPOINT } from '../services/crmTelemetry.ts';

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
  const [activeTab, setActiveTab] = useState<'stream' | 'contract' | 'flask_code'>('stream');

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
                      <span>Online ({connectionStatus.latencyMs}ms)</span>
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
                placeholder="http://127.0.0.1:8000"
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
                    {connectionStatus.errorDetails}. Events are being safely persisted to the local database buffer and will flush when your Flask backend starts!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Telemetry Stream ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              API Spec & Integration
            </button>
            <button
              onClick={() => setActiveTab('flask_code')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'flask_code'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python / Flask Code
            </button>
          </div>

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
