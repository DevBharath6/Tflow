export default function CandidateRow({ candidate, style, onClick }) {
  return (
    <>
      <div
        className="candidate-row"
        style={style}
        onClick={onClick}
        role="button"
      >
        <div className="candidate-info">
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-email">{candidate.email}</div>
        </div>
        <div className={`candidate-stage stage-${candidate.stage || 'none'}`}>
          {candidate.stage || 'N/A'}
        </div>
      </div>

      <style>{`
        .candidate-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          background: rgba(255,255,255,0.95);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .candidate-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .candidate-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .candidate-name {
          font-weight: 600;
          font-size: 1rem;
          color: #111827;
        }

        .candidate-email {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .candidate-stage {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .candidate-stage.stage-applied { background: #facc15; color: #fff; }
        .candidate-stage.stage-screen { background: #3b82f6; color: #fff; }
        .candidate-stage.stage-tech { background: #10b981; color: #fff; }
        .candidate-stage.stage-offer { background: #f97316; color: #fff; }
        .candidate-stage.stage-hired { background: #22c55e; color: #fff; }
        .candidate-stage.stage-rejected { background: #ef4444; color: #fff; }
        .candidate-stage.stage-none { background: #6b7280; color: #fff; }
      `}</style>
    </>
  )
}
