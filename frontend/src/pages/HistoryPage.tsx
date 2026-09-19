import React, { useEffect, useState } from 'react';
import { HistoryRecord, PageId, FirestorePredictionDoc } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToUserPredictions,
  deleteUserPrediction,
  clearAllUserPredictions,
  formatFriendlyDateTime,
} from '../services/firestoreService';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  History,
  Search,
  Database,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  Clock,
  ExternalLink,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Layers,
} from 'lucide-react';

interface HistoryPageProps {
  historyRecords: HistoryRecord[];
  onClearHistory: () => void;
  onNavigate: (page: PageId) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  historyRecords: localRecords,
  onClearHistory,
  onNavigate,
}) => {
  const { user, isFirebaseConfigured } = useAuth();
  const [firestoreRecords, setFirestoreRecords] = useState<FirestorePredictionDoc[]>([]);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'classification' | 'forecast'>('all');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Real-time Firestore subscription to users/{uid}/predictions
  useEffect(() => {
    if (!user?.id || !isFirebaseConfigured) {
      setIsLoadingFirestore(false);
      return;
    }

    setIsLoadingFirestore(true);
    setFirestoreError(null);

    const unsubscribe = subscribeToUserPredictions(
      user.id,
      (records) => {
        setFirestoreRecords(records);
        setIsLoadingFirestore(false);
      },
      (error) => {
        console.warn('Firestore prediction query warning:', error);
        setFirestoreError(error.message);
        setIsLoadingFirestore(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, isFirebaseConfigured]);

  // Combine Firestore records with any instant local memory records if needed
  const combinedRecords: HistoryRecord[] = React.useMemo(() => {
    if (firestoreRecords.length > 0) {
      return firestoreRecords.map((fDoc) => {
        const isForecast =
          fDoc.modelId === 'var2-campaign-forecast' ||
          fDoc.modelName.toLowerCase().includes('forecast') ||
          (fDoc.output as any)?.forecast !== undefined;

        return {
          id: fDoc.id,
          uid: fDoc.uid,
          modelId: fDoc.modelId,
          modelName: fDoc.modelName,
          input: fDoc.input,
          output: fDoc.output,
          timestamp: fDoc.timestamp,
          modelType: isForecast ? 'forecast' : 'classification',
          modelTitle: fDoc.modelName || (isForecast ? 'VAR(2) Multi-Step Forecast' : 'XGBoost Term Deposit Classifier'),
          endpoint: fDoc.endpoint || (isForecast ? '/forecast' : '/predict'),
          inputPayload: fDoc.input,
          outputResult: fDoc.output as any,
          status: fDoc.status || 'success',
          executionTimeMs: fDoc.executionTimeMs,
        };
      });
    }

    // Fallback if not configured or empty
    return localRecords;
  }, [firestoreRecords, localRecords]);

  const filteredRecords = combinedRecords.filter((rec) => {
    if (activeTab !== 'all' && rec.modelType !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      rec.modelTitle.toLowerCase().includes(query) ||
      rec.id.toLowerCase().includes(query) ||
      JSON.stringify(rec.inputPayload || rec.input).toLowerCase().includes(query) ||
      JSON.stringify(rec.outputResult || rec.output).toLowerCase().includes(query)
    );
  });

  const handleDeleteRecord = async (recordId: string) => {
    if (!user?.id) return;
    setIsDeleting(recordId);
    try {
      await deleteUserPrediction(user.id, recordId);
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (err: any) {
      alert(`Could not delete record: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all historical prediction records for your account?')) {
      if (user?.id) {
        try {
          await clearAllUserPredictions(user.id);
        } catch (err: any) {
          console.warn('Error clearing Firestore prediction records:', err);
        }
      }
      onClearHistory();
      setSelectedRecord(null);
    }
  };

    // Helper to construct inputs summary string
  const renderInputSummary = (rec: HistoryRecord) => {
    const input = rec.inputPayload || rec.input || {};
    if (rec.modelType === 'classification') {
      return (
        <span className="text-slate-300 font-sans text-xs">
          Customer Profile ({input.job || 'Client'}, age {input.age || '--'})
        </span>
      );
    }
    return (
      <span className="text-slate-300 font-sans text-xs">
        Forecast: <strong className="text-blue-300">{input.steps ?? '--'} {input.steps === 1 ? 'period' : 'periods'}</strong>
      </span>
    );
  };

  // Helper to construct output summary string
  const renderOutputSummary = (rec: HistoryRecord) => {
    const output = (rec.outputResult || rec.output || {}) as any;
    if (rec.modelType === 'classification') {
      const pred = output.prediction;
      const prob = output.probability;
      const isYes = pred === 'yes';
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isYes ? 'emerald' : 'rose'}>
            {isYes ? 'Likely to Subscribe' : 'Not Likely'}
          </Badge>
          <span className="text-slate-300 text-xs">
            {prob !== undefined ? `${(prob * 100).toFixed(0)}% likelihood` : ''}
          </span>
        </div>
      );
    }

    // Forecast output
    const customers = output.expected_total_customers;
    const rate = output.expected_subscription_rate;
    const stepsCount = output.steps || output.forecast?.length;
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-blue-400 font-bold">
          {stepsCount ? `${stepsCount} Periods` : 'Forecasted'}
        </span>
        {customers !== undefined && (
          <span className="text-slate-300">
            ~{Math.round(customers).toLocaleString()} customers
          </span>
        )}
        {rate !== undefined && (
          <span className="text-emerald-400">
            ({rate.toFixed(1)}% rate)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="purple" icon={<Database className="w-3.5 h-3.5" />}>
              Saved History
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Prediction &amp; Forecast History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past deposit predictions and campaign forecasts saved to your account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {combinedRecords.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('predict')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* Account Info Notice */}
      <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            Signed in as <strong className="text-purple-300">{user?.name || user?.email || 'Account User'}</strong>. Your prediction history is private and securely saved.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-purple-400/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Account Protected</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({combinedRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('classification')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'classification'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deposit Predictions
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'forecast'
                ? 'bg-blue-950 text-blue-300 border border-blue-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Campaign Forecasts
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search saved records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading State */}
      {isLoadingFirestore && (
        <div className="p-8 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-xl">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your saved history...</p>
        </div>
      )}

      {/* Query Records List or Empty State */}
      {!isLoadingFirestore && filteredRecords.length === 0 ? (
        <Card>
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {combinedRecords.length === 0
                  ? 'No Saved History Found'
                  : 'No Records Match Filter'}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {combinedRecords.length === 0
                  ? 'Run a deposit prediction or campaign forecast to automatically save your results here.'
                  : 'Try adjusting your search criteria or selecting "All".'}
              </p>
            </div>

            {combinedRecords.length === 0 && (
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onNavigate('predict')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Predict Deposit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('forecast')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Forecast Campaigns</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        !isLoadingFirestore && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Date &amp; Time</th>
                    <th className="p-3 font-semibold">Details</th>
                    <th className="p-3 font-semibold">Result</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredRecords.map((rec) => {
                    const isClass = rec.modelType === 'classification';
                    return (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <Badge variant={isClass ? 'emerald' : 'blue'}>
                            {isClass ? 'Deposit Prediction' : 'Campaign Forecast'}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {formatFriendlyDateTime(rec.timestamp)}
                        </td>
                        <td className="p-3 max-w-[240px]">
                          {renderInputSummary(rec)}
                        </td>
                        <td className="p-3 max-w-[240px]">
                          {renderOutputSummary(rec)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800"
                          >
                            Saved
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRecord(rec)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              disabled={isDeleting === rec.id}
                              className="p-1 rounded bg-slate-800/60 hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              {isDeleting === rec.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant={selectedRecord.modelType === 'classification' ? 'emerald' : 'blue'}>
                  {selectedRecord.modelType === 'classification' ? 'Deposit Prediction' : 'Campaign Forecast'}
                </Badge>
                <span className="text-xs text-slate-400">Record Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/80 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                <div>
                  <span className="text-slate-500 text-[11px] block">Feature</span>
                  <span className="text-slate-200 font-medium">
                    {selectedRecord.modelType === 'classification' ? 'Deposit Prediction' : 'Campaign Forecast'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Date &amp; Time</span>
                  <span className="text-slate-200">{formatFriendlyDateTime(selectedRecord.timestamp)}</span>
                </div>
              </div>

              {/* Clean Output Summary */}
              {selectedRecord.modelType === 'classification' ? (
                (() => {
                  const out = (selectedRecord.outputResult || selectedRecord.output || {}) as any;
                  const pred = out.prediction;
                  const prob = out.probability;
                  const isYes = pred === 'yes';
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Outcome</span>
                        <span className={`text-xl font-bold ${isYes ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isYes ? 'Likely to Subscribe' : 'Not Likely'}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {isYes ? 'Customer meets criteria for subscription' : 'Customer unlikely to subscribe at this time'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Subscription Likelihood</span>
                        <span className="text-xl font-bold text-slate-100">
                          {prob !== undefined ? `${(prob * 100).toFixed(1)}%` : '--'}
                        </span>
                        <p className="text-[10px] text-slate-500">Based on customer and campaign attributes</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const out = (selectedRecord.outputResult || selectedRecord.output || {}) as any;
                  const forecastList: any[] = out.forecast || [];
                  const cust = out.expected_total_customers;
                  const rate = out.expected_subscription_rate;
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Expected Customer Reach</span>
                          <span className="text-xl font-bold text-blue-300">
                            {cust !== undefined ? Math.round(cust).toLocaleString() : '--'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Expected Subscription Rate</span>
                          <span className="text-xl font-bold text-emerald-300">
                            {rate !== undefined ? `${rate.toFixed(2)}%` : '--'}
                          </span>
                        </div>
                      </div>

                      {forecastList.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                                <th className="p-2 font-medium">Period</th>
                                <th className="p-2 font-medium">Expected Customers</th>
                                <th className="p-2 font-medium">Subscription Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-xs">
                              {forecastList.map((f, i) => (
                                <tr key={i}>
                                  <td className="p-2 text-slate-300 font-sans">Period +{i + 1}</td>
                                  <td className="p-2 text-blue-300 font-medium">
                                    {Number(f.Expected_Total_Customers || 0).toLocaleString('en-US', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })} customers
                                  </td>
                                  <td className="p-2 text-emerald-300 font-medium">
                                    {Number(f.Expected_Subscription_Rate || 0).toFixed(2)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
