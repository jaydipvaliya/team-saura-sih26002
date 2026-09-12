import type { AccessibilitySummary, CandidateAccessibility, AccessibilityFeatureCollection } from '../types/api';
import { ACCESSIBILITY_THEME } from '../config/map-theme';
import { Icon } from './common/Icon';

interface AccessibilityPanelProps {
  accessibilitySummary?: AccessibilitySummary;
  candidateAccessibility?: CandidateAccessibility;
  corridorData?: AccessibilityFeatureCollection;
  isUnavailable?: boolean;
}

export default function AccessibilityPanel({
  accessibilitySummary,
  candidateAccessibility,
  corridorData,
  isUnavailable = false,
}: AccessibilityPanelProps) {
  const corridorCount = corridorData?.features?.length || 0;
  const hasRouteContext = Boolean(accessibilitySummary || candidateAccessibility);
  const isRestricted = candidateAccessibility?.status === 'RESTRICTED' || accessibilitySummary?.status === 'RESTRICTED';
  const isAllClosed = accessibilitySummary?.status === 'ALL_CANDIDATES_CLOSED';
  const hasClosedCorridor = accessibilitySummary?.affectedCorridors?.some((c) => c.status === 'CLOSED');

  return (
    <div className="intel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="barrier" size={15} color="var(--color-accent-amber)" />
          <span>Road Accessibility Intelligence</span>
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {isUnavailable ? 'OFFLINE' : `SYSTEM: ${corridorCount} Monitored`}
        </span>
      </div>

      {/* Corridor Status Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {(Object.entries(ACCESSIBILITY_THEME) as [keyof typeof ACCESSIBILITY_THEME, typeof ACCESSIBILITY_THEME.OPEN][]).map(
          ([status, cfg]) => (
            <div
              key={status}
              style={{
                padding: '6px 8px',
                backgroundColor: 'var(--color-bg-base)',
                border: `1px solid ${status === 'RESTRICTED' ? 'rgba(217, 119, 6, 0.35)' : status === 'CLOSED' ? 'rgba(217, 56, 58, 0.35)' : 'rgba(46, 139, 87, 0.35)'}`,
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: cfg.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{status}</span>
              </div>
              <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{cfg.description}</span>
            </div>
          )
        )}
      </div>

      {/* Real Route-Level Accessibility Warnings */}
      {!hasRouteContext ? (
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-muted)' }}>Awaiting route</strong>
          <div style={{ marginTop: 2, fontSize: 10, color: 'var(--color-text-muted)' }}>
            Calculate a route to evaluate corridor accessibility along the selected path. Regional corridor
            monitoring stays active below.
          </div>
        </div>
      ) : isAllClosed ? (
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(217, 56, 58, 0.12)',
            border: '1px solid rgba(217, 56, 58, 0.35)',
            borderRadius: 6,
            fontSize: 11,
            color: '#FCA5A5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--color-status-danger)' }}>
            <Icon name="alert-triangle" size={14} color="var(--color-status-danger)" />
            <span>Critical: All Highway Candidates Closed</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: '#FCA5A5' }}>
            {accessibilitySummary?.reason || 'Every candidate corridor between origin and destination is currently marked CLOSED.'}
          </div>
        </div>
      ) : isRestricted ? (
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(217, 119, 6, 0.12)',
            border: '1px solid rgba(217, 119, 6, 0.35)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--color-status-caution)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <Icon name="alert-triangle" size={14} color="var(--color-status-caution)" />
            <span>Restricted Corridor Detected on Route</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: 'var(--color-text-secondary)' }}>
            Travel is possible with caution. Speed reductions or payload weight advisories may apply.
          </div>
          {candidateAccessibility?.affectedCorridors?.length ? (
            <div style={{ marginTop: 4, fontSize: 10, color: 'var(--color-status-caution)' }}>
              Corridor: {candidateAccessibility.affectedCorridors.map((c) => c.name).join(', ')}
            </div>
          ) : null}
        </div>
      ) : hasClosedCorridor ? (
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(46, 139, 87, 0.12)',
            border: '1px solid rgba(46, 139, 87, 0.35)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--color-status-safe)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <Icon name="check" size={14} color="var(--color-status-safe)" />
            <span>Closed Corridor Bypassed</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: 'var(--color-text-secondary)' }}>
            SauraRoute evaluated candidate routes and excluded closed road segments to select an accessible path.
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(46, 139, 87, 0.1)',
            border: '1px solid rgba(46, 139, 87, 0.25)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--color-status-safe)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="check" size={13} color="var(--color-status-safe)" />
          <span>
            <strong>Selected Route:</strong> 100% Accessible (0 closed/restricted corridors intersected).
          </span>
        </div>
      )}

      {isUnavailable && (
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--color-status-caution)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="alert-triangle" size={12} color="var(--color-status-caution)" />
          <span>Corridor accessibility feed is temporarily unavailable.</span>
        </div>
      )}
    </div>
  );
}
