export default function BranchDot({ branch, showName = true }) {
  if (!branch) return null;
  return (
    <span className="flex items-center gap-2">
      <span className="branch-dot" style={{ '--branch-color': branch.color }} />
      {showName && <span>{branch.name}</span>}
    </span>
  );
}
