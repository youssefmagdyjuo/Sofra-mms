/**
 * TableSkeleton - shows animated skeleton rows inside a table body while loading.
 * Usage: render inside <TableBody> when loading is true.
 */
export default function TableSkeleton({ cols = 4, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 rounded-lg bg-slate-100 animate-pulse"
                style={{ width: j === 0 ? '60%' : j === cols - 1 ? '40%' : '75%', animationDelay: `${i * 60}ms` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
