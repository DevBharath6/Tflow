import React from 'react';

export default function Preview({ model }) {
  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
      <div className="card-header bg-white py-3 ps-4 pe-2" style={{ borderBottom: '2px solid #e9ecef', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
        <h5 className="mb-0 text-dark fw-bold">Live Preview</h5>
      </div>
      <div className="card-body p-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {model.sections.length === 0 && (
          <div className="text-center text-muted py-5">
            <p className="lead">Your assessment is empty. Add a section and some questions to see a preview here!</p>
          </div>
        )}
        {model.sections.map((s, sectionIdx) => (
          <div key={s.id} className="mb-4">
            <h5 className="mb-3 text-dark" style={{ fontWeight: '600' }}>
              {s.title}
              {sectionIdx > 0 && <span className="text-muted" style={{ fontSize: '0.9rem', marginLeft: '8px' }}> (Section {sectionIdx + 1})</span>}
            </h5>
            {(s.questions || []).map((q) => (
              <div key={q.id} className="mb-3 p-3 border" style={{ borderRadius: '10px', backgroundColor: '#fafafa' }}>
                <label className="form-label d-block mb-2 text-dark" style={{ fontWeight: '500' }}>
                  {q.label}
                  {q.required && <span className="text-danger ms-1">*</span>}
                </label>
                {q.type === 'single' && (
                  <select className="form-select" style={{ borderRadius: '6px' }}>
                    <option value="">Select...</option>
                    {(q.choices || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {q.type === 'multi' && (
                  <div className="d-flex flex-column gap-2">
                    {(q.choices || []).map(c => (
                      <div className="form-check" key={c}>
                        <input className="form-check-input" type="checkbox" id={`${q.id}-${c}`} disabled />
                        <label className="form-check-label text-dark" htmlFor={`${q.id}-${c}`}>{c}</label>
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'short' && (
                  <input className="form-control" type="text" maxLength={q.maxLength} disabled style={{ borderRadius: '6px' }} />
                )}
                {q.type === 'long' && (
                  <textarea className="form-control" maxLength={q.maxLength} rows={4} disabled style={{ borderRadius: '6px' }} />
                )}
                {q.type === 'number' && (
                  <input type="number" className="form-control" min={q.min} max={q.max} disabled style={{ borderRadius: '6px' }} />
                )}
                {q.type === 'file' && (
                  <input type="file" className="form-control" disabled style={{ borderRadius: '6px' }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}