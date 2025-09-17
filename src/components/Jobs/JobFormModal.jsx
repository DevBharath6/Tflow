import { useForm } from 'react-hook-form'

export default function JobFormModal({ initialValues, onSubmit, onClose, isLoading, error }) {
  const isEdit = !!initialValues?.id

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialValues?.title || '',
      tags: initialValues?.tags?.join(', ') || '',
      status: initialValues?.status || 'active',
    },
  })

  return (
    <div
      className="modal d-block fade show"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content shadow-lg border-0">
          {/* Header */}
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">{isEdit ? 'Edit Job' : 'Create Job'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit((values) => {
              const tags = values.tags
                ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : []
              onSubmit({
                title: values.title,
                tags,
                status: values.status,
              })
            })}
          >
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  {String(error.message || error)}
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Job Title</label>
                <input
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title.message}</div>
                )}
              </div>

              {/* Tags */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Tags (comma-separated)</label>
                <input className="form-control" {...register('tags')} />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gradient px-4 fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Saving…' : isEdit ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
