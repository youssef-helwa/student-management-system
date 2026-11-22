export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={24} />
        </div>
      )}
      <h4 style={{ fontSize: 'var(--fs-md)' }}>{title}</h4>
      {message && <p className="text-secondary" style={{ maxWidth: 360 }}>{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
