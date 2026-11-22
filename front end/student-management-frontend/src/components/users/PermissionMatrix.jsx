import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { ACTIONS, PERMISSION_PAGES, ROLES } from '../../utils/constants';
import * as userService from '../../services/userService';

export default function PermissionMatrix({ matrix }) {
  const [role, setRole] = useState(ROLES.MANAGER);
  const [local, setLocal] = useState(matrix);

  useEffect(() => {
    setLocal(matrix);
  }, [matrix]);

  async function toggle(page, action) {
    if (role === ROLES.ADMIN) return;

    const newValue = !local?.[role]?.[page]?.[action];

    // Update UI immediately
    setLocal((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [page]: {
          ...prev[role][page],
          [action]: newValue,
        },
      },
    }));

    try {
      await userService.updatePermission({
        role,
        page,
        action,
        allowed: newValue,
      });

      console.log('Permission saved');
    } catch (error) {
      console.error('Failed to save permission:', error);

      // Rollback if API fails
      setLocal((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          [page]: {
            ...prev[role][page],
            [action]: !newValue,
          },
        },
      }));
    }
  }

  return (
    <div className="card">
      <div
        className="card-header"
        style={{ flexWrap: 'wrap', gap: 'var(--sp-3)' }}
      >
        <span className="card-title">Permission Matrix</span>

        <div className="pill-tabs">
          {Object.values(ROLES).map((r) => (
            <button
              key={r}
              className={`chip ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div
        className="table-wrap"
        style={{ border: 'none', borderRadius: 0 }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Page</th>

              {ACTIONS.map((a) => (
                <th key={a} style={{ textAlign: 'center' }}>
                  {a}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {PERMISSION_PAGES.map((page) => (
              <tr key={page}>
                <td style={{ fontWeight: 600 }}>
                  {page}
                </td>

                {ACTIONS.map((action) => {
                  const enabled =
                    local?.[role]?.[page]?.[action] ?? false;

                  const locked = role === ROLES.ADMIN;

                  return (
                    <td
                      key={action}
                      style={{ textAlign: 'center' }}
                    >
                      <button
                        onClick={() => toggle(page, action)}
                        disabled={locked}
                        aria-label={`${role} ${action} ${page}`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-strong)',
                          background: enabled
                            ? 'var(--success-500)'
                            : 'var(--bg-sunken)',
                          color: '#fff',
                          cursor: locked
                            ? 'default'
                            : 'pointer',
                          opacity: locked ? 0.7 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {enabled && <Check size={14} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}