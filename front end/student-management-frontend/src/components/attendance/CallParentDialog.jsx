import { useEffect, useState } from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import Modal from '../common/Modal';
import { CALL_RESULT_LABELS } from '../../utils/constants';
import { useAsync } from '../../hooks/useAsync';
import * as callHistoryService from '../../services/callHistoryService';
import * as studentService from '../../services/studentService';

const NUMBER_ISSUE_RESULTS = new Set(['wrong_number', 'invalid_number']);

export default function CallParentDialog({ open, onClose, student, onLogged }) {
  const [step, setStep] = useState('call'); // call -> result -> reason
  const [result, setResult] = useState(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: options } = useAsync(() => callHistoryService.getCallOptions(), []);

  useEffect(() => {
    if (open) {
      setStep('call');
      setResult(null);
      setReason('');
      setNote('');
    }
  }, [open]);

  async function handleFinish() {
  setSaving(true);

  try {
    const now = new Date();

    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const payload = {
      studentId: student.id,
      staff: 'Current User',
      result,
      date,
      time,
      reason: result === 'answered' ? reason : null,
      note: result === 'answered' ? '' : note,
    };

    console.log('CALL PAYLOAD:', payload);

    await callHistoryService.logCall(payload);

    if (NUMBER_ISSUE_RESULTS.has(result)) {
      await studentService.updateStudent(student.id, {
        phoneNeedsUpdate: true,
      });
    }

    onLogged?.();
    onClose();
  } catch (error) {
    console.error('Failed to save call:', error);
  } finally {
    setSaving(false);
  }
}

  if (!student) return null;

  return (
    <Modal open={open} onClose={onClose} title="Call Parent" size="sm">
      {step === 'call' && (
        <div className="flex-col gap-4" style={{ display: 'flex' }}>
          <div>
            <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Student</div>
            <div style={{ fontWeight: 700 }}>{student.fullName}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Parent's Name</div>
            <div style={{ fontWeight: 700 }}>{student.FatherName || 'Not available'}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Parent's Phone Number</div>
            <div style={{ fontWeight: 700 }} className="font-mono">{student.FatherPhone || 'Not available'}</div>
          </div>
          <button className="btn btn-gold w-full" style={{ justifyContent: 'center' }} onClick={() => setStep('result')}>
            <Phone size={16} /> Call
          </button>
        </div>
      )}

      {step === 'result' && (
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>How did the call go?</p>
          {(options?.results || []).map((opt) => (
            <button
                key={opt}
                className="btn btn-secondary w-full"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => {
                setResult(opt);
                setStep(opt === 'answered' ? 'reason' : 'confirm');
            }}>
    {CALL_RESULT_LABELS[opt] || opt}
  </button>
))}
        </div>
      )}

      {step === 'reason' && (
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>What reason did the parent give for the absence?</p>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {(options?.reasons || []).map((r) => (
              <button key={r} type="button" className={`chip ${reason === r ? 'active' : ''}`} onClick={() => setReason(r)}>
                {r}
              </button>
            ))}
          </div>
          <textarea
            className="textarea"
            placeholder="Add details about the reason…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            {NUMBER_ISSUE_RESULTS.has(result)
              ? "This will flag the parent's phone number as needing an update."
              : 'Add an optional note about this call.'}
          </p>
          <textarea className="textarea" placeholder="Optional note…" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}

      {(step === 'reason' || step === 'confirm') && (
        <div className="flex justify-between mt-4">
          <button className="btn btn-secondary" onClick={() => setStep('result')}>Back</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleFinish}>
            <PhoneCall size={15} /> {saving ? 'Saving…' : 'Save call result'}
          </button>
        </div>
      )}
    </Modal>
  );
}
