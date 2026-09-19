import React, { useState } from 'react';
import { PageId } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { mapFirebaseAuthError } from '../lib/firebase';
import { Lock, Mail, User, ShieldCheck, UserPlus, Loader2, AlertCircle, Info } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: PageId) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, signInGoogle, isFirebaseConfigured, intendedPage, setIntendedPage, updateUserContext } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Marketing Analytics Specialist');
  const [organization, setOrganization] = useState('Bank Marketing Analytics');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your full name or professional handle.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a properly formatted email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords entered do not match. Please verify.');
      return;
    }

    if (!agreed) {
      setError('You must accept the institutional data governance terms to proceed.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signUp(name.trim(), email.trim(), password);
      // Update custom role & organization in user profile
      updateUserContext({ role, organization });
      const destination = intendedPage || 'dashboard';
      setIntendedPage(null);
      onNavigate(destination);
    } catch (err: any) {
      console.error('Sign-up error:', err);
      const code = err?.code || '';
      const message = code ? mapFirebaseAuthError(code) : (err?.message || 'Failed to create account. Please check your inputs.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInGoogle();
      updateUserContext({ role, organization });
      const destination = intendedPage || 'dashboard';
      setIntendedPage(null);
      onNavigate(destination);
    } catch (err: any) {
      console.error('Google Sign-up error:', err);
      const code = err?.code || '';
      const message = code ? mapFirebaseAuthError(code) : (err?.message || 'Google account creation was not completed.');
      setError(message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="blue" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Institutional Account Provisioning
        </Badge>
        <h1 className="text-2xl font-bold text-slate-100">Register for Bank Marketing ML Platform</h1>
        <p className="text-xs text-slate-400">
          Provision an analytical workspace for deposit propensity &amp; campaign forecasting
        </p>
      </div>

      <Card>
        {!isFirebaseConfigured && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Firebase Environment Setup Required</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Add your Firebase project secrets (<code className="font-mono text-amber-100">VITE_FIREBASE_API_KEY</code>, <code className="font-mono text-amber-100">VITE_FIREBASE_PROJECT_ID</code>, etc.) in your environment to connect to your production Firebase Auth project.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Legal / Professional Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Analytical Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value="Quantitative Analyst">Quantitative Analyst</option>
                <option value="Marketing Analytics Specialist">Marketing Analytics Specialist</option>
                <option value="Deposit Portfolio Manager">Deposit Portfolio Manager</option>
                <option value="Lead ML Engineer">Lead ML Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Min. 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm</label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isSubmitting || isGoogleSubmitting}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight">
              I agree to the institutional bank model usage terms and acknowledge that predictions must be audited in accordance with fair lending guidelines.
            </label>
          </div>

          <button
            type="submit"
            id="submit-signup-btn"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Firebase Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Firebase Account</span>
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or Federated Registration</span>
            </div>
          </div>

          <button
            type="button"
            id="google-signup-btn"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.92 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                  />
                </svg>
                <span>Sign Up with Google</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Already hold credentials? </span>
          <button
            onClick={() => onNavigate('signin')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Sign In Here
          </button>
        </div>
      </Card>
    </div>
  );
};
