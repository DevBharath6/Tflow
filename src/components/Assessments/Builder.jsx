import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment, useSaveAssessment } from '../../hooks/useAssessments';
import Preview from './Preview';

const EMPTY = (jobId) => ({
  jobId,
  sections: [{ id: 's1', title: 'Section 1', questions: [] }],
  updatedAt: new Date().toISOString()
});

const TYPES = [
  { value: 'single', label: 'Single choice' },
  { value: 'multi', label: 'Multi choice' },
  { value: 'short', label: 'Short text' },
  { value: 'long', label: 'Long text' },
  { value: 'number', label: 'Numeric' },
  { value: 'file', label: 'File' },
];

export default function Builder() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data } = useAssessment(jobId);
  const save = useSaveAssessment(jobId);
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!jobId) {
      alert('Job ID is missing. Cannot build assessment.');
      navigate(-1);
      return;
    }
    if (data) setModel(data);
    else setModel(EMPTY(jobId));
  }, [data, jobId, navigate]);

  if (!model) return <div className="container py-4">Loading…</div>;

  function addSection() {
    setModel(m => ({
      ...m,
      sections: [...m.sections, { id: `s${m.sections.length + 1}`, title: `Section ${m.sections.length + 1}`, questions: [] }],
      updatedAt: new Date().toISOString()
    }));
  }

  function removeSection(idx) {
    if (window.confirm('Are you sure you want to remove this section?')) {
      setModel(m => {
        const sections = [...m.sections];
        sections.splice(idx, 1);
        return { ...m, sections, updatedAt: new Date().toISOString() };
      });
    }
  }

  function addQuestion(sectionIdx, type) {
    setModel(m => {
      const sections = [...m.sections];
      const sec = { ...sections[sectionIdx] };
      const id = `q${(sec.questions?.length || 0) + 1}`;
      const base = { id, type, label: `Question ${id}` };
      if (type === 'single' || type === 'multi') base.choices = ['Option A', 'Option B'];
      if (type === 'number') { base.min = 0; base.max = 100 }
      if (type === 'short') base.maxLength = 120;
      if (type === 'long') base.maxLength = 500;
      sec.questions = [...(sec.questions || []), base];
      sections[sectionIdx] = sec;
      return { ...m, sections, updatedAt: new Date().toISOString() };
    });
  }

  function removeQuestion(sectionIdx, qIdx) {
    if (window.confirm('Remove this question?')) {
      setModel(m => {
        const sections = [...m.sections];
        const qs = [...sections[sectionIdx].questions];
        qs.splice(qIdx, 1);
        sections[sectionIdx].questions = qs;
        return { ...m, sections, updatedAt: new Date().toISOString() };
      });
    }
  }

  function updateQuestion(sectionIdx, qIdx, patch) {
    setModel(m => {
      const sections = [...m.sections];
      const sec = { ...sections[sectionIdx] };
      const qs = [...(sec.questions || [])];
      qs[qIdx] = { ...qs[qIdx], ...patch };
      sec.questions = qs;
      sections[sectionIdx] = sec;
      return { ...m, sections, updatedAt: new Date().toISOString() };
    });
  }

  // New function to update a single choice
  function updateChoice(sectionIdx, qIdx, choiceIdx, value) {
    setModel(m => {
      const sections = [...m.sections];
      const sec = { ...sections[sectionIdx] };
      const qs = [...(sec.questions || [])];
      const choices = [...qs[qIdx].choices];
      choices[choiceIdx] = value;
      qs[qIdx] = { ...qs[qIdx], choices };
      sec.questions = qs;
      sections[sectionIdx] = sec;
      return { ...m, sections, updatedAt: new Date().toISOString() };
    });
  }

  // New function to add a new choice
  function addChoice(sectionIdx, qIdx) {
    setModel(m => {
      const sections = [...m.sections];
      const sec = { ...sections[sectionIdx] };
      const qs = [...(sec.questions || [])];
      const choices = [...(qs[qIdx].choices || []), `Option ${String.fromCharCode(65 + (qs[qIdx].choices?.length || 0))}`];
      qs[qIdx] = { ...qs[qIdx], choices };
      sec.questions = qs;
      sections[sectionIdx] = sec;
      return { ...m, sections, updatedAt: new Date().toISOString() };
    });
  }

  // New function to remove a choice
  function removeChoice(sectionIdx, qIdx, choiceIdx) {
    setModel(m => {
      const sections = [...m.sections];
      const sec = { ...sections[sectionIdx] };
      const qs = [...(sec.questions || [])];
      const choices = [...qs[qIdx].choices];
      choices.splice(choiceIdx, 1);
      qs[qIdx] = { ...qs[qIdx], choices };
      sec.questions = qs;
      sections[sectionIdx] = sec;
      return { ...m, sections, updatedAt: new Date().toISOString() };
    });
  }

  function saveModel() {
    const hasQuestions = model.sections.some(sec => sec.questions.length > 0);
    if (!hasQuestions) {
      alert('Add at least one question before saving.');
      return;
    }

    const cleanedModel = {
      ...model,
      sections: model.sections.map(sec => ({
        ...sec,
        questions: sec.questions.map(q => ({
          ...q,
          min: q.min !== undefined ? Number(q.min) : undefined,
          max: q.max !== undefined ? Number(q.max) : undefined,
          maxLength: q.maxLength !== undefined ? Number(q.maxLength) : undefined
        }))
      }))
    };

    save.mutate(cleanedModel, {
      onSuccess: () => alert('Assessment saved successfully!'),
      onError: (err) => alert('Failed to save assessment: ' + (err?.message || 'Unknown error'))
    });
  }

  return (
    <div className="container py-5" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="mb-0 text-dark" style={{ fontWeight: '600' }}>Assessment Builder 📋</h2>
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={saveModel}
          disabled={save.isPending}
          style={{ backgroundColor: '#007bff', borderColor: '#007bff', transition: 'all 0.3s ease' }}
        >
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="row g-4">
        {/* Builder panel */}
        <div className="col-lg-6">
          {model.sections.map((s, si) => (
            <div key={s.id} className="card mb-4 shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="card-header d-flex align-items-center bg-white border-0 py-3 ps-4 pe-2" style={{ borderBottom: '2px solid #e9ecef' }}>
                <input
                  className="form-control form-control-lg me-2 border-0"
                  style={{ fontWeight: '600', color: '#333' }}
                  value={s.title}
                  onChange={e => setModel(m => {
                    const sections = [...m.sections];
                    sections[si] = { ...sections[si], title: e.target.value };
                    return { ...m, sections };
                  })}
                />
                <button className="btn btn-outline-danger btn-sm" onClick={() => removeSection(si)}>Remove Section</button>
              </div>

              <div className="card-body bg-white p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                  <span className="text-muted fw-bold me-2">Add Question:</span>
                  {TYPES.map(t => (
                    <button key={t.value} className="btn btn-primary btn-sm" onClick={() => addQuestion(si, t.value)} style={{ backgroundColor: '#e7f1ff', color: '#007bff', borderColor: '#e7f1ff', transition: 'background-color 0.2s' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {(s.questions || []).map((q, qi) => (
                  <div key={q.id} className="mb-3 border p-3" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <input
                        className="form-control form-control-sm flex-grow-1"
                        placeholder="Question label"
                        value={q.label}
                        onChange={e => updateQuestion(si, qi, { label: e.target.value })}
                        style={{ borderRadius: '6px', borderColor: '#e9ecef' }}
                      />
                      <select
                        className="form-select form-select-sm"
                        value={q.type}
                        onChange={e => updateQuestion(si, qi, { type: e.target.value })}
                        style={{ borderRadius: '6px', borderColor: '#e9ecef', width: '150px' }}
                      >
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <div className="form-check m-0 d-flex align-items-center gap-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={!!q.required}
                          onChange={e => updateQuestion(si, qi, { required: e.target.checked })}
                          id={`required-${si}-${qi}`}
                        />
                        <label className="form-check-label text-muted" htmlFor={`required-${si}-${qi}`} style={{ fontSize: '0.9rem' }}>Required</label>
                      </div>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => removeQuestion(si, qi)} style={{ borderRadius: '6px' }}>Remove</button>
                    </div>

                    {/* Type-specific inputs */}
                    {(q.type === 'single' || q.type === 'multi') && (
                      <div className="d-flex flex-column gap-2 mb-2">
                        {(q.choices || []).map((choice, choiceIdx) => (
                          <div key={choiceIdx} className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Option ${choiceIdx + 1}`}
                              value={choice}
                              onChange={e => updateChoice(si, qi, choiceIdx, e.target.value)}
                              style={{ borderRadius: '6px', borderColor: '#e7f1ff', backgroundColor: '#fff' }}
                            />
                            <button
                              className="btn btn-outline-danger"
                              type="button"
                              onClick={() => removeChoice(si, qi, choiceIdx)}
                              style={{ borderRadius: '6px' }}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => addChoice(si, qi)}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                    {q.type === 'number' && (
                      <div className="d-flex gap-2 mb-2">
                        <input type="number" className="form-control form-control-sm" placeholder="min" value={q.min ?? ''} onChange={e => updateQuestion(si, qi, { min: e.target.value === '' ? undefined : Number(e.target.value) })} style={{ borderRadius: '6px', borderColor: '#e7f1ff', backgroundColor: '#fff' }} />
                        <input type="number" className="form-control form-control-sm" placeholder="max" value={q.max ?? ''} onChange={e => updateQuestion(si, qi, { max: e.target.value === '' ? undefined : Number(e.target.value) })} style={{ borderRadius: '6px', borderColor: '#e7f1ff', backgroundColor: '#fff' }} />
                      </div>
                    )}
                    {(q.type === 'short' || q.type === 'long') && (
                      <input type="number" className="form-control form-control-sm mb-2" placeholder="Max length" value={q.maxLength ?? ''} onChange={e => updateQuestion(si, qi, { maxLength: e.target.value === '' ? undefined : Number(e.target.value) })} style={{ borderRadius: '6px', borderColor: '#e7f1ff', backgroundColor: '#fff' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn btn-outline-primary btn-lg w-100"
            onClick={addSection}
            style={{ borderRadius: '10px', borderColor: '#007bff', color: '#007bff', borderWidth: '2px', fontWeight: '600' }}
          >
            + Add Section
          </button>
        </div>

        {/* Preview */}
        <div className="col-lg-6">
          <Preview model={model} />
        </div>
      </div>
    </div>
  );
}