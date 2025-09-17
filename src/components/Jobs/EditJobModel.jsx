import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'

export default function EditJobModal({ job, isLoading, error, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    status: 'active',
    tags: ''
  })

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        slug: job.slug || '',
        status: job.status || 'active',
        tags: job.tags?.join(', ') || ''
      })
    }
  }, [job])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <Modal
      show
      onHide={onClose}
      centered
      scrollable
      size="md"
      backdrop="static"
      keyboard={false}
      container={document.body}  // 👈 ensures modal is not blocked by .container
    >
      <Modal.Header closeButton className="border-0 bg-light">
        <h5 className="fw-bold text-dark mb-0">Edit Job</h5>
      </Modal.Header>
      <form onSubmit={handleSubmit} className="needs-validation">
        <Modal.Body className="px-4">
          {error && <div className="alert alert-danger">{String(error)}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input
              className="form-control form-control-lg border-dark-subtle shadow-sm"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Job title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Slug</label>
            <input
              className="form-control border-dark-subtle shadow-sm"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="job-slug"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Status</label>
            <select
              className="form-select border-dark-subtle shadow-sm"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Tags</label>
            <input
              className="form-control border-dark-subtle shadow-sm"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="comma,separated,tags"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 fw-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-dark px-4 fw-semibold" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
