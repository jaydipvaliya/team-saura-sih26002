import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './common/Icon';
import type { UserRole } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';

const DEMO_ACCOUNTS = [
  {
    label: 'Field Officer',
    badge: 'Ground Ops',
    email: 'field@sauraroute.gov.in',
    role: 'field_officer' as UserRole,
    description: 'Road damage surveys, geo-tagged photo uploads & incident reporting',
    color: '#34D399',
    icon: 'shield' as const,
  },
  {
    label: 'District Admin',
    badge: 'Corridor Control',
    email: 'district@sauraroute.gov.in',
    role: 'district_admin' as UserRole,
    description: 'Highway restrictions, corridor closures & emergency rerouting',
    color: '#F59E0B',
    icon: 'terminal' as const,
  },
  {
    label: 'MDoNER Admin',
    badge: 'Ministry',
    email: 'mdoner@sauraroute.gov.in',
    role: 'mdoner_admin' as UserRole,
    description: 'NER-wide logistics monitoring & ministerial oversight',
    color: '#60A5FA',
    icon: 'map' as const,
  },
];

interface AuthPanelProps {
  onIncidentReported?: () => void;
}

export default function AuthPanel({ onIncidentReported }: AuthPanelProps) {
  const { user, isAuthenticated, login, register, logout, isLoading, error, clearError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('field_officer');
  const [formError, setFormError] = useState<string | null>(null);

  // Field Officer Quick Incident Report State
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incType, setIncType] = useState('LANDSLIDE');
  const [incSeverity, setIncSeverity] = useState('HIGH');
  const [incDesc, setIncDesc] = useState('');
  const [incLat, setIncLat] = useState('25.9021');
  const [incLon, setIncLon] = useState('91.8012');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [incidentSuccessMsg, setIncidentSuccessMsg] = useState<string | null>(null);
  const [incidentErrorMsg, setIncidentErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SauraRoute2026!');
    setFormError(null);
    clearError();
    await login(demoEmail, 'SauraRoute2026!');
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
      await login(email, password);
    } else {
      await register(email, password, selectedRole);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIncident(true);
    setIncidentSuccessMsg(null);
    setIncidentErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('type', incType);
      formData.append('severity', incSeverity);
      formData.append('description', incDesc.trim() || 'Field incident report');
      formData.append('latitude', incLat);
      formData.append('longitude', incLon);
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      const res = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit incident');
      }

      setIncidentSuccessMsg(`Incident reported successfully! ID: ${json.data?.id}${json.data?.photoUrl ? ' (Photo attached)' : ''}`);
      setIncDesc('');
      setSelectedPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onIncidentReported) onIncidentReported();
    } catch (err) {
      setIncidentErrorMsg((err as Error).message);
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const activeError = formError || error;

  return (
    <div className="intel-card auth-panel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="lock" size={15} color="var(--accent-action)" />
          <span>Access &amp; Role Intelligence</span>
        </span>
        <span
          className="auth-status-chip"
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 700,
            background: isAuthenticated ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isAuthenticated ? '#34D399' : 'var(--accent-action)',
            border: `1px solid ${isAuthenticated ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}
        >
          {isAuthenticated ? 'AUTHENTICATED' : 'GUEST / UNRESTRICTED'}
        </span>
      </div>

      {isAuthenticated && user ? (
        /* Authenticated User View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="auth-profile-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="auth-avatar-circle">
                  <Icon name="user" size={18} color="var(--accent-action)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ID: {user.id} &bull; Active Session
                  </div>
                </div>
              </div>
              <span className={`auth-user-role-tag ${user.role}`}>
                {user.role === 'field_officer'
                  ? 'Field Officer'
                  : user.role === 'district_admin'
                  ? 'District Admin'
                  : 'MDoNER Admin'}
              </span>
            </div>

            <div className="auth-role-desc-box">
              {user.role === 'field_officer' && (
                <div>
                  <span style={{ fontWeight: 600, color: '#34D399' }}>Ground Operations Scope: </span>
                  Authorized for route surveys, hazard confirmation, road damage reporting, and geo-tagged photograph uploads.
                </div>
              )}
              {user.role === 'district_admin' && (
                <div>
                  <span style={{ fontWeight: 600, color: '#F59E0B' }}>District Admin Scope: </span>
                  Authorized for corridor restrictions, closure enforcement (OPEN/RESTRICTED/CLOSED), and reroute advisories.
                </div>
              )}
              {user.role === 'mdoner_admin' && (
                <div>
                  <span style={{ fontWeight: 600, color: '#60A5FA' }}>Central Ministry Scope: </span>
                  Regional corridor oversight across all 8 North Eastern States, inter-state freight logistics, and central audit.
                </div>
              )}
            </div>
          </div>

          {/* Role-Specific Capabilities */}
          {user.role === 'field_officer' && (
            <div className="auth-officer-tool-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="mountain" size={14} color="#34D399" />
                  <span>Field Officer: Upload Incident &amp; Photo</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowIncidentForm(!showIncidentForm)}
                  className="btn-preset"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  {showIncidentForm ? 'Hide Form' : 'New Report'}
                </button>
              </div>

              {showIncidentForm && (
                <form onSubmit={handleCreateIncident} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {incidentSuccessMsg && (
                    <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: 8, borderRadius: 6, fontSize: 11, color: '#34D399' }}>
                      {incidentSuccessMsg}
                    </div>
                  )}
                  {incidentErrorMsg && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 8, borderRadius: 6, fontSize: 11, color: '#FCA5A5' }}>
                      {incidentErrorMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Type</label>
                      <select
                        value={incType}
                        onChange={(e) => setIncType(e.target.value)}
                        className="auth-text-input"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                      >
                        <option value="LANDSLIDE">LANDSLIDE</option>
                        <option value="FLOOD">FLOOD</option>
                        <option value="ROAD_DAMAGE">ROAD DAMAGE</option>
                        <option value="ACCIDENT">ACCIDENT</option>
                        <option value="BLOCKAGE">BLOCKAGE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Severity</label>
                      <select
                        value={incSeverity}
                        onChange={(e) => setIncSeverity(e.target.value)}
                        className="auth-text-input"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Description</label>
                    <input
                      type="text"
                      value={incDesc}
                      onChange={(e) => setIncDesc(e.target.value)}
                      placeholder="e.g. Major mudslide blocking NH-40"
                      className="auth-text-input"
                      style={{ padding: '6px 8px', fontSize: 12 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Latitude</label>
                      <input
                        type="text"
                        value={incLat}
                        onChange={(e) => setIncLat(e.target.value)}
                        className="auth-text-input"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Longitude</label>
                      <input
                        type="text"
                        value={incLon}
                        onChange={(e) => setIncLon(e.target.value)}
                        className="auth-text-input"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Attach Photo (Image up to 5MB)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
                      style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: 'block', width: '100%' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingIncident}
                    className="auth-submit-btn"
                    style={{ padding: '7px 12px', fontSize: 12 }}
                  >
                    {isSubmittingIncident ? 'Submitting Report...' : 'Publish Geo-Tagged Incident'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sign Out / Switch Session */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JWT Authenticated Session</span>
            <button
              type="button"
              onClick={logout}
              className="auth-logout-btn"
              style={{ padding: '5px 10px' }}
            >
              <Icon name="log-out" size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Unauthenticated View: Sign In / Register directly in panel */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Quick Demo Access Pills */}
          <div className="auth-demo-section" style={{ padding: 8 }}>
            <div className="auth-demo-label" style={{ fontSize: 9 }}>
              <Icon name="key" size={11} color="var(--accent-action)" />
              <span>ONE-TAP DEMO ROLES (CLICK TO INSTANTLY SIGN IN)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  className="auth-demo-card"
                  onClick={() => handleDemoLogin(acc.email)}
                  disabled={isLoading}
                  style={{ padding: '6px 7px' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: acc.color }}>{acc.label}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{acc.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="auth-tabs" style={{ padding: 2 }}>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setMode('signin');
                setFormError(null);
                clearError();
              }}
              style={{ padding: '5px 10px', fontSize: 12 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setFormError(null);
                clearError();
              }}
              style={{ padding: '5px 10px', fontSize: 12 }}
            >
              Register Account
            </button>
          </div>

          {activeError && (
            <div className="auth-error-banner" style={{ padding: '6px 10px', fontSize: 11 }}>
              <Icon name="alert-triangle" size={14} color="#EF4444" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>
                Official Email
              </label>
              <input
                type="email"
                className="auth-text-input"
                style={{ padding: '7px 10px', fontSize: 12 }}
                placeholder="officer@sauraroute.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Password</label>
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-text-input"
                style={{ padding: '7px 10px', fontSize: 12 }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Select Role
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.role}
                      onClick={() => setSelectedRole(acc.role)}
                      className={`auth-role-item ${selectedRole === acc.role ? 'selected' : ''}`}
                      style={{ padding: '6px 10px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: selectedRole === acc.role ? acc.color : 'var(--text-primary)' }}>
                          {acc.label}
                        </span>
                        {selectedRole === acc.role && <span style={{ color: 'var(--accent-action)', fontSize: 12 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{acc.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              style={{ padding: '8px', fontSize: 12 }}
            >
              {isLoading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Console' : 'Register Account'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
