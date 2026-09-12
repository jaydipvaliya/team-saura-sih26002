import type { CandidateRouteProfile } from '../types/api';
import { RISK_LEVEL_THEME } from '../config/map-theme';
import RouteRiskProfile from './RouteRiskProfile';
import { Icon } from './common/Icon';

interface RiskPanelProps {
  selectedRoute: CandidateRouteProfile;
  safetyStatus?: {
    status: 'AVAILABLE' | 'DEGRADED';
    reason?: string;
  };
}

export default function RiskPanel({ selectedRoute, safetyStatus }: RiskPanelProps) {
  const risk = selectedRoute.risk;
  const ml = selectedRoute.mlSummary;
  const riskTheme = RISK_LEVEL_THEME[risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM;
  const mlPredictionFormatted = ml?.prediction
    ? ml.prediction === 'LANDSLIDE_RISK'
      ? 'Landslide Risk'
      : 'No Hazard'
    : 'Not available';

  const mlProbFormatted = ml && typeof ml.maxProbability === 'number'
    ? `${(ml.maxProbability * 100).toFixed(1)}% probability`
    : 'Not available';

  return (
    <div className="intel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="shield" size={15} style={{ color: riskTheme.color }} />
          <span>Route Risk Intelligence</span>
        </span>
        <span
          className="tag-badge"
          style={{
            fontSize: 10,
            fontWeight: 700,
            backgroundColor: riskTheme.bg,
            color: riskTheme.color,
            borderColor: riskTheme.border,
          }}
        >
          {risk.overallLevel} Risk
        </span>
      </div>

      {/* 1. Primary Risk Driver Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-card-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          fontSize: 11,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="mountain" size={14} style={{ color: 'var(--accent-action)' }} />
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
              Primary Hazard Driver
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>
              {risk.dominantTrigger || 'Not available'}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 10, color: 'var(--accent-action)', fontWeight: 600 }}>Dominant</span>
      </div>

      {/* 2. ML Hazard Prediction Card */}
      {ml && (
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: ml.prediction === 'LANDSLIDE_RISK' ? 'var(--status-critical-bg)' : 'var(--status-safe-bg)',
            border: `1px solid ${ml.prediction === 'LANDSLIDE_RISK' ? 'rgba(217, 56, 58, 0.4)' : 'rgba(46, 139, 87, 0.4)'}`,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Waypoint Landslide Prediction
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: ml.prediction === 'LANDSLIDE_RISK' ? 'var(--status-critical)' : '#4ADE80',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {mlProbFormatted}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: ml.prediction === 'LANDSLIDE_RISK' ? 'var(--status-critical)' : '#4ADE80', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name={ml.prediction === 'LANDSLIDE_RISK' ? 'alert-triangle' : 'check'} size={13} />
              <span>{mlPredictionFormatted}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Tier: {ml.riskTier || 'LOW'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Overall Route Risk (Cumulative Exposure) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          backgroundColor: 'var(--bg-card-inset)',
          border: `1px solid ${riskTheme.border}`,
          borderRadius: 6,
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
            Corridor Aggregate Exposure
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: riskTheme.color,
                lineHeight: 1,
              }}
            >
              {risk.meanScore.toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Peak Exposure</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
            {risk.maxScore.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, color: risk.hazardousSegmentCount > 0 ? 'var(--status-critical)' : '#4ADE80', fontWeight: 500, marginTop: 2 }}>
            {risk.hazardousSegmentCount} On-Route Hazard Zone{risk.hazardousSegmentCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Explanatory Concept Distinction Note */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          padding: '6px 8px',
          backgroundColor: 'var(--bg-card-inset)',
          borderRadius: 4,
          borderLeft: '2px solid var(--accent-action)',
          marginBottom: 10,
        }}
      >
        <em>Note: Localized landslide risk is evaluated at sampled waypoints, while corridor exposure is a multi-factor score reflecting slope, precipitation, and historical hotspots.</em>
      </div>

      {/* Degraded Risk Advisory */}
      {safetyStatus?.status === 'DEGRADED' && (
        <div
          style={{
            marginBottom: 10,
            padding: '7px 10px',
            backgroundColor: 'var(--status-caution-bg)',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            borderRadius: 6,
            fontSize: 11,
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="alert-triangle" size={13} style={{ flexShrink: 0 }} />
          <span><strong>Degraded telemetry:</strong> {safetyStatus.reason || 'Telemetry data is partial.'}</span>
        </div>
      )}

      {/* Real per-waypoint risk profile + factor distribution */}
      <RouteRiskProfile selectedRoute={selectedRoute} />
    </div>
  );
}
