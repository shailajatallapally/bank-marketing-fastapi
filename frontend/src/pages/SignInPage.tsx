import React, { useState } from 'react';
import { PageId } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { mapFirebaseAuthError } from '../lib/firebase';
import { Lock, Mail, Eye, EyeOff, LogIn, ShieldCheck, Loader2, AlertCircle, Info } from 'lucide-react';

interface SignInPageProps {
  onNavigate: (page: PageId) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { signIn, signInGoogle, isFirebaseConfigured, intendedPage, setIntendedPage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const destination = intendedPage || 'dashboard';
      setIntendedPage(null);
      onNavigate(destination);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const code = err?.code || '';
      const message = code ? mapFirebaseAuthError(code) : (err?.message || 'Failed to authenticate. Please check your credentials.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInGoogle();
      const destination = intendedPage || 'dashboard';
      setIntendedPage(null);
      onNavigate(destination);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const code = err?.code || '';
      const message = code ? mapFirebaseAuthError(code) : (err?.message || 'Google authentication was not completed.');
      setError(message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Institutional Portal Access
        </Badge>
        <h1 className="text-2xl font-bold text-slate-100">Sign in to Bank Marketing ML Platform</h1>
        <p className="text-xs text-slate-400">
          Access the XGBoost Term Deposit Classifier &amp; VAR(2) Forecaster
        </p>
      </div>

      <Card>
        {/* Firebase Config Notice if environment variables are not yet populated */}
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

        {intendedPage && (
          <div className="mb-4 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Please sign in to access the requested page: <strong className="capitalize text-blue-200">{intendedPage}</strong></span>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full pl-9 pr-10 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submit-signin-btn"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating with Firebase...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Email</span>
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or Federated Authentication</span>
            </div>
          </div>

          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
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
                <span>Continue with Google Sign-In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Need platform authorization? </span>
          <button
            onClick={() => onNavigate('signup')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Create an Account
          </button>
        </div>
      </Card>
    </div>
  );
};
