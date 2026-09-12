import type { Dispatch, SetStateAction } from 'react';
import { Icon } from './common/Icon';

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
}: HeaderProps) {
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

        <div className={`status-pill ${isLive ? 'live' : 'disconnected'}`} title={`Last refreshed: ${lastUpdated}`}>
          <span className="status-pulse" />
          <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}
