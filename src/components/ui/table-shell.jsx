import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

export function TableShell({
  columns,
  data,
  renderRow,
  loading,
  error,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}) {
  return (
    <div className="table-container scrollbar-subtle overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="table-head">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-4 ${column.className || ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] last:border-0"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && error && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6">
                <div className="border border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text-2)]">
                  <p className="notice-line">
                    <span className="font-mono text-[var(--text)]">✕</span>
                    <span>{error}</span>
                  </p>
                </div>
              </td>
            </tr>
          )}

          {!loading && !error && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          )}

          {!loading && !error && data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
