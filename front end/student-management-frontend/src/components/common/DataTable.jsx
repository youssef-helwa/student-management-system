import { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { EmptyState, LoadingState } from './States';

/**
 * columns: [{ key, header, render?: (row) => node, width? }]
 * rows: array of data objects (must have a stable `id` unless rowKey is given)
 */
export default function DataTable({
  columns,
  rows,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records match the current filters.',
  onRowClick,
  rowKey = 'id',
  pageSize = 8,
  toolbar,
}) {
  const [page, setPage] = useState(0);

  if (loading) {
    return (
      <div className="table-wrap">
        {toolbar && <div className="table-toolbar">{toolbar}</div>}
        <div style={{ padding: 'var(--sp-9) 0' }}>
          <LoadingState label="Loading records…" />
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleRows = rows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  return (
    <div className="table-wrap">
      {toolbar && <div className="table-toolbar">{toolbar}</div>}
      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} message={emptyMessage} />
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ width: col.width }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={onRowClick ? 'table-row-clickable' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span>
              Showing {currentPage * pageSize + 1}–{Math.min(rows.length, (currentPage + 1) * pageSize)} of{' '}
              {rows.length}
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm btn-icon"
                disabled={currentPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm btn-icon"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
