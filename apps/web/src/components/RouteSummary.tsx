import type { CandidateRouteProfile } from '../types/api';
import { RISK_LEVEL_THEME, RISK_LEVEL_FILL } from '../config/map-theme';
import { Icon } from './common/Icon';

interface RouteSummaryProps {
  selectedRoute: CandidateRouteProfile;
  strategy: 'SAFETY_OPTIMIZED' | 'SPEED_BASELINE';
  preference: string;
}

export default function RouteSummary({ selectedRoute, strategy, preference }: RouteSummaryProps) {
  const distanceKm = (selectedRoute.distanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(selectedRoute.durationSeconds / 60);
  const hours = Math.floor(durationMin / 60);
  const remainingMins = durationMin % 60;
  const durationText = hours > 0 ? `${hours}h ${remainingMins}m` : `${durationMin} min`;

  const risk = selectedRoute.risk;
  const riskTheme = RISK_LEVEL_THEME[risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM;
  const riskFill = RISK_LEVEL_FILL[risk.overallLevel] ?? RISK_LEVEL_FILL.MEDIUM;

  return (
    <div className="intel-card card-primary">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="route" size={15} style={{ color: 'var(--accent-action)' }} />
          <span>Selected Route Intelligence</span>
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <span className="tag-badge">{preference}</span>
          <span
            className="tag-badge"
            style={{
              color: strategy === 'SAFETY_OPTIMIZED' ? '#4ADE80' : 'var(--text-secondary)',
              borderColor: strategy === 'SAFETY_OPTIMIZED' ? 'rgba(46, 139, 87, 0.5)' : 'var(--border-subtle)',
            }}
          >
            {strategy === 'SAFETY_OPTIMIZED' ? 'Safety Optimized' : 'Speed Baseline'}
          </span>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {/* Distance Card */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-card-inset)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            Distance
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-primary)', marginTop: 2 }} className="metric-value">
            {distanceKm} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>km</span>
          </div>
        </div>

        {/* ETA Card */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-card-inset)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            Estimated Travel
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-primary)', marginTop: 2 }} className="metric-value">
            {durationText}
          </div>
        </div>
      </div>

      {/* Safety Risk Highlight Card */}
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: `${riskFill}15`,
          border: `1px solid ${riskFill}40`,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.3, textTransform: 'uppercase' }}>
            Risk Assessment
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: riskFill, marginTop: 2 }}>
            <span>{riskTheme.label}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 6 }}>
              Primary concern: {risk.dominantTrigger}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: riskFill,
              lineHeight: 1,
            }}
          >
            {risk.meanScore.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
            Peak: {risk.maxScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Waypoint sampling detail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#94A3B8' }}>
        <span>Sampled points: {risk.sampledWaypointsCount}</span>
        <span>
          Hazardous segments: <strong style={{ color: risk.hazardousSegmentCount > 0 ? '#F87171' : '#34D399' }}>{risk.hazardousSegmentCount}</strong>
        </span>
      </div>
    </div>
  );
}
