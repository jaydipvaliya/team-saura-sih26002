import { Icon } from './common/Icon';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  title = 'Route Calculation Failed',
  message,
  onRetry,
}: ErrorMessageProps) {
  // Extract clean message, avoiding stack traces if any
  const cleanMessage = message.includes('\n') ? message.split('\n')[0] : message;

  return (
    <div
      style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(217, 56, 58, 0.12)',
        border: '1px solid rgba(217, 56, 58, 0.35)',
        borderRadius: 8,
        color: '#FCA5A5',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 11, color: 'var(--color-status-danger)', letterSpacing: 0.3 }}>
          <Icon name="alert-triangle" size={14} color="var(--color-status-danger)" />
          <span>{title}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '3px 10px',
              backgroundColor: 'rgba(217, 56, 58, 0.2)',
              border: '1px solid var(--color-status-danger)',
              borderRadius: 4,
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Retry
          </button>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#FECACA', lineHeight: 1.4 }}>
        {cleanMessage || 'Routing service is currently unavailable.'}
      </div>
    </div>
  );
}
