import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCreateJob, useJobsList, useReorderJobs, useUpdateJob } from '../../hooks/useJobs'
import Pagination from '../common/Pagination'
import Toast, { useToast } from '../common/Toast'
import JobFormModal from './JobFormModal'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import './JobsPage.css'

const FILTERS = [
  { key: '', label: 'All Jobs' },
  { key: 'active', label: 'Active' },
  { key: 'archived', label: 'Archived' },
]

export default function JobsPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 12, search: '', status: '' })
  const { data, isLoading, isError, error } = useJobsList(params)
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const reorder = useReorderJobs(params)
  const { toast, show } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  const jobs = data?.data || []
  const total = data?.total || 0

  function onDragEnd(result) {
    if (!result.destination) return
    const fromIndex = result.source.index
    const toIndex = result.destination.index
    const fromOrder = jobs[fromIndex]?.order
    const toOrder = jobs[toIndex]?.order
    if (fromOrder === undefined || toOrder === undefined) return
    reorder.mutate(
      { id: jobs[fromIndex].id, fromOrder, toOrder, fromIndex, toIndex },
      { onError: () => show('Reorder failed and was rolled back') }
    )
  }

  function toggleArchive(job) {
    updateJob.mutate(
      { id: job.id, data: { status: job.status === 'active' ? 'archived' : 'active' } },
      { onError: (err) => show(err?.message || 'Update failed') }
    )
  }

  function openEditModal(job) {
    setEditingJob(job)
    setShowModal(true)
  }

  function openCreateModal() {
    setEditingJob(null)
    setShowModal(true)
  }

  function handleFormSubmit(values) {
    if (editingJob) {
      updateJob.mutate(
        { id: editingJob.id, data: values },
        {
          onSuccess: () => setShowModal(false),
          onError: (err) => show(err?.message || 'Failed to update job'),
        }
      )
    } else {
      createJob.mutate(values, {
        onSuccess: () => setShowModal(false),
        onError: (err) => show(err?.message || 'Failed to create job'),
      })
    }
  }

  return (
    <div className="jobs-page-wrapper py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 px-3 py-2 jobs-header">
          <h2 className="m-0">Jobs Management</h2>
          <span className="small opacity-75">Drag & drop to reorder jobs</span>
        </div>

        {/* Action Button */}
        <div className="d-flex justify-content-end mb-4">
          <button
            className="btn btn-light text-primary fw-bold shadow-sm jobs-add-btn"
            onClick={openCreateModal}
          >
            + Add Job
          </button>
        </div>

        {/* Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <span className="input-group-text bg-white border-end-0">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by job title or ID…"
              value={params.search}
              onChange={(e) => setParams((p) => ({ ...p, page: 1, search: e.target.value }))}
            />
            {params.search && (
              <button
                className="btn btn-outline-danger"
                onClick={() => setParams((p) => ({ ...p, page: 1, search: '' }))}
              >
                Clear
              </button>
            )}
          </div>

          <div className="d-flex gap-2">
            {FILTERS.map((f) => {
              const isActive = params.status === f.key
              let bgColor = '#0d6efd'
              if (f.key === 'active') bgColor = '#198754'
              else if (f.key === 'archived') bgColor = '#6c757d'

              return (
                <button
                  key={f.key}
                  className="jobs-filter-btn"
                  style={{
                    border: isActive ? 'none' : `1px solid ${bgColor}`,
                    backgroundColor: isActive ? bgColor : 'transparent',
                    color: isActive ? '#fff' : bgColor,
                  }}
                  onClick={() => setParams((p) => ({ ...p, page: 1, status: f.key }))}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Job List */}
        {isLoading && <div className="text-muted">Loading jobs…</div>}
        {isError && <div className="alert alert-danger">{String(error.message || error)}</div>}
        {!isLoading && jobs.length === 0 && (
          <div className="alert alert-secondary">No job postings found</div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="row g-4">
                {jobs.map((job, idx) => (
                  <Draggable key={job.id} draggableId={job.id} index={idx}>
                    {(p, snapshot) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className="col-12 col-md-6 col-lg-4"
                      >
                        <div
                          className={`card h-100 border-0 shadow-sm jobs-card ${
                            snapshot.isDragging ? 'dragging' : ''
                          }`}
                        >
                          <div className="card-body d-flex flex-column p-3">
                            <h5 className="jobs-card-title mb-1">{job.title}</h5>
                            <div className="d-flex flex-column mb-2">
                              <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                ID: <span className="fw-semibold">{job.id}</span>
                              </small>
                              {job.slug && (
                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                  Slug: <span className="fw-semibold">{job.slug}</span>
                                </small>
                              )}
                            </div>
                            <small
                              className={`jobs-status ${
                                job.status === 'active' ? 'active' : 'archived'
                              }`}
                            >
                              {job.status === 'active' ? 'Active' : 'Archived'}
                            </small>

                            {job.tags?.length > 0 && (
                              <div className="mb-3">
                                {job.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="badge rounded-pill bg-primary text-white jobs-tag"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="jobs-actions">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => openEditModal(job)}
                              >
                                Edit
                              </button>
                              <button
                                className={`btn ${
                                  job.status === 'active'
                                    ? 'btn-outline-secondary'
                                    : 'btn-outline-success'
                                }`}
                                onClick={() => toggleArchive(job)}
                              >
                                {job.status === 'active' ? 'Archive' : 'Activate'}
                              </button>
                              <Link
                                to={`/assessments/${job.id}`}
                                className="btn btn-outline-info"
                              >
                                Builder
                              </Link>
                              <Link
                                to={`/assessments/${job.id}/run`}
                                className="btn btn-outline-success"
                              >
                                Run
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Pagination */}
        <div className="d-flex justify-content-end mt-5">
          <Pagination
            page={params.page}
            pageSize={params.pageSize}
            total={total}
            onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          />
        </div>
      </div>

      {/* Job Modal */}
      {showModal && (
        <JobFormModal
          initialValues={editingJob || { title: '', status: 'active', tags: [] }}
          isLoading={editingJob ? updateJob.isPending : createJob.isPending}
          error={editingJob ? updateJob.error : createJob.error}
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <Toast toast={toast} />
    </div>
  )
}
