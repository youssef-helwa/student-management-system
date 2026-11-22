import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pencil, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import * as gradeService from '../../services/gradeService';
import * as examService from '../../services/examService';
import GradeSelector from '../../components/dashboard/GradeSelector';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

export default function Results() {
  const { activeBranch } = useBranch();
  const navigate = useNavigate();
  const [gradeId, setGradeId] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const debouncedTableSearch = useDebounce(tableSearch, 250);

  // Aggregate table (unchanged behaviour, now re-fetches after a save).
  const { data: grades } = useAsync(() => gradeService.getGrades(), []);
  const { data: classes } = useAsync(() => classService.getClasses({ branchId: activeBranch?.id }), [activeBranch?.id]);
  const { data: students, loading } = useAsync(
    () => studentService.getStudents({ branchId: activeBranch?.id, gradeId }),
    [activeBranch?.id, gradeId]
  );
  const { data: exams } = useAsync(() => examService.getExams({ branchId: activeBranch?.id }), [activeBranch?.id]);
  const { data: allResults } = useAsync(() => examService.getAllResults(), [refreshKey]);
  console.log("===== RESULTS DEBUG =====");
console.log("students:", students);
console.log("exams:", exams);
console.log("allResults:", allResults);
console.log("students is array:", Array.isArray(students));
console.log("exams is array:", Array.isArray(exams));
console.log("allResults is array:", Array.isArray(allResults));
console.log("=========================");

  // --- Search-by-code result entry panel -----------------------------------
  const codeInputRef = useRef(null);
  const [studentCode, setStudentCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [score, setScore] = useState('');
  const [editingScore, setEditingScore] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  // Exams relevant to the found student (their grade, this branch),
  // newest created first — the first entry is auto-selected by default.
  const studentExams = useMemo(() => {
    if (!exams || !searchedStudent) return [];
    return [...exams]
      .filter((e) => e.gradeId === searchedStudent.gradeId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [exams, searchedStudent]);

  const latestExamId = studentExams[0]?.id || '';
  const selectedExam = studentExams.find((e) => e.id === selectedExamId) || null;

  // When a new student is found, default the exam dropdown to the latest
  // created exam for their grade.
  useEffect(() => {
    setSelectedExamId(searchedStudent ? latestExamId : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedStudent]);

  // When the selected exam (or student) changes, load any existing score
  // for that pair: show it locked with an Edit button, otherwise open the
  // field for entry.
  useEffect(() => {
    if (!searchedStudent || !selectedExamId || !allResults) {
      setScore('');
      setEditingScore(true);
      return;
    }
    const existing = allResults.find((r) => String(r.studentId) === String(searchedStudent.id) && String(r.examId) === String(selectedExamId));  
    if (existing && !existing.absent && existing.score !== null && existing.score !== undefined) {
      setScore(String(existing.score));
      setEditingScore(false);
    } else {
      setScore('');
      setEditingScore(true);
    }
  }, [searchedStudent, selectedExamId, allResults]);

async function handleSearch(e) {
  e.preventDefault();

  const code = studentCode.trim();

  if (!code) return;

  setSearching(true);
  setSearchError(null);
  setSaveFeedback(null);
  setSearchedStudent(null);

  try {
    const match = await studentService.getStudentByCode(code);

    if (!match) {
      setSearchError('No student found with that code.');
      return;
    }

    if (activeBranch && match.branchId !== activeBranch.id) {
      setSearchError('No student found with that code in this branch.');
      return;
    }

    setSearchedStudent(match);

  } catch (error) {
    console.error('Student search error:', error);

    setSearchedStudent(null);

    if (error?.message === 'Student Not Found') {
      setSearchError('No student found with that code.');
    } else {
      setSearchError('Failed to search for student. Please try again.');
    }

  } finally {
    setSearching(false);
  }
}

  function handleEdit() {
    setEditingScore(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!searchedStudent || !selectedExamId) return;
    const numeric = Number(score);
    if (score.trim() === '' || Number.isNaN(numeric)) {
      setSaveFeedback({ type: 'error', text: 'Enter a valid score.' });
      return;
    }
    if (selectedExam && (numeric < 0 || numeric > selectedExam.totalMarks)) {
      setSaveFeedback({ type: 'error', text: `Score must be between 0 and ${selectedExam.totalMarks}.` });
      return;
    }
    setSaving(true);
    await examService.saveResult({ examId: selectedExamId, studentId: searchedStudent.id, score: numeric });
    setSaving(false);
    setRefreshKey((k) => k + 1);
    setSaveFeedback({ type: 'success', text: `Score saved for ${searchedStudent.fullName}.` });

    // Reset the panel so the user can immediately search the next student.
    setStudentCode('');
    setSearchedStudent(null);
    setSelectedExamId('');
    setScore('');
    setEditingScore(true);
    codeInputRef.current?.focus();
  }

  const studentGrade = grades?.find((g) => g.id === searchedStudent?.gradeId);
  const studentClass = classes?.find((c) => c.id === searchedStudent?.classId);

  const rows = useMemo(() => {
  if (!Array.isArray(students) || !Array.isArray(exams) || !Array.isArray(allResults)) {
    return [];
  }

  const examMap = Object.fromEntries(
    exams.map((e) => [String(e.id), e])
  );

  return students.map((s) => {
    const studentResults = allResults.filter((r) => {
      return (
        String(r.studentId) === String(s.id) &&
        !r.absent &&
        r.score !== null &&
        r.score !== undefined
      );
    });

    const scores = studentResults.map((r) => Number(r.score));

    const percentages = studentResults
      .map((r) => {
        const exam = examMap[String(r.examId)];

        if (!exam || !exam.totalMarks) {
          return null;
        }

        return (Number(r.score) / Number(exam.totalMarks)) * 100;
      })
      .filter((p) => p !== null);

    const average = percentages.length
      ? Math.round(
          percentages.reduce((sum, percentage) => sum + percentage, 0) /
            percentages.length
        )
      : null;

    return {
      id: s.id,
      student: s,
      examsTaken: studentResults.length,
      highest: scores.length ? Math.max(...scores) : null,
      lowest: scores.length ? Math.min(...scores) : null,
      average,
    };
  });
}, [students, exams, allResults]);

  const filteredRows = useMemo(() => {
    const q = debouncedTableSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.student.fullName.toLowerCase().includes(q) || r.student.studentCode.toLowerCase().includes(q)
    );
  }, [rows, debouncedTableSearch]);

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.student.fullName} size={30} />
          <span style={{ fontWeight: 600 }}>{r.student.fullName}</span>
        </div>
      ),
    },
    { key: 'examsTaken', header: 'Exams Taken' },
    { key: 'highest', header: 'Highest Score', render: (r) => r.highest ?? '—' },
    { key: 'lowest', header: 'Lowest Score', render: (r) => r.lowest ?? '—' },
    { key: 'average', header: 'Average', render: (r) => (r.average !== null ? `${r.average}%` : '—') },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (r) =>
        r.average !== null ? (
          <div style={{ width: 120 }}>
            <div style={{ height: 6, borderRadius: 4, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${r.average}%`,
                  height: '100%',
                  background: r.average >= 50 ? 'var(--success-500)' : 'var(--danger-500)',
                }}
              />
            </div>
          </div>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-subtitle">Aggregate exam performance for {activeBranch?.name}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Register / Edit Result</span>
        </div>
        <div className="card-body">
          <form className="flex items-end gap-3" style={{ flexWrap: 'wrap' }} onSubmit={handleSearch}>
            <div className="field" style={{ minWidth: 240 }}>
              <label className="field-label">Student Code</label>
              <div className="search-input-wrap">
                <Search size={15} />
                <input
                  ref={codeInputRef}
                  className="input"
                  placeholder="e.g. STU-0001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={searching || !studentCode.trim()}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </form>

          {searchError && <FeedbackBanner tone="danger" icon={AlertTriangle} text={searchError} />}
          {saveFeedback && (
            <FeedbackBanner
              tone={saveFeedback.type === 'success' ? 'success' : 'danger'}
              icon={saveFeedback.type === 'success' ? CheckCircle2 : AlertTriangle}
              text={saveFeedback.text}
            />
          )}

          {searchedStudent && (
            <div className="mt-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--sp-4)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={searchedStudent.fullName} size={40} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>{searchedStudent.fullName}</div>
                  <div className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                    {searchedStudent.studentCode} · {studentGrade?.name || '—'} · {studentClass?.name || '—'}
                  </div>
                </div>
              </div>

              <form className="grid-2" onSubmit={handleSave}>
                <div className="field">
                  <label className="field-label">Exam</label>
                  <select className="select" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                    {studentExams.length === 0 && <option value="">No exams for this grade</option>}
                    {studentExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                        {ex.id === latestExamId ? ' (Latest)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Score{selectedExam ? ` (out of ${selectedExam.totalMarks})` : ''}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max={selectedExam?.totalMarks}
                    value={score}
                    disabled={!editingScore}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score"
                  />
                </div>

                <div className="flex items-center gap-3 mt-4" style={{ gridColumn: '1 / -1' }}>
                  {editingScore ? (
                    <button className="btn btn-primary" type="submit" disabled={saving || !selectedExamId}>
                      {saving ? 'Saving…' : 'Save Result'}
                    </button>
                  ) : (
                    <>
                      <Badge tone="success" dot>
                        Saved
                      </Badge>
                      <button className="btn btn-secondary btn-sm" type="button" onClick={handleEdit}>
                        <Pencil size={13} /> Edit
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredRows}
        loading={loading}
        onRowClick={(r) => navigate(`/app/students/${r.student.id}`)}
        emptyTitle={tableSearch ? 'No matching students' : 'No results yet'}
        emptyMessage={tableSearch ? 'Try a different name or student code.' : 'Results will appear once exams are marked.'}
        toolbar={
          <>
            <GradeSelector grades={grades || []} value={gradeId} onChange={setGradeId} />
            <SearchInput value={tableSearch} onChange={setTableSearch} placeholder="Search by name or student code…" />
          </>
        }
      />
    </div>
  );
}

function FeedbackBanner({ tone, icon: Icon, text }) {
  const toneStyles = {
    success: { bg: 'var(--success-100)', fg: 'var(--success-600)' },
    warning: { bg: 'var(--warning-100)', fg: 'var(--warning-600)' },
    danger: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
  };
  const s = toneStyles[tone];
  return (
    <div
      className="flex items-center gap-2 mt-4"
      style={{ background: s.bg, color: s.fg, padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--fs-sm)' }}
    >
      <Icon size={16} /> {text}
    </div>
  );
}
