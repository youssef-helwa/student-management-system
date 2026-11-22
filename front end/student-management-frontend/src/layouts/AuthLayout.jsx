import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children, wide = false }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 15% 15%, rgba(74,81,168,0.16), transparent 45%), radial-gradient(circle at 85% 85%, rgba(217,164,65,0.14), transparent 45%), var(--bg-app)',
        padding: 'var(--sp-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: wide ? 720 : 400 }}>
        <div className="flex items-center gap-2" style={{ justifyContent: 'center', marginBottom: 'var(--sp-6)' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand-700)', color: '#fff' }}
          >
            <GraduationCap size={22} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-xl)' }}>
            EduCenter
          </span>
        </div>
        <div className="card card-pad" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
