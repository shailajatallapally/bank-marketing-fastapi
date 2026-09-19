import React, { useState } from 'react';
import { PageId } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Mail, CheckCircle2, Send, Building, Shield, LifeBuoy } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    department: 'ML Engineering',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <Badge variant="blue" icon={<Mail className="w-3.5 h-3.5" />}>
          Institutional Support &amp; Engineering
        </Badge>
        <h1 className="text-3xl font-bold text-slate-100">Contact ML Operations &amp; Support</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Inquiries regarding API access quotas, model threshold recalibration, or integration with internal core banking systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="space-y-4">
          <Card title="Direct Channels" className="text-xs space-y-3">
            <div className="space-y-1">
              <span className="text-slate-500 block">Engineering Desk</span>
              <span className="text-slate-200 font-mono text-[11px]">ml-ops@bankmarketing.internal</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">FastAPI Gateway</span>
              <span className="text-slate-200 font-mono text-[11px]">bank-marketing-fastapi.onrender.com</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">SLA &amp; Uptime</span>
              <span className="text-emerald-400 font-semibold">99.9% Production Target</span>
            </div>
          </Card>

          <Card title="Security &amp; Governance" className="text-xs space-y-2">
            <p className="text-slate-400 leading-relaxed text-[11px]">
              All prediction queries pass through encrypted HTTPS channels. No sensitive financial client PII is logged to persistent external caches.
            </p>
          </Card>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2">
          <Card>
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Inquiry Dispatched Successfully</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-slate-200 font-semibold">{formData.name}</span>. Your dispatch has been routed to our <span className="text-emerald-400">{formData.department}</span> team.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      organization: '',
                      department: 'ML Engineering',
                      message: '',
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-semibold text-slate-100">Send Technical Transmission</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Corporate Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@bank.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Financial Institution / Entity
                    </label>
                    <input
                      type="text"
                      placeholder="Commercial Bank / Financial Firm"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ML Engineering">ML Engineering &amp; Retraining</option>
                      <option value="Campaign Operations">Marketing Campaign Operations</option>
                      <option value="API Access">FastAPI Dedicated Quotas</option>
                      <option value="Security & Compliance">Compliance &amp; Data Ethics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Message / Inquiry Details <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your query, model integration requirements, or system anomaly..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
