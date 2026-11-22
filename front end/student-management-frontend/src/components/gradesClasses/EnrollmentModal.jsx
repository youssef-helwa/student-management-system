import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import SearchInput from '../common/SearchInput';
import Avatar from '../common/Avatar';
import { EmptyState } from '../common/States';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import * as studentService from '../../services/studentService';
import { UserSearch } from 'lucide-react';

// Lets the user search a Grade or Class to check whether a given student
// is registered in it, and see the full roster at a glance.
export default function EnrollmentModal({ open, onClose, target, branchId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data: students, loading } = useAsync(
    () =>
      open && target
        ? studentService.findStudentsByGradeOrClass({
            gradeId: target?.type === 'grade' ? target.id : undefined,
            classId: target?.type === 'class' ? target.id : undefined,
            branchId,
            search: debouncedSearch,
          })
        : Promise.resolve([]),
    [open, target?.type, target?.id, branchId, debouncedSearch]
  );

  function handleClose() {
    setSearch('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={target ? `Students in ${target.name}` : 'Students'}
      size="md"
      footer={<button className="btn btn-secondary" onClick={handleClose}>Close</button>}
    >
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student name or ID…" style={{ width: '100%' }} />
      </div>

      {!loading && (
        <p className="text-secondary mb-4" style={{ fontSize: 'var(--fs-sm)' }}>
          {students?.length
            ? `${students.length} student${students.length === 1 ? '' : 's'} registered${search ? ' matching your search' : ''}.`
            : search
            ? 'No registered student matches your search.'
            : 'No students are currently registered here.'}
        </p>
      )}

      {loading ? (
        <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Checking…</p>
      ) : students && students.length > 0 ? (
        <div className="flex-col gap-2" style={{ display: 'flex', maxHeight: 360, overflowY: 'auto' }}>
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3"
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
              }}
              onClick={() => {
                handleClose();
                navigate(`/app/students/${s.id}`);
              }}
            >
              <Avatar name={s.fullName} src={s.profilePicture} size={30} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{s.fullName}</div>
                <div className="text-tertiary font-mono" style={{ fontSize: 'var(--fs-xs)' }}>{s.studentCode}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={UserSearch} title="No students found" message="Try a different name or student ID." />
      )}
    </Modal>
  );
}
