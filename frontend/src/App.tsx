/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ActiveResultState,
  HistoryRecord,
  PageId,
  UserProfile,
} from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictionPage } from './pages/PredictionPage';
import { ForecastPage } from './pages/ForecastPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { BrainCircuit, Loader2 } from 'lucide-react';

const PROTECTED_PAGES: PageId[] = [
  'dashboard',
  'predict',
  'forecast',
  'results',
  'history',
  'profile',
];

function AppContent() {
  const { user, loading, logout, updateUserContext, setIntendedPage } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  const [activeResult, setActiveResult] = useState<ActiveResultState | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bank_marketing_ml_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customBackendUrl, setCustomBackendUrl] = useState<string>(
    'https://bank-marketing-fastapi.onrender.com'
  );

  // Route protection enforcement
  useEffect(() => {
    if (!loading) {
      if (!user && PROTECTED_PAGES.includes(currentPage)) {
        setIntendedPage(currentPage);
        setCurrentPage('signin');
      }
    }
  }, [loading, user, currentPage, setIntendedPage]);

  const handleNavigate = (page: PageId) => {
    // If not authenticated and trying to reach a protected page, redirect to signin
    if (!user && PROTECTED_PAGES.includes(page)) {
      setIntendedPage(page);
      setCurrentPage('signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    handleNavigate('home');
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    updateUserContext(updated);
  };

  const handleRecordHistory = (record: HistoryRecord) => {
    setHistoryRecords((prev) => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem('bank_marketing_ml_history', JSON.stringify(updated.slice(0, 50)));
      } catch {
        // quota ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    try {
      localStorage.removeItem('bank_marketing_ml_history');
    } catch {
      // ignore
    }
  };

  // Prevent flash of protected routes while Firebase Auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4 px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BrainCircuit className="w-7 h-7 animate-pulse" />
          </div>
          <Loader2 className="w-20 h-20 text-emerald-500/30 animate-spin absolute" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold text-slate-200">Verifying Institutional Session</h2>
          <p className="text-xs text-slate-500">Checking Firebase authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}

        {currentPage === 'signin' && (
          <SignInPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'signup' && (
          <SignUpPage onNavigate={handleNavigate} />
        )}

        {/* Protected Routes */}
        {user && currentPage === 'dashboard' && (
          <DashboardPage
            user={user}
            onNavigate={handleNavigate}
            customBackendUrl={customBackendUrl}
          />
        )}

        {user && currentPage === 'predict' && (
          <PredictionPage
            onNavigate={handleNavigate}
            onRecordHistory={handleRecordHistory}
            onSetActiveResult={setActiveResult}
            customBackendUrl={customBackendUrl}
          />
        )}

        {user && currentPage === 'forecast' && (
          <ForecastPage
            onNavigate={handleNavigate}
            onRecordHistory={handleRecordHistory}
            onSetActiveResult={setActiveResult}
            customBackendUrl={customBackendUrl}
          />
        )}

        {user && currentPage === 'results' && (
          <ResultsPage
            activeResult={activeResult}
            onNavigate={handleNavigate}
          />
        )}

        {user && currentPage === 'history' && (
          <HistoryPage
            historyRecords={historyRecords}
            onClearHistory={handleClearHistory}
            onNavigate={handleNavigate}
          />
        )}

        {user && currentPage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
