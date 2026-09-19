import React, { useState } from 'react';
import { PageId, UserProfile } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  User,
  Mail,
  Building,
  Shield,
  Server,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Database,
  Calendar,
  KeyRound,
  Loader2,
} from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => Promise<void> | void;
  onLogout: () => void;
  onNavigate: (page: PageId) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onNavigate,
}) => {
  // If displayName is unavailable, use the email or a generic "Account" label. Never invent a user name.
  const initialDisplayName = user.name && user.name !== 'User' ? user.name : '';
  const [name, setName] = useState(initialDisplayName);
  const [role, setRole] = useState(
    user.role && user.role !== 'Quantitative Analyst'
      ? user.role
      : 'Data Science Learner'
  );
  const [organization, setOrganization] = useState(
    user.organization && !user.organization.includes('Apex')
      ? user.organization
      : 'Bank Marketing Analytics'
  );
  const [backendUrl, setBackendUrl] = useState('https://bank-marketing-fastapi.onrender.com');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  React.useEffect(() => {
    if (user.name && user.name !== 'User') {
      setName(user.name);
    }
    setRole(
      user.role && user.role !== 'Quantitative Analyst'
        ? user.role
        : 'Data Science Learner'
    );
    setOrganization(
      user.organization && !user.organization.includes('Apex')
        ? user.organization
        : 'Bank Marketing Analytics'
    );
  }, [user.name, user.role, user.organization]);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateUser({
        name: name.trim() || undefined,
        role,
        organization,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute non-fictional display title
  const effectiveDisplayName = name.trim() || user.email || 'Account';

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="emerald" icon={<Shield className="w-3.5 h-3.5" />}>
              Account Settings
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Profile &amp; Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile details and system preferences.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors self-start sm:self-center cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Your profile changes have been saved successfully.</span>
        </div>
      )}

      {/* Security Credentials Summary Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Account Details</h3>
          </div>
          <Badge variant="purple" icon={<Database className="w-3 h-3" />}>
            Secure Storage
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Display Name</span>
            <span className="font-semibold text-slate-200 font-sans">
              {effectiveDisplayName}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Email Address</span>
            <span className="text-slate-200 truncate block">
              {user.email || 'No email registered'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Account ID</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px] truncate select-all">
                {user.id}
              </span>
              <button
                type="button"
                onClick={handleCopyUid}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Copy Account ID"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {user.createdAt && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Member Since: <strong className="text-slate-300 font-normal">{user.createdAt}</strong></span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Personal Information" subtitle="Update your display name, role, and department">
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xl font-bold">
                {effectiveDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-100">{effectiveDisplayName}</p>
                <p className="text-slate-400 text-xs">{user.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="slate">Active Session</Badge>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Protected Account</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Service Connection */}
        <Card
          title="Service Connection"
          subtitle="System service status and connectivity"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-200 font-medium block">Connection Status</span>
                  <span className="text-slate-500 text-[11px]">Backend service connected</span>
                </div>
              </div>
              <Badge variant="emerald">Active</Badge>
            </div>
          </div>
        </Card>

        {/* Save Controls */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Back to Home
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
