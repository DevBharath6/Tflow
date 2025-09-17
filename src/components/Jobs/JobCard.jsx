export default function JobCard({ job, onEdit, onDelete, onView }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active": return "badge bg-success";
      case "Closed": return "badge bg-danger";
      case "Draft": return "badge bg-warning text-dark";
      default: return "badge bg-secondary";
    }
  };

  return (
    <div 
      className="card mb-3 shadow-sm border-0 hover-card"
      onClick={() => onView && onView(job)}
      style={{ cursor: onView ? "pointer" : "default" }}
    >
      <div className="card-body d-flex justify-content-between align-items-center">
        
        {/* Left Side */}
        <div>
          <h6 className="fw-bold mb-1">{job.title}</h6>
          <div className="text-muted small mb-1">
            {job.department || "General"} · {job.location || "Remote"}
          </div>
          {job.salaryRange && (
            <div className="small text-dark fw-semibold mb-1">
              💰 {job.salaryRange}
            </div>
          )}
          {job.tags?.length > 0 && (
            <div className="mt-1">
              {job.tags.map((t) => (
                <span key={t} className="badge bg-light text-dark border me-1">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="text-end">
          <div className={getStatusBadge(job.status)}>{job.status}</div>
          <div className="text-muted small mt-2">Order #{job.order}</div>
          <div className="mt-2">
            {onEdit && (
              <button 
                className="btn btn-sm btn-outline-primary me-1"
                onClick={(e) => { e.stopPropagation(); onEdit(job); }}
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => { e.stopPropagation(); onDelete(job); }}
              >
                🗑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
