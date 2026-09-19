/**
 * ML API Client for Bank Marketing XGBoost and VAR(2) Deployed Service
 * Backend target: https://bank-marketing-fastapi.onrender.com
 */

export interface PredictRequest {
  age: number;
  balance: number;
  day: number;
  duration_minutes: number;
  campaign: number;
  previous: number;
  pdays: number;
  job: string;
  marital: string;
  education: string;
  default_status: string;
  housing: string;
  loan: string;
  contact: string;
  month: string;
  poutcome: string;
}

export interface PredictResponse {
  prediction: 'yes' | 'no';
  probability: number;
  threshold: number;
}

export interface ForecastRequest {
  steps: number;
}

export interface ForecastItem {
  Expected_Total_Customers: number;
  Expected_Subscription_Rate: number;
}

export interface ForecastResponse {
  model: string;
  steps: number;
  forecast: ForecastItem[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  threshold?: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  modelType: 'classification' | 'forecast';
  modelTitle: string;
  endpoint: string;
  inputPayload: Record<string, any>;
  outputResult: PredictResponse | ForecastResponse;
  status: 'success' | 'error';
}

export const REMOTE_BACKEND_URL = 'https://bank-marketing-fastapi.onrender.com';
export const PROXY_PREFIX = '/api/ml';

/**
 * Executes an HTTP request with dual-route fallback (Proxy -> Direct Render URL)
 * and cold-start timeout handling.
 */
async function executeApiCall<T>(
  endpointPath: string,
  options: RequestInit = {},
  customBaseUrl?: string
): Promise<T> {
  const routesToTry: string[] = [];

  if (customBaseUrl) {
    routesToTry.push(`${customBaseUrl.replace(/\/$/, '')}${endpointPath}`);
  } else {
    // Primary: use local reverse proxy to completely avoid browser CORS preflight blocks
    routesToTry.push(`${PROXY_PREFIX}${endpointPath}`);
    // Secondary: direct to Render backend
    routesToTry.push(`${REMOTE_BACKEND_URL}${endpointPath}`);
  }

  let lastError: Error | null = null;

  for (const url of routesToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);

      // If we got an HTML response instead of JSON (e.g. proxy missed and returned index.html fallback),
      // continue to next route
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') && url.startsWith(PROXY_PREFIX)) {
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorDetail = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.detail) {
            errorDetail = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
          }
        } catch {
          // keep text
        }
        throw new Error(`HTTP ${response.status}: ${errorDetail || response.statusText}`);
      }

      const json = await response.json();
      return json as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      // If it was an abort timeout, don't keep trying forever
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out after 65 seconds. Render free-tier instance may be waking up. Please retry in a moment.');
      }
    }
  }

  throw lastError || new Error('Failed to connect to Bank Marketing ML backend.');
}

/**
 * GET /health
 */
export async function fetchBackendHealth(customBaseUrl?: string): Promise<HealthResponse> {
  return executeApiCall<HealthResponse>('/health', { method: 'GET' }, customBaseUrl);
}

/**
 * POST /predict
 * Strictly sends the 16 features. Does NOT send previously_contacted.
 */
export async function predictDeposit(
  data: PredictRequest,
  customBaseUrl?: string
): Promise<PredictResponse> {
  const payload: PredictRequest = {
    age: Number(data.age),
    balance: Number(data.balance),
    day: Number(data.day),
    duration_minutes: Number(data.duration_minutes),
    campaign: Number(data.campaign),
    previous: Number(data.previous),
    pdays: Number(data.pdays),
    job: String(data.job),
    marital: String(data.marital),
    education: String(data.education),
    default_status: String(data.default_status),
    housing: String(data.housing),
    loan: String(data.loan),
    contact: String(data.contact),
    month: String(data.month),
    poutcome: String(data.poutcome),
  };

  return executeApiCall<PredictResponse>(
    '/predict',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    customBaseUrl
  );
}

/**
 * POST /forecast
 * Strictly sends { steps: number }
 */
export async function forecastCampaign(
  data: ForecastRequest,
  customBaseUrl?: string
): Promise<ForecastResponse> {
  if (!data.steps || data.steps < 1) {
    throw new Error('Forecast steps must be an integer greater than or equal to 1.');
  }

  const payload: ForecastRequest = {
    steps: Math.floor(Number(data.steps)),
  };

  return executeApiCall<ForecastResponse>(
    '/forecast',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    customBaseUrl
  );
}
