import React from 'react';
import { ActiveResultState, PageId, PredictResponse, ForecastResponse } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  BrainCircuit,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Users,
  Percent,
} from 'lucide-react';

interface ResultsPageProps {
  activeResult: ActiveResultState | null;
  onNavigate: (page: PageId) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  activeResult,
  onNavigate,
}) => {
  if (!activeResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">No Active Result Available</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Execute a prediction or forecast from the model pages to view the structured results here.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('predict')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Launch Predictor</span>
          </button>
          <button
            onClick={() => onNavigate('forecast')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Launch Forecaster</span>
          </button>
        </div>
      </div>
    );
  }

  const isClassification = activeResult.modelType === 'classification';
  const predictOutput = isClassification ? (activeResult.outputResult as PredictResponse) : null;
  const forecastOutput = !isClassification ? (activeResult.outputResult as ForecastResponse) : null;
  const isLikely = predictOutput?.prediction === 'yes';

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={isClassification ? 'emerald' : 'blue'}
              icon={
                isClassification ? (
                  <BrainCircuit className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )
              }
            >
              {isClassification ? 'Deposit Prediction' : 'Campaign Forecast'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            {isClassification ? 'Deposit Prediction Result' : 'Campaign Forecast Result'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Completed at {activeResult.timestamp}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(isClassification ? 'predict' : 'forecast')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Form</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>

      {/* Model-Specific Live Output Banner */}
      {isClassification && predictOutput && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/50 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">
              Customer Analysis Result
            </span>
            <Badge variant={isLikely ? 'emerald' : 'rose'}>
              {isLikely ? 'Likely to Subscribe' : 'Not Likely'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Outcome</span>
              <span
                className={`text-2xl font-extrabold ${
                  isLikely ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isLikely ? 'Likely' : 'Not Likely'}
              </span>
              <p className="text-[10px] text-slate-400">
                {isLikely
                  ? 'Customer meets key indicators for term deposit subscription.'
                  : 'Customer is unlikely to subscribe at this time.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Subscription Likelihood</span>
              <span className="text-2xl font-extrabold text-slate-100">
                {(predictOutput.probability * 100).toFixed(1)}%
              </span>
              <p className="text-[10px] text-slate-400">
                Estimated probability based on customer and campaign attributes
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Recommendation</span>
              <span className="text-sm font-bold text-blue-300 block pt-1">
                {isLikely ? 'Prioritize for Outreach' : 'Review Campaign Fit'}
              </span>
              <p className="text-[10px] text-slate-400">
                {isLikely
                  ? 'High probability prospect for term deposit follow-up.'
                  : 'Consider non-deposit products or adjust outreach timing.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isClassification && forecastOutput && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">
              Future Campaign Projections &bull; Periods Forecasted: <strong className="text-slate-200">{forecastOutput.steps}</strong>
            </span>
            <Badge variant="blue">Forecast Ready</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <th className="p-2.5 font-semibold">Forecast Period</th>
                  <th className="p-2.5 font-semibold">Expected Customer Reach</th>
                  <th className="p-2.5 font-semibold">Expected Subscription Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {forecastOutput.forecast.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-sans font-semibold text-slate-200">Period +{idx + 1}</td>
                    <td className="p-2.5 text-blue-300 font-bold">
                      {item.Expected_Total_Customers.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} customers
                    </td>
                    <td className="p-2.5 text-emerald-300 font-bold">
                      {item.Expected_Subscription_Rate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
