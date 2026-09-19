import React from 'react';
import { PageId } from '../../types';
import { BrainCircuit, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-slate-100 font-bold">
              <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-sm">Bank Marketing ML Platform</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Predict term deposit subscriptions, understand customer groups, and forecast campaign trends using your banking information.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accurate Decisions</span>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">Quick Access</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('predict')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Deposit Prediction
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('forecast')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Campaign Forecast
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My History
                </button>
              </li>
            </ul>
          </div>

          {/* Model Specs & Backend */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">Our Services</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Deposit Prediction</span>
                <span className="text-slate-500 text-[10px]">Customer Insights</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300">Campaign Forecast</span>
                <span className="text-slate-500 text-[10px]">Campaign Trends</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Our Services</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <span className="text-slate-400">Easy &amp; Secure Processing</span>
              </li>
            </ul>
          </div>

          {/* Deployed Backend & System Info */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">App Status</h4>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">App Status:</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Connection Status: <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-[11px]">
              <button
                onClick={() => onNavigate('contact')}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Contact Support
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onNavigate('profile')}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Account Settings
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 Bank Marketing ML Platform. Bank Marketing Prediction &amp; Forecast.</p>
          <p className="flex items-center gap-2">
            <span>Production Blueprint</span>
            <span>•</span>
            <span>Strict Feature Parity</span>
            <span>•</span>
            <span>No Unsolicited API Inventions</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
