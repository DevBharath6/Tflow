export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages
  return (
    <nav>
      <ul className="pagination mb-0">
        <li className={`page-item ${prevDisabled ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={prevDisabled}>Prev</button>
        </li>
        <li className="page-item disabled"><span className="page-link">{page} / {totalPages}</span></li>
        <li className={`page-item ${nextDisabled ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={nextDisabled}>Next</button>
        </li>
      </ul>
    </nav>
  )
}


