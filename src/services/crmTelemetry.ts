import { TelemetryEvent, TelemetryEventType } from '../types/user';

const STORAGE_KEY = 'streamnest_telemetry_events_v1';
const CRM_ENDPOINT_KEY = 'streamnest_crm_endpoint_url';

export const DEFAULT_CRM_ENDPOINT = 'http://127.0.0.1:8000';

class CrmTelemetryService {
  private crmEndpoint: string;
  private listeners: Array<(events: TelemetryEvent[]) => void> = [];

  constructor() {
    this.crmEndpoint = localStorage.getItem(CRM_ENDPOINT_KEY) || DEFAULT_CRM_ENDPOINT;
  }

  public getCrmEndpoint(): string {
    return this.crmEndpoint;
  }

  public setCrmEndpoint(url: string) {
    this.crmEndpoint = url.trim().replace(/\/$/, '');
    localStorage.setItem(CRM_ENDPOINT_KEY, this.crmEndpoint);
    this.notify();
  }

  public subscribe(listener: (events: TelemetryEvent[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const current = this.getStoredEvents();
    this.listeners.forEach(l => l(current));
  }

  public getStoredEvents(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveEvents(events: TelemetryEvent[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      this.notify();
    } catch (e) {
      console.error('Failed to persist telemetry events', e);
    }
  }

  public async recordEvent(
    eventType: TelemetryEventType,
    customerId: string,
    payload: Record<string, any>
  ): Promise<TelemetryEvent> {
    const event: TelemetryEvent = {
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      eventType,
      customerId,
      timestamp: new Date().toISOString(),
      payload,
      dispatchedToCrm: false,
    };

    // 1. Immediately store in persistent local storage
    const all = this.getStoredEvents();
    all.unshift(event);
    // Keep last 300 events for memory safety
    if (all.length > 300) {
      all.length = 300;
    }
    this.saveEvents(all);

    // 2. Dispatch to existing StreamNest CRM backend
    this.dispatchToCrm(event).catch(() => {
      // Background non-blocking
    });

    return event;
  }

  private async dispatchToCrm(event: TelemetryEvent) {
    const attemptTime = new Date().toISOString();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${this.crmEndpoint}/api/telemetry/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Source': 'StreamNest-OTT-Frontend',
        },
        body: JSON.stringify({
          event_id: event.eventId,
          event_type: event.eventType,
          customer_id: event.customerId,
          timestamp: event.timestamp,
          payload: event.payload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.updateEventStatus(event.eventId, true, undefined, attemptTime);
      } else {
        const errorText = `HTTP ${response.status} ${response.statusText}`;
        this.updateEventStatus(event.eventId, false, errorText, attemptTime);
      }
    } catch (err: any) {
      let message = 'Connection failed';
      if (err.name === 'AbortError') {
        message = 'Request timed out (3.5s)';
      } else if (err.message) {
        message = err.message;
      }
      this.updateEventStatus(event.eventId, false, message, attemptTime);
    }
  }

  private updateEventStatus(
    eventId: string,
    dispatched: boolean,
    error?: string,
    attemptTime?: string
  ) {
    const events = this.getStoredEvents();
    const idx = events.findIndex(e => e.eventId === eventId);
    if (idx !== -1) {
      events[idx].dispatchedToCrm = dispatched;
      events[idx].dispatchError = error;
      events[idx].dispatchAttemptAt = attemptTime;
      this.saveEvents(events);
    }
  }

  public async testConnection(overrideUrl?: string): Promise<{
    reachable: boolean;
    statusText: string;
    latencyMs?: number;
    errorDetails?: string;
  }> {
    const start = performance.now();
    const endpoint = overrideUrl ? overrideUrl.trim().replace(/\/$/, '') : this.crmEndpoint;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Attempt to ping the CRM root or health endpoint
      const response = await fetch(`${endpoint}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(async () => {
        // Fallback to checking root
        return fetch(`${endpoint}/`, {
          method: 'GET',
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);

      if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
        return {
          reachable: true,
          statusText: `Responded with HTTP ${response.status}`,
          latencyMs,
        };
      }

      return {
        reachable: false,
        statusText: `HTTP ${response.status} Error`,
        latencyMs,
        errorDetails: `Server responded with status code ${response.status}`,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        reachable: false,
        statusText: 'Unreachable / Connection Refused',
        latencyMs,
        errorDetails:
          err.name === 'AbortError'
            ? 'Timed out after 3000ms'
            : err.message || 'Network request failed (Check if Flask server is running and CORS is enabled)',
      };
    }
  }

  public async retryAllPending(): Promise<number> {
    const events = this.getStoredEvents();
    const pending = events.filter(e => !e.dispatchedToCrm);
    for (const evt of pending) {
      await this.dispatchToCrm(evt);
    }
    return pending.length;
  }

  public async flushPendingEvents(): Promise<number> {
    return this.retryAllPending();
  }

  public getEventsByCustomerId(customerId: string): TelemetryEvent[] {
    return this.getStoredEvents().filter(e => e.customerId === customerId);
  }

  public clearEvents() {
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }
}

export const crmTelemetry = new CrmTelemetryService();
