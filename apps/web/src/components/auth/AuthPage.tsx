import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icon';
import type { UserRole } from '../../types/auth';

interface AuthPageProps {
  onBackToDashboard: () => void;
}

const DEMO_ACCOUNTS = [
  {
    label: 'Field Officer',
    badge: 'Ground Operations',
    email: 'field@sauraroute.gov.in',
    role: 'field_officer' as UserRole,
    description: 'Road damage surveys, geo-tagged photo uploads & incident reporting',
    icon: 'shield' as const,
    color: '#34D399',
  },
  {
    label: 'District Admin',
    badge: 'Corridor Control',
    email: 'district@sauraroute.gov.in',
    role: 'district_admin' as UserRole,
    description: 'Highway restrictions, corridor closures & emergency rerouting',
    icon: 'terminal' as const,
    color: '#F59E0B',
  },
  {
    label: 'MDoNER Admin',
    badge: 'Central Ministry',
    email: 'mdoner@sauraroute.gov.in',
    role: 'mdoner_admin' as UserRole,
    description: 'NER-wide logistics monitoring & ministerial oversight',
    icon: 'map' as const,
    color: '#60A5FA',
  },
];

export default function AuthPage({ onBackToDashboard }: AuthPageProps) {
  const { login, register, isLoading, error, clearError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('field_officer');
  const [formError, setFormError] = useState<string | null>(null);

  const handleTabSwitch = (newMode: 'signin' | 'register') => {
    setMode(newMode);
    setFormError(null);
    clearError();
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SauraRoute2026!');
    setFormError(null);
    clearError();

    const success = await login(demoEmail, 'SauraRoute2026!');
    if (success) {
      onBackToDashboard();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid official email address.');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters in length.');
      return;
    }

    if (mode === 'signin') {
      const success = await login(email, password);
      if (success) {
        onBackToDashboard();
      }
    } else {
      const success = await register(email, password, selectedRole);
      if (success) {
        onBackToDashboard();
      }
    }
  };

  const activeError = formError || error;

  return (
    <div className="auth-page-container">
      {/* Top Navbar */}
      <header className="auth-page-header">
        <div className="brand-badge">
          <div className="brand-icon" aria-hidden="true">
            SR
          </div>
          <div>
            <div className="brand-title">SauraRoute</div>
            <div className="brand-subtitle">North Eastern Region Corridor Intelligence</div>
          </div>
        </div>
        <button
          type="button"
          className="btn-preset"
          onClick={onBackToDashboard}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="map" size={14} />
          <span>Return to Map Console</span>
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="auth-page-main">
        <div className="auth-page-card">
          <div className="auth-page-card-header">
            <div className="auth-page-icon-wrapper">
              <Icon name="lock" size={24} color="var(--accent-action)" />
            </div>
            <h1 className="auth-page-title">
              {mode === 'signin' ? 'Sign In to SauraRoute' : 'Register Official Account'}
            </h1>
            <p className="auth-page-subtitle">
              {mode === 'signin'
                ? 'Access your corridor monitoring, dispatch controls, and GIS safety intelligence.'
                : 'Create an authorized officer account with role-based access to field intelligence.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('signin')}
            >
              <Icon name="lock" size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              <Icon name="user" size={14} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="auth-demo-section">
            <div className="auth-demo-label">
              <Icon name="key" size={12} color="var(--accent-action)" />
              <span>ONE-TAP DEMO ROLES (CLICK TO LOG IN)</span>
            </div>
            <div className="auth-demo-grid">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="auth-demo-card"
                  onClick={() => handleDemoLogin(account.email)}
                  title={`Log in as ${account.label}`}
                  disabled={isLoading}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="auth-demo-role" style={{ color: account.color }}>
                      {account.label}
                    </span>
                    <span className="auth-demo-badge">{account.badge}</span>
                  </div>
                  <div className="auth-demo-email">{account.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="auth-error-banner" role="alert">
              <Icon name="alert-triangle" size={16} color="#EF4444" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="page-auth-email">
                Official Email
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon name="user" size={15} color="var(--text-muted)" />
                </span>
                <input
                  id="page-auth-email"
                  type="email"
                  className="auth-text-input"
                  placeholder="officer@sauraroute.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-input-label" htmlFor="page-auth-password">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon name="lock" size={15} color="var(--text-muted)" />
                </span>
                <input
                  id="page-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Role Picker during Registration */}
            {mode === 'register' && (
              <div className="auth-input-group">
                <label className="auth-input-label">Select Authorized Role</label>
                <div className="auth-role-selection-grid">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedRole === acc.role;
                    return (
                      <div
                        key={acc.role}
                        className={`auth-role-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedRole(acc.role)}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <div className="auth-role-item-header">
                          <span className="auth-role-item-title" style={{ color: isSelected ? acc.color : undefined }}>
                            {acc.label}
                          </span>
                          {isSelected && <span className="auth-role-check">✓</span>}
                        </div>
                        <p className="auth-role-item-desc">{acc.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-btn-loading">
                  <Icon name="refresh" size={16} className="spin" />
                  <span>Authenticating...</span>
                </span>
              ) : mode === 'signin' ? (
                <span>Sign In to Console</span>
              ) : (
                <span>Create Authorized Account</span>
              )}
            </button>
          </form>

          <div className="auth-modal-footer">
            <span>Ministry of Development of North Eastern Region (MDoNER) &bull; SIH26002</span>
          </div>
        </div>
      </main>
    </div>
  );
}
