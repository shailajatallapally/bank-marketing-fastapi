import React, { useState } from 'react';
import { PageId, UserProfile } from '../../types';
import {
  BrainCircuit,
  TrendingUp,
  History,
  Info,
  Mail,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Server,
  Home,
  Target,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = Boolean(user && user.isAuthenticated);

  // Dynamic authenticated user display (defaults to Shailaja Tallapally as requested)
  const displayUser = isAuthenticated
    ? user?.name?.trim() || (user?.email?.toLowerCase().includes('shailaja') ? 'Shailaja Tallapally' : user?.email ? user.email.split('@')[0] : 'Shailaja Tallapally')
    : 'Account';

  // Navigation links matching friendly terminology
  const navLinks: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'predict', label: 'Deposit Prediction', icon: <Target className="w-4 h-4 text-emerald-400" /> },
    { id: 'forecast', label: 'Campaign Forecast', icon: <TrendingUp className="w-4 h-4 text-blue-400" /> },
    { id: 'dashboard', label: 'Customer Groups', icon: <Users className="w-4 h-4 text-cyan-400" /> },
    { id: 'history', label: 'My History', icon: <History className="w-4 h-4 text-slate-400" /> },
  ];

  const activeNavLinks = navLinks;

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <button
            id="nav-brand-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-100 tracking-tight">
                  Bank Marketing ML Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Bank Marketing Prediction &amp; Forecast</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeNavLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Area: System Status + Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* System Status Indicator */}
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
              title="System connection: https://bank-marketing-fastapi.onrender.com"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Server className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 font-medium">System Connected</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-profile-btn"
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-slate-800 text-emerald-400 border-slate-700'
                      : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayUser}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                      <User className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                  <span className="truncate max-w-[140px]">{displayUser}</span>
                </button>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => handleNavClick('signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => handleNavClick('signup')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-sm transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 px-3 mb-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>System Status</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              Connected
            </span>
          </div>

          {activeNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left ${
                currentPage === link.id
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}

          <div className="pt-3 mt-2 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Profile ({displayUser})</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('signin')}
                  className="w-full py-2 px-3 text-center rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full py-2 px-3 text-center rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
