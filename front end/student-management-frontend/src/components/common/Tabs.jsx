export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-4" style={{ borderBottom: '1px solid var(--border-default)', marginBottom: 'var(--sp-5)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: value === tab.value ? '2px solid var(--brand-700)' : '2px solid transparent',
            padding: '10px 2px',
            marginBottom: -1,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 'var(--fs-base)',
            color: value === tab.value ? 'var(--brand-700)' : 'var(--text-secondary)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
