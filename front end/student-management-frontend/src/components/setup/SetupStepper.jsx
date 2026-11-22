import { Check } from 'lucide-react';

export default function SetupStepper({ steps, currentIndex }) {
  return (
    <div className="flex items-center" style={{ marginBottom: 'var(--sp-6)' }}>
      {steps.map((label, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={label} className="flex items-center" style={{ flex: i === steps.length - 1 ? '0 0 auto' : 1 }}>
            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 700,
                  flexShrink: 0,
                  background: done ? 'var(--success-600)' : active ? 'var(--brand-600)' : 'var(--bg-sunken)',
                  color: done || active ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span
                className="text-tertiary"
                style={{
                  fontSize: 'var(--fs-xs)',
                  fontWeight: active ? 700 : 600,
                  color: active ? 'var(--text-primary)' : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  height: 2,
                  flex: 1,
                  margin: '0 var(--sp-3)',
                  background: done ? 'var(--success-600)' : 'var(--border-default)',
                  minWidth: 16,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
