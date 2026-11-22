export default function StatCard({ icon: Icon, label, value, tone = 'brand', trend }) {
  const toneVars = {
    brand: { '--icon-bg': 'var(--brand-100)', '--icon-fg': 'var(--brand-700)' },
    gold: { '--icon-bg': 'var(--gold-100)', '--icon-fg': 'var(--gold-700)' },
    success: { '--icon-bg': 'var(--success-100)', '--icon-fg': 'var(--success-600)' },
    danger: { '--icon-bg': 'var(--danger-100)', '--icon-fg': 'var(--danger-600)' },
    info: { '--icon-bg': 'var(--info-100)', '--icon-fg': 'var(--info-600)' },
  };

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon" style={toneVars[tone]}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <span className="stat-value">{value}</span>
      {trend && (
        <span className={`stat-trend ${trend.direction}`}>
          {trend.direction === 'up' ? '▲' : '▼'} {trend.label}
        </span>
      )}
    </div>
  );
}
