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
  viewMode: 'operations' | 'driver';
  onToggleViewMode: () => void;
  onNavigateToAuth: () => void;
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
  viewMode,
  onToggleViewMode,
  onNavigateToAuth,
}: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="command-header">
      {/* Brand / Logo */}
      <div className="brand-badge">
        <div className="brand-icon" aria-label="SauraRoute Logo">
          SR
        </div>
        <div className="brand-text-block">
          <div className="brand-title">SauraRoute</div>
          <div className="brand-subtitle">North Eastern Region Corridor Intelligence</div>
        </div>
      </div>

      {/* Center Operational Telemetry (Desktop / Tablet) */}
      <div
        style={{
          display: viewMode === 'driver' ? 'none' : 'flex',
        }}
        className="desktop-telemetry"
      >
        <div className="tag-badge telemetry-badge-region">
          <span className="telemetry-label">REGION</span>
          <span className="telemetry-val-accent">NER Corridors</span>
        </div>

        <div className="tag-badge">
          <span className="telemetry-label">FLEET</span>
          <span className="telemetry-val">{vehicleCount} Active</span>
        </div>

        <div className="tag-badge">
          <span className="telemetry-label">INCIDENTS</span>
          <span
            className="telemetry-val"
            style={{ color: incidentCount > 0 ? 'var(--status-caution)' : 'var(--text-muted)' }}
          >
            {incidentCount} Reported
          </span>
        </div>

        <div className="tag-badge">
          <span className="telemetry-label">HAZARDS</span>
          <span className="telemetry-val">{hazardZoneCount} Zones</span>
        </div>

        <div className="tag-badge telemetry-badge-corridors">
          <span className="telemetry-label">CORRIDORS</span>
          <span className="telemetry-val">{accessibilityCount} Monitored</span>
        </div>
      </div>

      {/* Right Actions & Live Status */}
      <div className="header-right-actions">
        {viewMode === 'operations' && (
          <div className="header-panel-toggles">
            <button
              type="button"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`btn-preset ${showLeftPanel ? 'active' : ''}`}
              title={showLeftPanel ? 'Hide Route Planner' : 'Show Route Planner'}
            >
              Planner
            </button>

            <button
              type="button"
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`btn-preset ${showRightPanel ? 'active' : ''}`}
              title={showRightPanel ? 'Hide Intelligence Panel' : 'Show Intelligence Panel'}
            >
              Intelligence
            </button>

            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className={`btn-preset ${showLegend ? 'active' : ''}`}
              title={showLegend ? 'Hide Map Legend' : 'Show Map Legend'}
            >
              Legend
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleViewMode}
          className="btn-preset header-mode-btn"
          title={viewMode === 'operations' ? 'Switch to Driver Turn-by-Turn' : 'Switch to Command Center'}
        >
          <Icon name={viewMode === 'driver' ? 'terminal' : 'truck'} size={14} />
          <span className="header-mode-text">{viewMode === 'driver' ? 'Console' : 'Driver Mode'}</span>
        </button>

        {/* Authentication State & Direct Route Navigation */}
        {isAuthenticated && user ? (
          <div className="auth-user-badge-container">
            <button
              type="button"
              className="auth-user-pill"
              onClick={onNavigateToAuth}
              title={`Logged in as ${user.email} (${user.role}). Click for Officer Account details.`}
            >
              <div className="auth-user-avatar">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="auth-user-name">
                {user.email.split('@')[0]}
              </span>
              <span className={`auth-user-role-tag ${user.role}`}>
                {user.role === 'field_officer'
                  ? 'Field'
                  : user.role === 'district_admin'
                  ? 'Admin'
                  : 'MDoNER'}
              </span>
            </button>
            <button
              type="button"
              className="auth-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <Icon name="log-out" size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onNavigateToAuth}
            className="btn-preset btn-auth-signin"
            title="Sign In or Register Official Account on /auth"
          >
            <Icon name="lock" size={13} />
            <span>Sign In</span>
          </button>
        )}

        <div className={`status-pill ${isLive ? 'live' : 'disconnected'}`} title={`Telemetry feed: ${lastUpdated}`}>
          <span className="status-pulse" />
          <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}
