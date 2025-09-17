import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment, useSubmitAssessment } from '../../hooks/useAssessments';

// A modern, improved Modal component
function Modal({ show, onClose, title, message }) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050,
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-sm modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content shadow-lg" style={{ borderRadius: '15px' }}>
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center py-4">
            <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <p className="lead">{message}</p>
          </div>
          <div className="modal-footer border-top-0 d-flex justify-content-center">
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ borderRadius: '8px' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useVisibility(model, values) {
  return useMemo(() => {
    const visible = {};
    for (const s of model.sections) {
      for (const q of s.questions || []) {
        if (!q.visibleIf) {
          visible[q.id] = true;
          continue;
        }
        let ok = true;
        for (const [dep, val] of Object.entries(q.visibleIf)) {
          if (values[dep] instanceof Array) {
            ok = values[dep]?.includes(val);
          } else {
            ok = values[dep] === val;
          }
          if (!ok) break;
        }
        visible[q.id] = ok;
      }
    }
    return visible;
  }, [model, values]);
}

export default function RuntimeForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data: model } = useAssessment(jobId);
  const submit = useSubmitAssessment(jobId);
  const [values, setValues] = useState({});
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);
  const visible = model ? useVisibility(model, values) : {};

  if (!model) return <div className="container py-5 text-center">Loading...</div>;

  function setVal(id, v) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function setTouchedField(id) {
    setTouched((prev) => ({ ...prev, [id]: true }));
  }

  function isInvalid(q) {
    if (!touched[q.id]) return false;
    if (!visible[q.id]) return false;
    const v = values[q.id];
    if (q.required) {
      if (q.type === 'multi') return !(v && v.length);
      return v == null || v === '';
    }
    if (q.type === 'number') {
      if (v == null || v === '') return false;
      if (q.min != null && Number(v) < q.min) return true;
      if (q.max != null && Number(v) > q.max) return true;
    }
    if ((q.type === 'short' || q.type === 'long') && q.maxLength) {
      if ((v || '').length > q.maxLength) return true;
    }
    return false;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const allTouched = {};
    for (const s of model.sections) {
      for (const q of s.questions || []) {
        if (visible[q.id]) {
          allTouched[q.id] = true;
        }
      }
    }
    setTouched(allTouched);

    for (const s of model.sections) {
      for (const q of s.questions || []) {
        if (visible[q.id] && isInvalid(q)) {
          document.getElementById(q.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
    }

    try {
      await submit.mutateAsync({ values, submittedAt: new Date().toISOString() });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission.');
    }
  }

  const handleModalClose = () => {
    setShowModal(false);
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container py-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h2 className="mb-4 text-center text-dark" style={{ fontWeight: '600' }}>
        Assessment Form
      </h2>
      <form onSubmit={onSubmit} noValidate>
        {model.sections.map((s) => (
          <div key={s.id} className="mb-4">
            <h4 className="mb-3 text-dark fw-bold">{s.title}</h4>
            {(s.questions || []).map((q) =>
              visible[q.id] ? (
                <div
                  key={q.id}
                  id={q.id}
                  className="mb-4 p-4 border rounded"
                  style={{ backgroundColor: '#fff', borderColor: '#e9ecef' }}
                >
                  <label className="form-label text-dark" style={{ fontWeight: '500' }}>
                    {q.label}
                    {q.required && <span className="text-danger ms-1">*</span>}
                  </label>
                  {q.type === 'single' && (
                    <select
                      className={`form-select ${isInvalid(q) ? 'is-invalid' : ''}`}
                      value={values[q.id] || ''}
                      onBlur={() => setTouchedField(q.id)}
                      onChange={(e) => setVal(q.id, e.target.value)}
                      style={{ borderRadius: '6px' }}
                    >
                      <option value="">Select...</option>
                      {(q.choices || []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                  {q.type === 'multi' && (
                    <div
                      className={`d-flex flex-column gap-2 ${isInvalid(q) ? 'is-invalid-multi' : ''}`}
                      onBlur={() => setTouchedField(q.id)}
                      style={{
                        border: isInvalid(q) ? '1px solid #dc3545' : 'none',
                        borderRadius: '6px',
                        padding: isInvalid(q) ? '10px' : '0',
                      }}
                    >
                      {(q.choices || []).map((c) => {
                        const arr = Array.isArray(values[q.id]) ? values[q.id] : [];
                        const checked = arr.includes(c);
                        return (
                          <div className="form-check" key={c}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`${q.id}-${c}`}
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(arr);
                                if (e.target.checked) next.add(c);
                                else next.delete(c);
                                setVal(q.id, Array.from(next));
                              }}
                            />
                            <label className="form-check-label text-dark" htmlFor={`${q.id}-${c}`}>
                              {c}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'short' && (
                    <input
                      className={`form-control ${isInvalid(q) ? 'is-invalid' : ''}`}
                      type="text"
                      maxLength={q.maxLength}
                      value={values[q.id] || ''}
                      onBlur={() => setTouchedField(q.id)}
                      onChange={(e) => setVal(q.id, e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  )}
                  {q.type === 'long' && (
                    <textarea
                      className={`form-control ${isInvalid(q) ? 'is-invalid' : ''}`}
                      maxLength={q.maxLength}
                      rows={4}
                      value={values[q.id] || ''}
                      onBlur={() => setTouchedField(q.id)}
                      onChange={(e) => setVal(q.id, e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  )}
                  {q.type === 'number' && (
                    <input
                      type="number"
                      className={`form-control ${isInvalid(q) ? 'is-invalid' : ''}`}
                      min={q.min}
                      max={q.max}
                      value={values[q.id] || ''}
                      onBlur={() => setTouchedField(q.id)}
                      onChange={(e) => setVal(q.id, e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  )}
                  {q.type === 'file' && (
                    <input
                      type="file"
                      className={`form-control ${isInvalid(q) ? 'is-invalid' : ''}`}
                      onChange={(e) => setVal(q.id, e.target.files?.[0]?.name || '')}
                      style={{ borderRadius: '6px' }}
                    />
                  )}
                  {isInvalid(q) && (
                    <div className="invalid-feedback d-block">
                      This field is required or invalid.
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
        ))}
        <div className="d-grid mt-4">
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={submit.isPending}
            style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
          >
            {submit.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      <Modal
        show={showModal}
        onClose={handleModalClose}
        title="Submission Successful"
        message="Your assessment has been submitted successfully!"
      />
    </div>
  );
}