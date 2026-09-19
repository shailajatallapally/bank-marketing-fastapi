import React, { useEffect, useState } from 'react';
import { HealthResponse, PageId, UserProfile } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { fetchBackendHealth } from '../services/mlApi';
import {
  BrainCircuit,
  TrendingUp,
  PieChart,
  Server,
  Activity,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sliders,
  FileSpreadsheet,
  Layers,
  Database,
  Info,
} from 'lucide-react';

interface DashboardPageProps {
  user: UserProfile;
  onNavigate: (page: PageId) => void;
  customBackendUrl?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onNavigate,
  customBackendUrl,
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    const start = performance.now();
    try {
      const data = await fetchBackendHealth(customBackendUrl);
      setHealth(data);
      setHealthLatency(Math.round(performance.now() - start));
    } catch (err: any) {
      setHealthError(err.message || 'Unable to communicate with FastAPI backend.');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [customBackendUrl]);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Bank Marketing ML Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome, <strong className="text-slate-200">{user.name || user.email || 'Account'}</strong>{user.organization && !user.organization.includes('Apex') ? ` • ${user.organization}` : ' • Bank Marketing'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('predict')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Predict Deposit</span>
          </button>
          <button
            onClick={() => onNavigate('forecast')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Campaign Forecast</span>
          </button>
        </div>
      </div>

      {/* System Status Panel */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                System Connection Status
              </span>
              <span className="text-[11px] text-slate-400">
                Online and ready to process customer analytics
              </span>
            </div>
          </div>

          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium self-start sm:self-auto disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            <span>{healthLoading ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>

        {healthError ? (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <div className="space-y-0.5">
              <p className="font-semibold">Service Temporarily Unavailable</p>
              <p className="text-[11px] text-rose-300/80">Connecting to server. If the system is starting up, please wait a moment.</p>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Service Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Operational</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Available Services</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Ready
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Prediction Setting</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">
                  {health.threshold !== undefined ? `${(health.threshold * 100).toFixed(0)}%` : '59%'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">System Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">
                  Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-1 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Connecting to system services...</span>
          </div>
        )}
      </div>

      {/* Core Capabilities */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-4">
          Key Features
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Capability 1: Deposit Prediction */}
          <Card
            title="Deposit Prediction"
            subtitle="Predict customer deposit subscription likelihood"
            action={<Badge variant="emerald">Available</Badge>}
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Evaluate customer background and campaign interaction details to predict whether they are likely to subscribe to a term deposit.
              </p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Evaluates 16 customer and outreach factors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Provides clear likelihood percentage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Saves predictions automatically to history</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('predict')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                <span>Open Deposit Predictor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>

          {/* Capability 2: Campaign Forecast */}
          <Card
            title="Campaign Forecast"
            subtitle="Project customer reach and subscription rates"
            action={<Badge variant="blue">Available</Badge>}
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Estimate expected customer reach and deposit subscription rates across future campaign periods based on historical trends.
              </p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Forecast trends up to 12 future periods</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Projects both customer volume and conversion rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Interactive visual charts and period comparisons</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('forecast')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold transition-colors cursor-pointer"
              >
                <span>Open Campaign Forecaster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>

          {/* Capability 3: Customer Groups */}
          <Card
            title="Customer Groups"
            subtitle="Understand your customer segments"
            action={<Badge variant="purple">Customer Dataset</Badge>}
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Explore five customer groups identified from contact history, account balance, and campaign engagement.
              </p>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <span className="text-slate-400 font-semibold block">5 Customer Groups:</span>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li><strong className="text-slate-200">Previously Contacted Customers</strong> — 6,339 customers</li>
                  <li><strong className="text-slate-200">Less Previously Contacted Customers</strong> — 16,331 customers</li>
                  <li><strong className="text-slate-200">Higher Balance Customers</strong> — 17,563 customers</li>
                  <li><strong className="text-slate-200">Highly Engaged Customers</strong> — 3,592 customers</li>
                  <li><strong className="text-slate-200">Frequently Contacted Customers</strong> — 1,386 customers</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Customer groups identified from 45,211 customer records.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
