import React, { useState } from 'react';
import {
  ActiveResultState,
  BankMarketingFormData,
  HistoryRecord,
  PageId,
  PredictResponse,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { savePredictionToFirestore } from '../services/firestoreService';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { predictDeposit } from '../services/mlApi';
import {
  BrainCircuit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Activity,
  Sliders,
  ShieldCheck,
  Zap,
  Database,
} from 'lucide-react';

interface PredictionPageProps {
  onNavigate: (page: PageId) => void;
  onRecordHistory: (record: HistoryRecord) => void;
  onSetActiveResult: (result: ActiveResultState) => void;
  customBackendUrl?: string;
}

interface PredictionFormValues {
  age: string;
  balance: string;
  job: string;
  marital: string;
  education: string;
  default_status: string;
  housing: string;
  loan: string;
  contact: string;
  month: string;
  day: string;
  duration_minutes: string;
  campaign: string;
  pdays: string;
  previous: string;
  poutcome: string;
}

const EMPTY_FORM: PredictionFormValues = {
  age: '',
  balance: '',
  job: '',
  marital: '',
  education: '',
  default_status: '',
  housing: '',
  loan: '',
  contact: '',
  month: '',
  day: '',
  duration_minutes: '',
  campaign: '',
  pdays: '',
  previous: '',
  poutcome: '',
};

export const PredictionPage: React.FC<PredictionPageProps> = ({
  onNavigate,
  onRecordHistory,
  onSetActiveResult,
  customBackendUrl,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PredictionFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [savedFirestoreDocId, setSavedFirestoreDocId] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof PredictionFormValues,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setError(null);
    setResult(null);
    setSavedFirestoreDocId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Age
    if (!formData.age.trim()) {
      setError('Please provide client age.');
      return;
    }
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 110) {
      setError('Client age must be a valid number between 18 and 110 years.');
      return;
    }

    // Validation 2: Balance
    if (!formData.balance.trim()) {
      setError('Please provide average yearly balance.');
      return;
    }
    const balanceNum = Number(formData.balance);
    if (isNaN(balanceNum)) {
      setError('Average yearly balance must be a valid number.');
      return;
    }

    // Validation 3: Job
    if (!formData.job) {
      setError('Please select an occupation.');
      return;
    }

    // Validation 4: Marital
    if (!formData.marital) {
      setError('Please select marital status.');
      return;
    }

    // Validation 5: Education
    if (!formData.education) {
      setError('Please select education level.');
      return;
    }

    // Validation 6: Default status
    if (!formData.default_status) {
      setError('Please select credit default status.');
      return;
    }

    // Validation 7: Housing
    if (!formData.housing) {
      setError('Please select housing loan option.');
      return;
    }

    // Validation 8: Loan
    if (!formData.loan) {
      setError('Please select personal loan option.');
      return;
    }

    // Validation 9: Contact
    if (!formData.contact) {
      setError('Please select communication medium option.');
      return;
    }

    // Validation 10: Month
    if (!formData.month) {
      setError('Please select last contact month.');
      return;
    }

    // Validation 11: Day
    if (!formData.day.trim()) {
      setError('Please provide day of month.');
      return;
    }
    const dayNum = Number(formData.day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      setError('Day of month must be between 1 and 31.');
      return;
    }

    // Validation 12: Duration
    if (!formData.duration_minutes.trim()) {
      setError('Please provide call duration in minutes.');
      return;
    }
    const durationNum = Number(formData.duration_minutes);
    if (isNaN(durationNum) || durationNum < 0) {
      setError('Call duration cannot be negative.');
      return;
    }

    // Validation 13: Campaign
    if (!formData.campaign.trim()) {
      setError('Please provide contacts count in current campaign.');
      return;
    }
    const campaignNum = Number(formData.campaign);
    if (isNaN(campaignNum) || campaignNum < 1) {
      setError('Current campaign contacts count must be at least 1.');
      return;
    }

    // Validation 14: Pdays
    if (!formData.pdays.trim()) {
      setError('Please provide days since contact (enter -1 if never previously contacted).');
      return;
    }
    const pdaysNum = Number(formData.pdays);
    if (isNaN(pdaysNum)) {
      setError('Days since contact must be a valid number (-1 or greater).');
      return;
    }

    // Validation 15: Previous
    if (!formData.previous.trim()) {
      setError('Please provide prior contacts count.');
      return;
    }
    const previousNum = Number(formData.previous);
    if (isNaN(previousNum) || previousNum < 0) {
      setError('Prior contacts count must be 0 or greater.');
      return;
    }

    // Validation 16: Poutcome
    if (!formData.poutcome) {
      setError('Please select previous campaign outcome.');
      return;
    }

    const payload: BankMarketingFormData = {
      age: ageNum,
      balance: balanceNum,
      job: formData.job,
      marital: formData.marital,
      education: formData.education,
      default_status: formData.default_status,
      housing: formData.housing,
      loan: formData.loan,
      contact: formData.contact,
      month: formData.month,
      day: Math.round(dayNum),
      duration_minutes: durationNum,
      campaign: Math.round(campaignNum),
      pdays: Math.round(pdaysNum),
      previous: Math.round(previousNum),
      poutcome: formData.poutcome,
    };

    setIsLoading(true);
    setLoadingSeconds(0);
    const timer = setInterval(() => {
      setLoadingSeconds((prev) => prev + 1);
    }, 1000);

    const startTime = performance.now();

    try {
      // Dispatch real prediction request to POST /predict
      const response = await predictDeposit(payload, customBackendUrl);
      const elapsedMs = Math.round(performance.now() - startTime);
      setExecutionTime(elapsedMs);
      setResult(response);

      // Save exact input and actual API response to Cloud Firestore
      let firestoreDocId = `pred_${Date.now()}`;
      if (user?.id) {
        try {
          firestoreDocId = await savePredictionToFirestore(user.id, {
            modelId: 'xgboost-term-deposit',
            modelName: 'XGBoost Term Deposit Classifier',
            input: { ...payload },
            output: {
              prediction: response.prediction,
              probability: response.probability,
              threshold: response.threshold,
            },
            status: 'success',
            executionTimeMs: elapsedMs,
            endpoint: '/predict',
          });
          setSavedFirestoreDocId(firestoreDocId);
        } catch (fsErr) {
          console.warn('Firestore persistence error (non-fatal):', fsErr);
        }
      }

      // Package real history record for in-memory / state synchronization
      const record: HistoryRecord = {
        id: firestoreDocId,
        uid: user?.id,
        modelId: 'xgboost-term-deposit',
        modelName: 'XGBoost Term Deposit Classifier',
        input: { ...payload },
        output: {
          prediction: response.prediction,
          probability: response.probability,
          threshold: response.threshold,
        },
        timestamp: new Date().toISOString(),
        modelType: 'classification',
        modelTitle: 'XGBoost Term Deposit Classifier',
        endpoint: 'https://bank-marketing-fastapi.onrender.com/predict',
        inputPayload: { ...payload },
        outputResult: response,
        status: 'success',
        executionTimeMs: elapsedMs,
      };

      onRecordHistory(record);
      onSetActiveResult({
        modelType: 'classification',
        modelTitle: 'XGBoost Term Deposit Classifier',
        endpoint: 'https://bank-marketing-fastapi.onrender.com/predict',
        inputPayload: { ...payload },
        outputResult: response,
        executionTimeMs: elapsedMs,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to obtain prediction from FastAPI backend.');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald" icon={<BrainCircuit className="w-3.5 h-3.5" />}>
              Deposit Prediction
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Predict Term Deposit Subscription
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predict whether a customer is likely to subscribe to a term deposit using banking information.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
            title="Reset form to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>
        </div>
      </div>

      {/* Loading Cold Start Advisory */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center gap-3 text-xs text-blue-200">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Calculating prediction... ({loadingSeconds}s)
            </p>
            <p className="text-[11px] text-blue-300/80">
              Processing customer data. If the server is starting up, this may take a few moments.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 flex items-start gap-3 text-xs text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-semibold">Prediction Error</p>
            <p className="text-[11px] text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Real Result Display Panel */}
      {result && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/50 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.prediction === 'yes' ? 'emerald' : 'rose'}>
                {result.prediction === 'yes' ? 'Likely to Subscribe' : 'Unlikely to Subscribe'}
              </Badge>
              {savedFirestoreDocId && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <Database className="w-3 h-3" />
                  <span>Saved to History</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prediction Decision */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Deposit Subscription Result
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-extrabold uppercase ${
                    result.prediction === 'yes' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {result.prediction === 'yes' ? 'Likely to Subscribe' : 'Unlikely to Subscribe'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {result.prediction === 'yes'
                  ? 'Customer is likely to subscribe to the term deposit.'
                  : 'Customer is unlikely to subscribe under current campaign conditions.'}
              </p>
            </div>

            {/* Probability Metric */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Likelihood
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {(result.probability * 100).toFixed(2)}%
                </span>
              </div>
              {/* Visual gauge */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1 relative">
                <div
                  className={`h-full transition-all duration-700 ${
                    result.prediction === 'yes' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(result.probability * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Estimated probability of subscription.
              </p>
            </div>

            {/* Decision Threshold */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Decision Level
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-400 font-mono">
                  {(result.threshold * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Likelihood level required for a positive recommendation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Information */}
        <Card
          title="1. Customer Information"
          subtitle="Basic background and financial standing"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="18"
                max="110"
                required
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter age"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Balance (€)
              </label>
              <input
                type="number"
                required
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', e.target.value)}
                placeholder="Enter balance"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Occupation
              </label>
              <select
                required
                value={formData.job}
                onChange={(e) => handleInputChange('job', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.job ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select occupation
                </option>
                <option value="admin." className="text-slate-200">admin.</option>
                <option value="blue-collar" className="text-slate-200">blue-collar</option>
                <option value="entrepreneur" className="text-slate-200">entrepreneur</option>
                <option value="housemaid" className="text-slate-200">housemaid</option>
                <option value="management" className="text-slate-200">management</option>
                <option value="retired" className="text-slate-200">retired</option>
                <option value="self-employed" className="text-slate-200">self-employed</option>
                <option value="services" className="text-slate-200">services</option>
                <option value="student" className="text-slate-200">student</option>
                <option value="technician" className="text-slate-200">technician</option>
                <option value="unemployed" className="text-slate-200">unemployed</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Marital Status
              </label>
              <select
                required
                value={formData.marital}
                onChange={(e) => handleInputChange('marital', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.marital ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select marital status
                </option>
                <option value="married" className="text-slate-200">married</option>
                <option value="single" className="text-slate-200">single</option>
                <option value="divorced" className="text-slate-200">divorced</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Education Level
              </label>
              <select
                required
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.education ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select education level
                </option>
                <option value="primary" className="text-slate-200">primary</option>
                <option value="secondary" className="text-slate-200">secondary</option>
                <option value="tertiary" className="text-slate-200">tertiary</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Credit Default
              </label>
              <select
                required
                value={formData.default_status}
                onChange={(e) => handleInputChange('default_status', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.default_status ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select option
                </option>
                <option value="no" className="text-slate-200">no</option>
                <option value="yes" className="text-slate-200">yes</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Loans & Credit */}
        <Card
          title="2. Loans & Credit"
          subtitle="Existing banking loans and credit commitments"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Housing Loan
              </label>
              <select
                required
                value={formData.housing}
                onChange={(e) => handleInputChange('housing', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.housing ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select option
                </option>
                <option value="no" className="text-slate-200">no</option>
                <option value="yes" className="text-slate-200">yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Personal Loan
              </label>
              <select
                required
                value={formData.loan}
                onChange={(e) => handleInputChange('loan', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.loan ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select option
                </option>
                <option value="no" className="text-slate-200">no</option>
                <option value="yes" className="text-slate-200">yes</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Current Campaign Outreach */}
        <Card
          title="3. Current Campaign Outreach"
          subtitle="Timing, channel, and duration of current contact"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Method
              </label>
              <select
                required
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.contact ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select option
                </option>
                <option value="cellular" className="text-slate-200">cellular</option>
                <option value="telephone" className="text-slate-200">telephone</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Month
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.month ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select month
                </option>
                {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((m) => (
                  <option key={m} value={m} className="text-slate-200">
                    {m.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Day of Month (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.day}
                onChange={(e) => handleInputChange('day', e.target.value)}
                placeholder="Enter day (1-31)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Call Duration (Minutes)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                placeholder="Enter duration in minutes"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Previous Campaign History */}
        <Card
          title="4. Previous Campaign History"
          subtitle="Past campaign outreach and responses"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contacts in This Campaign
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.campaign}
                onChange={(e) => handleInputChange('campaign', e.target.value)}
                placeholder="Enter count"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Previous Contact
                </label>
                <button
                  type="button"
                  onClick={() => handleInputChange('pdays', '-1')}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Never contacted before
                </button>
              </div>
              <input
                type="number"
                required
                value={formData.pdays}
                onChange={(e) => handleInputChange('pdays', e.target.value)}
                placeholder="Enter number of days since the previous contact"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Previous Contacts Count
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.previous}
                onChange={(e) => handleInputChange('previous', e.target.value)}
                placeholder="Enter prior count"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Previous Campaign Result
              </label>
              <select
                required
                value={formData.poutcome}
                onChange={(e) => handleInputChange('poutcome', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                  !formData.poutcome ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                <option value="" disabled className="text-slate-500">
                  Select previous result
                </option>
                <option value="success" className="text-slate-200">success</option>
                <option value="failure" className="text-slate-200">failure</option>
                <option value="other" className="text-slate-200">other</option>
                <option value="unknown" className="text-slate-200">unknown</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Complete the customer details to predict term deposit subscription</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating ({loadingSeconds}s)...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Predict Deposit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
