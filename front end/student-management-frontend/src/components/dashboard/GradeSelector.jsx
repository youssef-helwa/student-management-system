import PillTabs from '../common/PillTabs';

export default function GradeSelector({ grades, value, onChange }) {
  const options = [{ value: 'all', label: 'All Grades' }, ...grades.map((g) => ({ value: g.id, label: g.name }))];
  return <PillTabs options={options} value={value} onChange={onChange} />;
}
