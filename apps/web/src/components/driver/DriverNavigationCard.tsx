import type { CandidateRouteProfile } from '../../types/api';

interface DriverNavigationCardProps {
  selectedRoute: CandidateRouteProfile;
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${totalMinutes} min`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function maneuverGlyph(text: string | undefined): string {
  if (!text) return '↑';
  const t = text.toLowerCase();
  if (t.includes('u-turn') || t.includes('u turn')) return '↺';
  if (t.includes('roundabout') || t.includes('rotary')) return '↻';
  if (t.includes('slight left') || t.includes('keep left')) return '↖';
  if (t.includes('slight right') || t.includes('keep right')) return '↗';
  if (t.includes('left')) return '←';
  if (t.includes('right')) return '→';
  if (t.includes('exit') || t.includes('ramp')) return '↗';
  if (t.includes('arrive') || t.includes('destination')) return '⌖';
  return '↑';
}

export default function DriverNavigationCard({ selectedRoute }: DriverNavigationCardProps) {
  const instructions = selectedRoute.instructions ?? [];

  if (instructions.length === 0) {
    return (
      <div className="driver-card">
        <div className="driver-nav-header">
          <span className="driver-nav-title">FULL GUIDANCE</span>
        </div>
        <div className="driver-nav-empty">No turn-by-turn guidance available for this route.</div>
      </div>
    );
  }

  return (
    <div className="driver-card">
      <div className="driver-nav-header">
        <span className="driver-nav-title">Full Guidance</span>
        <span className="driver-nav-steps">{instructions.length} steps</span>
      </div>

      <ol className="driver-nav-steps-list">
        {instructions.map((step, index) => (
          <li key={`${index}-${step.text}`} className="driver-nav-step">
            <span className="driver-nav-step-glyph">{maneuverGlyph(step.text)}</span>
            <span className="driver-nav-step-text">{step.text}</span>
            <span className="driver-nav-step-meta">{formatDistance(step.distanceMeters)}</span>
          </li>
        ))}
      </ol>

      <div className="driver-nav-destination">
        Total guidance time: {formatDuration(selectedRoute.durationSeconds)}
      </div>
    </div>
  );
}