import type { RouteOptimizationResult, CandidateRouteProfile, RoutingPreference } from '../types/api';
import { RISK_LEVEL_THEME } from '../config/map-theme';
import { Icon } from './common/Icon';

interface RouteComparisonProps {
  optimization: RouteOptimizationResult;
  onSelectCandidate?: (pref: RoutingPreference) => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export default function RouteComparison({ optimization, onSelectCandidate }: RouteComparisonProps) {
  const { selectedRoute, baselineRoute, candidates, preference, optimization: optMeta } = optimization;

  // Render only the routes the engine actually generated. Do not bucket a
  // single route under multiple objective labels — that would imply a
  // comparison that never happened.
  const candidateList: CandidateRouteProfile[] =
    candidates && candidates.length > 0 ? candidates : [selectedRoute];
  const hasAlternatives = candidateList.length > 1;
  const selectedDiffersFromBaseline = selectedRoute.candidateId !== baselineRoute.candidateId;

  const inferCandidatePref = (candidate: CandidateRouteProfile, idx: number): RoutingPreference => {
    if (candidate.candidateId.includes('fastest') || idx === 0) return 'FASTEST';
    if (candidate.candidateId.includes('safest') || idx === 2) return 'SAFEST';
    return 'BALANCED';
  };

  return (
    <div className="intel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="scale" size={15} color="var(--color-accent-amber)" />
          <span>Route Comparison</span>
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'rgba(229, 152, 58, 0.15)',
              color: 'var(--color-accent-amber)',
              border: '1px solid rgba(229, 152, 58, 0.35)',
              letterSpacing: 0.3,
            }}
          >
            Objective: {preference}
          </span>
          {optMeta.hazardReductionPercent > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: 'rgba(46, 139, 87, 0.18)',
                color: 'var(--color-status-safe)',
                border: '1px solid rgba(46, 139, 87, 0.4)',
              }}
            >
              -{optMeta.hazardReductionPercent}% Hazard
            </span>
          )}
        </div>
      </div>

      {hasAlternatives ? (
        <>
          <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 8 }}>
            Engine evaluated {candidateList.length} candidate routes for the {preference} objective:
          </div>

          {/* One card per real generated candidate */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(3, candidateList.length)}, 1fr)`,
              gap: 8,
              marginBottom: 12,
            }}
          >
            {candidateList.slice(0, 3).map((candidate) => {
              const isSelected = candidate.candidateId === selectedRoute.candidateId;
              const riskTheme = RISK_LEVEL_THEME[candidate.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM;

              const inferredPref = inferCandidatePref(candidate, candidateList.indexOf(candidate));

              return (
                <div
                  key={candidate.candidateId}
                  onClick={() => onSelectCandidate?.(inferredPref)}
                  title={`Switch to ${candidate.name}`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(229, 152, 58, 0.12)' : 'var(--color-bg-base)',
                    border: isSelected ? '1.5px solid var(--color-accent-amber)' : '1px solid var(--color-border-subtle)',
                    borderRadius: 6,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                    <span
                      style={{ fontSize: 10, fontWeight: 700, color: isSelected ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)', lineHeight: 1.2 }}
                      title={candidate.name}
                    >
                      {candidate.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          backgroundColor: 'var(--color-accent-amber)',
                          color: 'var(--color-bg-deep)',
                          padding: '1px 4px',
                          borderRadius: 3,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10 }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Dist: </span>
                      <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {(candidate.distanceMeters / 1000).toFixed(1)} km
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Time: </span>
                      <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatDuration(candidate.durationSeconds)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Risk: </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '0 4px',
                          borderRadius: 3,
                          backgroundColor: riskTheme.bg,
                          color: riskTheme.color,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {candidate.risk.meanScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDiffersFromBaseline ? (
            <>
              {/* Selected vs Baseline before/after — meaningful only when they differ */}
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  backgroundColor: 'var(--color-bg-base)',
                  borderRadius: 6,
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Metric</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Baseline</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--color-accent-amber)' }}>Selected Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Distance</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {(baselineRoute.distanceMeters / 1000).toFixed(1)} km
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {(selectedRoute.distanceMeters / 1000).toFixed(1)} km
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Duration (ETA)</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDuration(baselineRoute.durationSeconds)}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {formatDuration(selectedRoute.durationSeconds)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Risk Level</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 3,
                            backgroundColor: (RISK_LEVEL_THEME[baselineRoute.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM).bg,
                            color: (RISK_LEVEL_THEME[baselineRoute.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM).color,
                          }}
                        >
                          {baselineRoute.risk.overallLevel}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 3,
                            backgroundColor: (RISK_LEVEL_THEME[selectedRoute.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM).bg,
                            color: (RISK_LEVEL_THEME[selectedRoute.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM).color,
                          }}
                        >
                          {selectedRoute.risk.overallLevel}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Mean Risk Score</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {baselineRoute.risk.meanScore.toFixed(1)}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-accent-amber)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {selectedRoute.risk.meanScore.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Hazard Segments</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: baselineRoute.risk.hazardousSegmentCount > 0 ? 'var(--color-status-danger)' : 'var(--color-text-muted)' }}>
                        {baselineRoute.risk.hazardousSegmentCount}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: selectedRoute.risk.hazardousSegmentCount > 0 ? 'var(--color-status-danger)' : 'var(--color-status-safe)', fontWeight: 700 }}>
                        {selectedRoute.risk.hazardousSegmentCount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: 8,
                  padding: '6px 8px',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 6,
                  fontSize: 10,
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  Detour: <strong style={{ color: 'var(--color-text-primary)' }}>+{optMeta.additionalDistanceKm.toFixed(1)} km</strong> (
                  {optMeta.additionalDurationMinutes > 0 ? `+${optMeta.additionalDurationMinutes.toFixed(0)} min` : 'same time'})
                </span>
                <span style={{ color: 'var(--color-status-safe)', fontWeight: 700 }}>
                  {optMeta.hazardReductionPercent > 0 ? `Safer by ${optMeta.hazardReductionPercent}%` : 'Optimal trade-off'}
                </span>
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
                padding: '8px 10px',
                backgroundColor: 'var(--color-bg-base)',
                borderRadius: 6,
                borderLeft: '2px solid var(--color-accent-amber)',
              }}
            >
              Baseline route selected — it already carries the lowest risk of the evaluated candidates, so no detour is
              warranted. {optMeta.selectionReason}
            </div>
          )}
        </>
      ) : (
        /* Single generated route — nothing to compare, stated plainly */
        <>
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Distance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {(selectedRoute.distanceMeters / 1000).toFixed(1)} km
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Travel</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatDuration(selectedRoute.durationSeconds)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mean Risk</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: (RISK_LEVEL_THEME[selectedRoute.risk.overallLevel] || RISK_LEVEL_THEME.MEDIUM).color,
                }}
              >
                {selectedRoute.risk.meanScore.toFixed(1)}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
              padding: '8px 10px',
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 6,
              borderLeft: '2px solid var(--color-accent-amber)',
            }}
          >
            Single viable route for this corridor — no alternative candidates to compare. {optMeta.selectionReason}
          </div>
        </>
      )}
    </div>
  );
}
