import type { RerouteEvaluationResult } from '../types/api';
import { Icon } from './common/Icon';

interface ReroutePanelProps {
  onCheckReroute: () => void;
  isChecking: boolean;
  rerouteResult: RerouteEvaluationResult | null;
  rerouteError: string | null;
  hasCalculatedRoute: boolean;
  driverMode?: boolean;
}

export default function ReroutePanel({
  onCheckReroute,
  isChecking,
  rerouteResult,
  rerouteError,
  hasCalculatedRoute,
  driverMode = false,
}: ReroutePanelProps) {
  return (
    <div className="intel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="reroute" size={15} color="var(--color-accent-amber)" />
          <span>{driverMode ? 'Safer Reroute Advisor' : 'Dynamic Reroute Advisor'}</span>
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{driverMode ? 'Safety Scan' : 'Contingency Scan'}</span>
      </div>

      <button
        onClick={onCheckReroute}
        disabled={isChecking || !hasCalculatedRoute}
        style={{
          width: '100%',
          padding: '9px 12px',
          backgroundColor: !hasCalculatedRoute
            ? 'var(--color-bg-base)'
            : isChecking
            ? 'rgba(46, 139, 87, 0.4)'
            : 'var(--color-status-safe)',
          color: !hasCalculatedRoute ? 'var(--color-text-muted)' : '#FFFFFF',
          border: !hasCalculatedRoute ? '1px solid var(--color-border-subtle)' : 'none',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          cursor: isChecking || !hasCalculatedRoute ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.15s ease',
        }}
      >
        {isChecking ? (
          <>
            <span
              style={{
                width: 12,
                height: 12,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span>{driverMode ? 'Checking for safer route...' : 'Evaluating contingency candidates...'}</span>
          </>
        ) : (
          <span>{driverMode ? 'Find a Safer Route' : 'Check for Safer Reroute'}</span>
        )}
      </button>

      {!hasCalculatedRoute && (
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {driverMode
            ? 'Start a route to check for safer alternatives.'
            : 'Calculate an active route to enable dynamic rerouting analysis.'}
        </div>
      )}

      {rerouteError && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            backgroundColor: 'rgba(217, 56, 58, 0.12)',
            border: '1px solid rgba(217, 56, 58, 0.35)',
            borderRadius: 6,
            fontSize: 11,
            color: '#FCA5A5',
          }}
        >
          {rerouteError}
        </div>
      )}

      {rerouteResult && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            borderRadius: 6,
            border: `1px solid ${rerouteResult.rerouteRecommended ? 'rgba(46, 139, 87, 0.4)' : 'var(--color-border-subtle)'}`,
            backgroundColor: rerouteResult.rerouteRecommended ? 'rgba(46, 139, 87, 0.1)' : 'var(--color-bg-base)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: rerouteResult.rerouteRecommended ? 'var(--color-status-safe)' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {rerouteResult.rerouteRecommended ? (
                <>
                  <Icon name="check" size={13} color="var(--color-status-safe)" />
                  <span>Reroute Recommended</span>
                </>
              ) : (
                <>
                  <Icon name="info" size={13} color="var(--color-text-muted)" />
                  <span>Current Route Optimal</span>
                </>
              )}
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              {rerouteResult.evaluatedCandidatesCount} candidates scanned
            </span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: 6 }}>
            {rerouteResult.reason}
          </div>

          {rerouteResult.rerouteRecommended && rerouteResult.recommendedRoute && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-bg-deep)',
                border: '1px solid rgba(46, 139, 87, 0.3)',
                borderRadius: 4,
                fontSize: 11,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Alternative Path:</span>
                <strong style={{ color: 'var(--color-status-safe)' }}>
                  {(rerouteResult.recommendedRoute.distanceMeters / 1000).toFixed(1)} km,{' '}
                  {Math.round(rerouteResult.recommendedRoute.durationSeconds / 60)} min
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Risk Transition:</span>
                <strong style={{ color: 'var(--color-status-safe)', fontFamily: 'var(--font-mono)' }}>
                  {rerouteResult.currentRoute.meanRiskScore.toFixed(1)} →{' '}
                  {rerouteResult.recommendedRoute.risk.meanScore.toFixed(1)} (
                  {rerouteResult.recommendedRoute.risk.overallLevel})
                </strong>
              </div>

              {rerouteResult.metrics && rerouteResult.metrics.hazardReductionPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Hazard Mitigation:</span>
                  <strong style={{ color: 'var(--color-status-safe)' }}>
                    -{rerouteResult.metrics.hazardReductionPercent}% Risk Exposure
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
