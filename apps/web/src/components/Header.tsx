import type { Dispatch, SetStateAction } from 'react';
import { Icon } from './common/Icon';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isLive: boolean;
  vehicleCount: number;
  incidentCount: number;
  hazardZoneCount: number;
  accessibilityCount: number;
  lastUpdated: string;
  showLeftPanel: boolean;
  setShowLeftPanel: Dispatch<SetStateAction<boolean>>;
  showRightPanel: boolean;
  setShowRightPanel: Dispatch<SetStateAction<boolean>>;
  showLegend: boolean;
  setShowLegend: Dispatch<SetStateAction<boolean>>;
  showAuthPanel?: boolean;
  setShowAuthPanel?: Dispatch<SetStateAction<boolean>>;
  viewMode: 'operations' | 'driver';
  onToggleViewMode: () => void;
  onOpenAuth?: () => void;
}

export default function Header({
  isLive,
  vehicleCount,
  incidentCount,
  hazardZoneCount,
  accessibilityCount,
  lastUpdated,
  showLeftPanel,
  setShowLeftPanel,
  showRightPanel,
  setShowRightPanel,
  showLegend,
  setShowLegend,
  showAuthPanel,
  setShowAuthPanel,
  viewMode,
  onToggleViewMode,
  onOpenAuth,
}: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <header className="command-header">
      {/* Brand / Logo */}
      <div className="brand-badge">
        <div className="brand-icon" aria-label="SauraRoute Logo">
          SR
        </div>
        <div>
          <div className="brand-title">SauraRoute</div>
          <div className="brand-subtitle">North Eastern Region Corridor Intelligence</div>
        </div>
      </div>

      {/* Center Operational Telemetry (Desktop / Tablet) */}
      <div
        style={{
          display: viewMode === 'driver' ? 'none' : 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        className="desktop-telemetry"
      >
        <div className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>REGION</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-action)' }}>NER Corridors</span>
        </div>

        <div className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>FLEET</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vehicleCount} Active</span>
        </div>

        <div className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>INCIDENTS</span>
          <span style={{ fontWeight: 600, color: incidentCount > 0 ? 'var(--status-caution)' : 'var(--text-muted)' }}>
            {incidentCount} Reported
          </span>
        </div>

        <div className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>HAZARD ZONES</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hazardZoneCount} Zones</span>
        </div>

        <div className="tag-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>CORRIDORS</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{accessibilityCount} Monitored</span>
        </div>
      </div>

      {/* Right Actions & Live Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {viewMode === 'operations' && (
          <>
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`btn-preset ${showLeftPanel ? 'active' : ''}`}
              title={showLeftPanel ? 'Hide Route Planner' : 'Show Route Planner'}
            >
              Planner
            </button>

            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`btn-preset ${showRightPanel ? 'active' : ''}`}
              title={showRightPanel ? 'Hide Intelligence Panel' : 'Show Intelligence Panel'}
            >
              Intelligence
            </button>

            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`btn-preset ${showLegend ? 'active' : ''}`}
              title={showLegend ? 'Hide Map Legend' : 'Show Map Legend'}
            >
              Legend
            </button>

            {setShowAuthPanel && (
              <button
                onClick={() => setShowAuthPanel(!showAuthPanel)}
                className={`btn-preset ${showAuthPanel ? 'active' : ''}`}
                title={showAuthPanel ? 'Hide Access Control Panel' : 'Show Access Control Panel'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  borderColor: isAuthenticated ? 'var(--status-safe)' : 'var(--accent-action)',
                  color: isAuthenticated ? '#4ADE80' : 'var(--accent-action)',
                  fontWeight: 600,
                }}
              >
                <Icon name="lock" size={13} />
                <span>
                  {isAuthenticated
                    ? user?.role === 'field_officer'
                      ? 'Field Officer'
                      : user?.role === 'district_admin'
                      ? 'District Admin'
                      : 'MDoNER Admin'
                    : 'Access Control'}
                </span>
              </button>
            )}
          </>
        )}

        <button
          onClick={onToggleViewMode}
          className="btn-preset"
          title={viewMode === 'operations' ? 'Switch to Driver Mode' : 'Switch to Command Center'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            borderColor: viewMode === 'driver' ? 'var(--status-safe)' : 'var(--accent-action)',
            color: viewMode === 'driver' ? '#4ADE80' : 'var(--accent-action)',
          }}
        >
          <Icon name={viewMode === 'driver' ? 'terminal' : 'truck'} size={14} />
          <span>{viewMode === 'driver' ? 'Operations Console' : 'Driver Mode'}</span>
        </button>

        {/* Authentication State */}
        {isAuthenticated && user ? (
          <div className="auth-user-badge-container">
            <div
              className="auth-user-pill"
              onClick={onOpenAuth}
              title={`Logged in as ${user.email} (${user.role})`}
            >
              <Icon name="user" size={13} color="var(--accent-action)" />
              <span className="auth-user-name" style={{ fontWeight: 600 }}>
                {user.email.split('@')[0]}
              </span>
              <span className={`auth-user-role-tag ${user.role}`}>
                {user.role === 'field_officer'
                  ? 'Field Officer'
                  : user.role === 'district_admin'
                  ? 'District Admin'
                  : 'MDoNER'}
              </span>
            </div>
            <button
              type="button"
              className="auth-logout-btn"
              onClick={logout}
              title="Sign Out of Session"
            >
              <Icon name="log-out" size={13} />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="btn-preset btn-auth-signin"
            title="Sign In or Register Official Account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="lock" size={14} />
            <span>Sign In</span>
          </button>
        )}

        <div className={`status-pill ${isLive ? 'live' : 'disconnected'}`} title={`Last refreshed: ${lastUpdated}`}>
          <span className="status-pulse" />
          <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}
