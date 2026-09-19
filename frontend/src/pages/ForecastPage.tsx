import React, { useState } from 'react';
import {
  ActiveResultState,
  ForecastFormData,
  ForecastResponse,
  HistoryRecord,
  PageId,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { savePredictionToFirestore } from '../services/firestoreService';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { forecastCampaign } from '../services/mlApi';
import {
  TrendingUp,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Users,
  Percent,
  Layers,
  BarChart3,
  LineChart,
  Database,
} from 'lucide-react';

interface ForecastPageProps {
  onNavigate: (page: PageId) => void;
  onRecordHistory: (record: HistoryRecord) => void;
  onSetActiveResult: (result: ActiveResultState) => void;
  customBackendUrl?: string;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  onNavigate,
  onRecordHistory,
  onSetActiveResult,
  customBackendUrl,
}) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForecastResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [savedFirestoreDocId, setSavedFirestoreDocId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!steps || steps < 1) {
      setError('Forecast horizon steps must be an integer greater than or equal to 1.');
      return;
    }

    setIsLoading(true);
    setLoadingSeconds(0);
    const timer = setInterval(() => {
      setLoadingSeconds((prev) => prev + 1);
    }, 1000);

    const startTime = performance.now();

    try {
      // Execute live VAR(2) forecast from FastAPI
      const response = await forecastCampaign({ steps }, customBackendUrl);
      const elapsedMs = Math.round(performance.now() - startTime);
      setExecutionTime(elapsedMs);
      setResult(response);

      const totalExpectedCustomers = response.forecast.reduce(
        (acc, f) => acc + (f.Expected_Total_Customers || 0),
        0
      );
      const avgExpectedSubscriptionRate =
        response.forecast.length > 0
          ? response.forecast.reduce(
              (acc, f) => acc + (f.Expected_Subscription_Rate || 0),
              0
            ) / response.forecast.length
          : 0;

      const structuredOutput = {
        expected_total_customers: totalExpectedCustomers,
        expected_subscription_rate: avgExpectedSubscriptionRate,
        forecast: response.forecast,
        model: response.model,
        steps: response.steps,
      };

      // Save to Cloud Firestore: users/{uid}/predictions/{predictionId}
      let firestoreDocId = `fc_${Date.now()}`;
      if (user?.id) {
        try {
          firestoreDocId = await savePredictionToFirestore(user.id, {
            modelId: 'var2-campaign-forecast',
            modelName: 'VAR(2) Multi-Step Forecast',
            input: { steps },
            output: structuredOutput,
            status: 'success',
            executionTimeMs: elapsedMs,
            endpoint: '/forecast',
          });
          setSavedFirestoreDocId(firestoreDocId);
        } catch (fsErr) {
          console.warn('Firestore forecast save warning:', fsErr);
        }
      }

      // Package history record for state synchronization
      const record: HistoryRecord = {
        id: firestoreDocId,
        uid: user?.id,
        modelId: 'var2-campaign-forecast',
        modelName: 'VAR(2) Multi-Step Forecast',
        input: { steps },
        output: structuredOutput,
        timestamp: new Date().toISOString(),
        modelType: 'forecast',
        modelTitle: 'VAR(2) Multi-Step Forecast',
        endpoint: 'https://bank-marketing-fastapi.onrender.com/forecast',
        inputPayload: { steps },
        outputResult: response,
        status: 'success',
        executionTimeMs: elapsedMs,
      };

      onRecordHistory(record);
      onSetActiveResult({
        modelType: 'forecast',
        modelTitle: 'VAR(2) Multi-Step Forecast',
        endpoint: 'https://bank-marketing-fastapi.onrender.com/forecast',
        inputPayload: { steps },
        outputResult: response,
        executionTimeMs: elapsedMs,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to obtain forecast from FastAPI backend.');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSteps(3);
    setError(null);
    setResult(null);
    setSavedFirestoreDocId(null);
  };

  // Find max values for chart scaling
  const maxCustomers = result
    ? Math.max(...result.forecast.map((f) => f.Expected_Total_Customers), 1)
    : 1;
  const maxRate = result
    ? Math.max(...result.forecast.map((f) => f.Expected_Subscription_Rate), 1)
    : 1;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" icon={<TrendingUp className="w-3.5 h-3.5" />}>
              Campaign Forecast
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Campaign Trend Forecast
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Forecast customer volume and expected deposit subscription rates across future campaign periods.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs self-start md:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Periods</span>
        </button>
      </div>

      {/* Loading Cold Start Advisory */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center gap-3 text-xs text-blue-200">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Generating campaign forecast... ({loadingSeconds}s)
            </p>
            <p className="text-[11px] text-blue-300/80">
              Calculating future campaign trends. If the server is waking up, this may take a few moments.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 flex items-start gap-3 text-xs text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-semibold">Forecast Error</p>
            <p className="text-[11px] text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Step Selector Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          title="Forecast Period Settings"
          subtitle="Select how many future periods you want to forecast"
        >
          <div className="space-y-6 text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Forecast Periods
                </label>
                <span className="px-3.5 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300 font-bold text-sm">
                  {steps} {steps === 1 ? 'Period' : 'Periods'}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max="12"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-slate-500 text-[11px]">Quick Select:</span>
                {[
                  { label: 'Next Period (1)', val: 1 },
                  { label: '3 Periods', val: 3 },
                  { label: '6 Periods', val: 6 },
                  { label: '12 Periods', val: 12 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSteps(item.val)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      steps === item.val
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Configured for {steps} future {steps === 1 ? 'period' : 'periods'}</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Forecasting ({loadingSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Forecast Campaigns</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </form>

      {/* Real Forecast Results */}
      {result && (
        <div className="space-y-6">
          {/* Header Metric Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/50 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blue">Forecast Results</Badge>
                <span className="text-xs text-slate-400">
                  Periods: <strong className="text-slate-200">{result.steps}</strong>
                </span>
                {savedFirestoreDocId && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded">
                    <Database className="w-3 h-3" />
                    <span>Saved to History</span>
                  </span>
                )}
              </div>
            </div>

            {/* Real Forecast Table */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Forecasted Campaign Trends</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                      <th className="p-3 font-semibold">Forecast Period</th>
                      <th className="p-3 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span>Expected Customer Reach</span>
                        </div>
                      </th>
                      <th className="p-3 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Expected Subscription Rate</span>
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-right">Conversion Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {result.forecast.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-sans font-semibold text-slate-200">
                          Period +{idx + 1}
                        </td>
                        <td className="p-3 text-blue-300 font-bold">
                          {item.Expected_Total_Customers.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })} customers
                        </td>
                        <td className="p-3 text-emerald-300 font-bold">
                          {item.Expected_Subscription_Rate.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{
                                  width: `${Math.min(item.Expected_Subscription_Rate * 2, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 w-10 text-right">
                              {item.Expected_Subscription_Rate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Interactive SVG Chart using actual returned forecast values */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>Campaign Performance Trends</span>
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> Expected Customers
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Subscription Rate (%)
                  </span>
                </div>
              </div>

              {/* Bar and Line visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customers Bar Chart */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Expected Customers by Period
                  </span>
                  <div className="space-y-2 pt-2">
                    {result.forecast.map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Period {i + 1}</span>
                          <span className="text-blue-300 font-bold">
                            {f.Expected_Total_Customers.toFixed(0)} customers
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded transition-all duration-500"
                            style={{
                              width: `${(f.Expected_Total_Customers / maxCustomers) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Rate Progression */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Expected Subscription Rate by Period
                  </span>
                  <div className="space-y-2 pt-2">
                    {result.forecast.map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Period {i + 1}</span>
                          <span className="text-emerald-300 font-bold">
                            {f.Expected_Subscription_Rate.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded transition-all duration-500"
                            style={{
                              width: `${(f.Expected_Subscription_Rate / maxRate) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
