import type { RoutingPreference } from '../types/api';
import { PRESET_CORRIDORS } from '../config/map-theme';
import { Icon } from './common/Icon';

interface RoutePlannerProps {
  originInput: string;
  setOriginInput: (val: string) => void;
  destInput: string;
  setDestInput: (val: string) => void;
  preference: RoutingPreference;
  setPreference: (pref: RoutingPreference) => void;
  onCalculate: (customOrig?: string, customDest?: string, customPref?: RoutingPreference) => void;
  isRouting: boolean;
}

const OBJECTIVE_CONFIG: Record<
  RoutingPreference,
  {
    label: string;
    sublabel: string;
    icon: 'clock' | 'scale' | 'shield';
    activeColor: string;
    activeBg: string;
    activeBorder: string;
  }
> = {
  FASTEST: {
    label: 'Fastest',
    sublabel: '1h 28m • High Risk',
    icon: 'clock',
    activeColor: '#F97316',
    activeBg: 'rgba(249, 115, 22, 0.15)',
    activeBorder: 'rgba(249, 115, 22, 0.5)',
  },
  BALANCED: {
    label: 'Balanced',
    sublabel: '2h 07m • Med Risk',
    icon: 'scale',
    activeColor: '#E5983A',
    activeBg: 'rgba(229, 152, 58, 0.15)',
    activeBorder: 'rgba(229, 152, 58, 0.5)',
  },
  SAFEST: {
    label: 'Safest',
    sublabel: '2h 46m • Low Risk',
    icon: 'shield',
    activeColor: '#10B981',
    activeBg: 'rgba(16, 185, 129, 0.15)',
    activeBorder: 'rgba(16, 185, 129, 0.5)',
  },
};

export default function RoutePlanner({
  originInput,
  setOriginInput,
  destInput,
  setDestInput,
  preference,
  setPreference,
  onCalculate,
  isRouting,
}: RoutePlannerProps) {
  const activePreset = PRESET_CORRIDORS.find(
    (p) => p.origin === originInput && p.destination === destInput
  );

  const handleApplyPreset = (preset: typeof PRESET_CORRIDORS[0]) => {
    setOriginInput(preset.origin);
    setDestInput(preset.destination);
    onCalculate(preset.origin, preset.destination);
  };

  const handleSelectPreference = (mode: RoutingPreference) => {
    setPreference(mode);
    onCalculate(undefined, undefined, mode);
  };

  return (
    <div className="intel-card">
      <div className="intel-card-header">
        <span className="intel-card-title">
          <Icon name="compass" size={15} style={{ color: 'var(--accent-action)' }} />
          <span>Route Planner</span>
        </span>
        {activePreset && (
          <span style={{ fontSize: 11, color: 'var(--accent-action)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {activePreset.highway}
          </span>
        )}
      </div>

      {/* Preset Corridor Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {PRESET_CORRIDORS.map((p) => {
          const isSelected = p.origin === originInput && p.destination === destInput;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              disabled={isRouting}
              className={`btn-preset ${isSelected ? 'active' : ''}`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <Icon name="pin-start" size={13} style={{ color: 'var(--status-safe)' }} /> Origin (Latitude, Longitude):
          </label>
          <input
            type="text"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="26.1445, 91.7362"
            disabled={isRouting}
            className="coord-input"
            aria-label="Origin coordinates"
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <Icon name="pin-end" size={13} style={{ color: 'var(--status-critical)' }} /> Destination (Latitude, Longitude):
          </label>
          <input
            type="text"
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            placeholder="25.5788, 91.8933"
            disabled={isRouting}
            className="coord-input"
            aria-label="Destination coordinates"
          />
        </div>
      </div>

      {/* Routing Preference Selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Routing Objective
          </label>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tap to instantly re-route</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['FASTEST', 'BALANCED', 'SAFEST'] as RoutingPreference[]).map((mode) => {
            const isSelected = preference === mode;
            const cfg = OBJECTIVE_CONFIG[mode];
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleSelectPreference(mode)}
                disabled={isRouting}
                title={`Select ${cfg.label} Route (${cfg.sublabel})`}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: 6,
                  cursor: isRouting ? 'not-allowed' : 'pointer',
                  border: `1px solid ${isSelected ? cfg.activeBorder : 'var(--border-subtle)'}`,
                  backgroundColor: isSelected ? cfg.activeBg : 'var(--bg-card-inset)',
                  color: isSelected ? cfg.activeColor : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon
                    name={cfg.icon}
                    size={12}
                  />
                  <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 600 }}>{cfg.label}</span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? cfg.activeColor : 'var(--text-muted)',
                    opacity: isSelected ? 0.95 : 0.75,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cfg.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        type="button"
        onClick={() => onCalculate()}
        disabled={isRouting}
        className="btn-primary"
        aria-busy={isRouting}
      >
        {isRouting ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span>CALCULATING ROUTE...</span>
          </>
        ) : (
          <span>CALCULATE ROUTE</span>
        )}
      </button>
    </div>
  );
}
