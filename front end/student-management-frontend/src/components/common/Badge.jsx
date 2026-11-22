const TONE_CLASS = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'badge-neutral',
  gold: 'badge-gold',
};

export default function Badge({ tone = 'neutral', children, dot = false }) {
  return (
    <span className={`badge ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
