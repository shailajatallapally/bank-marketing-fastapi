import React from 'react';
import { PageId } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  BrainCircuit,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Server,
  ArrowRight,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-3">
        <Badge variant="emerald" icon={<Cpu className="w-3.5 h-3.5" />}>
          How It Works
        </Badge>
        <h1 className="text-3xl font-bold text-slate-100">How Our Predictions Work</h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          See how our banking insights are prepared to help you understand customer responses and campaign trends.
        </p>
      </div>

      {/* Model 1 Deep Dive */}
      <Card
        title="Deposit Prediction"
        subtitle="How We Make the Deposit Prediction"
        action={<Badge variant="emerald">Deposit Prediction Service</Badge>}
      >
        <div className="space-y-6 text-xs text-slate-300">
          <p className="leading-relaxed">
            The Term Deposit Propensity model solves the imbalanced classification problem of determining which banking clients are most likely to subscribe to a long-term deposit. Rather than utilizing a naive default classification cutoff of 0.50, this pipeline evaluates the predicted probability against an empirically tuned optimal threshold (<span className="font-mono text-emerald-400">Prediction Decision Settings</span>).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Prediction Method</span>
              <span className="text-slate-100 font-semibold text-sm">Customer Response Analysis</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Customer Information</span>
              <span className="text-slate-100 font-semibold text-sm">Customer Details</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Additional Customer Insight</span>
              <span className="text-emerald-400 font-semibold text-sm">previously_contacted</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Prediction Result</span>
              <span className="text-slate-100 font-semibold text-sm">Likely to Subscribe / Unlikely to Subscribe</span>
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Customer Information Used</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-2.5 font-medium">Customer Information</th>
                    <th className="p-2.5 font-medium">Information Type</th>
                    <th className="p-2.5 font-medium">How It Is Used</th>
                    <th className="p-2.5 font-medium">What It Means</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Age</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">18 – 100 years</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Account Balance</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">Euro currency balance</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Contact Day</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">Day of month (1 – 31)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Contact Duration</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">Contact duration in minutes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Campaign Contacts</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">Contacts during current campaign (≥ 1)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Previous Contacts</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">Contacts performed prior to campaign (≥ 0)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">Days Since Previous Contact</td>
                    <td className="p-2.5 text-slate-400">Number</td>
                    <td className="p-2.5 text-slate-300">Standard processing</td>
                    <td className="p-2.5 text-slate-400">-1 (never contacted) or &gt; 0 days</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Job</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">admin., blue-collar, management, retired, etc.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Marital Status</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">married, single, divorced</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Education</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">primary, secondary, tertiary, unknown</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Payment Default</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">no, yes, unknown</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Housing Loan</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">no, yes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Personal Loan</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">no, yes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Contact Method</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">cellular, telephone, unknown</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Contact Month</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">jan, feb, mar, ..., dec</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Previous Campaign Result</td>
                    <td className="p-2.5 text-slate-400">Category</td>
                    <td className="p-2.5 text-slate-300">Category processing</td>
                    <td className="p-2.5 text-slate-400">success, failure, other, unknown</td>
                  </tr>
                  <tr className="bg-emerald-950/20">
                    <td className="p-2.5 text-emerald-300 font-bold">Previously Contacted</td>
                    <td className="p-2.5 text-slate-400">Yes / No</td>
                    <td className="p-2.5 text-emerald-300">Automatically determined from contact history</td>
                    <td className="p-2.5 text-slate-400">Determined automatically (no manual input required)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Model 2 Deep Dive */}
      <Card
        title="Campaign Forecast"
        subtitle="Understanding Future Campaign Trends"
        action={<Badge variant="blue">Campaign Forecast Service</Badge>}
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Our forecasting service uses previous campaign trends to estimate future customer volume and subscription rates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Past Trend Information</span>
              <span className="text-slate-100 font-semibold text-sm">Recent Campaign History</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Recent Information Used</span>
              <span className="text-slate-100 font-semibold text-sm">Recent Campaign Trends</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Forecast Period</span>
              <span className="text-slate-100 font-semibold text-sm">Number of Future Periods</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Groups */}
      <Card
        id="customer-groups-card"
        title="Customer Groups"
        subtitle="Understand Different Customer Groups"
        action={<Badge variant="purple">Customer Groups CSV</Badge>}
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/50 text-[11px] text-purple-200">
            Customer groups are created from existing customer and campaign information and provided as a CSV analysis.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Grouping Method</span>
              <span className="text-slate-100 font-semibold">5 Customer Groups</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Information Used</span>
              <span className="text-slate-100 font-semibold">7 Customer Details</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Group Quality Check</span>
              <span className="text-slate-100 font-semibold">Group Analysis</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Records Analyzed</span>
              <span className="text-slate-100 font-semibold">45,211 Records</span>
            </div>
          </div>
          <div className="space-y-2 text-slate-400 text-[11px]">
            <span className="text-slate-200 font-semibold block text-xs">Customer Groups:</span>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-200 font-medium text-xs">1. Previously Contacted Customers</span>
                </div>
                <span className="text-emerald-400 font-semibold text-xs">6,339 customers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-slate-200 font-medium text-xs">2. Less Previously Contacted Customers</span>
                </div>
                <span className="text-blue-400 font-semibold text-xs">16,331 customers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-slate-200 font-medium text-xs">3. Higher Balance Customers</span>
                </div>
                <span className="text-purple-400 font-semibold text-xs">17,563 customers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-slate-200 font-medium text-xs">4. Highly Engaged Customers</span>
                </div>
                <span className="text-amber-400 font-semibold text-xs">3,592 customers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="text-slate-200 font-medium text-xs">5. Frequently Contacted Customers</span>
                </div>
                <span className="text-indigo-400 font-semibold text-xs">1,386 customers</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
