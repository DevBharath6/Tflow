import { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '../../api/client'
import Toast, { useToast } from '../common/Toast'

const STAGES = ['applied','screen','tech','offer','hired','rejected']
const QUERY_KEY = ['candidates-kanban']

const STAGE_COLORS = {
  applied: '#fef3c7',
  screen: '#dbeafe',
  tech: '#cffafe',
  offer: '#e0f2fe',
  hired: '#dcfce7',
  rejected: '#fee2e2'
}

function Column({ stage, items, provided }) {
  return (
    <div className="col-auto" style={{ minWidth: 300 }} ref={provided.innerRef} {...provided.droppableProps}>
      <div className="card h-100 shadow-sm">
        <div
          className="card-header d-flex justify-content-between align-items-center text-capitalize"
          style={{
            backgroundColor: STAGE_COLORS[stage] || '#f3f4f6',
            fontWeight: 600,
            fontSize: '1rem',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            borderTopLeftRadius: '.25rem',
            borderTopRightRadius: '.25rem'
          }}
        >
          <span>{stage}</span>
          <span className="badge bg-secondary">{items.length}</span>
        </div>
        <div className="list-group list-group-flush" style={{ minHeight: 200, maxHeight: '70vh', overflowY: 'auto', padding: '8px' }}>
          {items.map((candidate, idx) => (
            <CandidateCard candidate={candidate} key={candidate.id?.toString() || idx.toString()} index={idx} />
          ))}
          {provided.placeholder}
        </div>
      </div>
    </div>
  )
}

function CandidateCard({ candidate, index }) {
  const [expanded, setExpanded] = useState(false)

  const renderNotes = () => {
    if (!candidate.notes || candidate.notes.length === 0) return null
    return (
      <div className="mt-2 border-top pt-2">
        <strong>Notes:</strong>
        <ul className="small text-muted mb-0">
          {candidate.notes.map((n, i) => (
            <li key={i}>{typeof n === 'string' ? n : n.text || JSON.stringify(n)}</li>
          ))}
        </ul>
      </div>
    )
  }

  // prevent click toggle while dragging
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Draggable draggableId={candidate.id?.toString() || index.toString()} index={index}>
      {(p, snapshot) => {
        if (snapshot.isDragging !== isDragging) setIsDragging(snapshot.isDragging)
        return (
          <div
            ref={p.innerRef}
            {...p.draggableProps}
            {...p.dragHandleProps}
            onClick={() => !isDragging && setExpanded(!expanded)}
            className="list-group-item mb-2 rounded shadow-sm"
            style={{
              backgroundColor: snapshot.isDragging ? '#dbeafe' : '#fff',
              cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
              padding: '10px',
              transition: 'all 0.2s ease',
              ...p.draggableProps.style
            }}
          >
            <div className="fw-bold">{candidate.name || 'Unnamed Candidate'}</div>
            {candidate.job && <div className="small text-muted">{candidate.job}</div>}

            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
              <div className="mt-1">
                {candidate.skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.65rem' }}>{skill}</span>
                ))}
              </div>
            )}

            {expanded && (
              <>
                {candidate.email && <div className="small text-muted">Email: {candidate.email}</div>}
                {candidate.location && <div className="small text-muted">Location: {candidate.location}</div>}
                {candidate.experience && <div className="small text-muted">Experience: {candidate.experience} years</div>}
                {renderNotes()}
              </>
            )}
          </div>
        )
      }}
    </Draggable>
  )
}

export default function KanbanBoard() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => client.get('/candidates?page=1&pageSize=2000')
  })
  const list = data?.data || []
  const { toast, show } = useToast()

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map(s => [s, []]))
    for (const c of list) {
      const stage = c.stage && STAGES.includes(c.stage) ? c.stage : 'applied'
      g[stage].push(c)
    }
    return g
  }, [list])

  const move = useMutation({
    mutationFn: ({ id, stage }) => client.patch(`/candidates/${id}`, { stage }),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const prev = qc.getQueryData(QUERY_KEY)
      qc.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old
        const data = old.data.map(c => c.id === id ? { ...c, stage } : c)
        return { ...old, data }
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev)
      show('Move failed and was rolled back')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  })

  const onDragEnd = (result) => {
    if (!result.destination) return
    const fromStage = result.source.droppableId
    const toStage = result.destination.droppableId
    const fromIndex = result.source.index
    const toIndex = result.destination.index

    const sourceColumn = [...grouped[fromStage]]
    const [moved] = sourceColumn.splice(fromIndex, 1)

    if (fromStage === toStage) {
      sourceColumn.splice(toIndex, 0, moved)
      const newData = list.map(c => {
        const idx = sourceColumn.findIndex(x => x.id === c.id)
        return idx > -1 ? { ...c, order: idx } : c
      })
      qc.setQueryData(QUERY_KEY, { ...data, data: newData })
    } else {
      move.mutate({ id: moved.id, stage: toStage })
    }
  }

  return (
    <div className="container-fluid py-3">
      <div
        className="d-flex justify-content-between align-items-center mb-4 px-3 py-2"
        style={{
          backgroundColor: '#0d6efd',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h2 className="m-0">Kanban Board</h2>
        <span className="small opacity-75">Drag & drop candidates across stages</span>
      </div>

      <div className="d-flex overflow-auto px-3" style={{ gap: '16px' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {STAGES.map(stage => (
            <Droppable droppableId={stage} key={stage}>
              {(provided) => (
                <Column stage={stage} items={grouped[stage] || []} provided={provided} />
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
      <Toast toast={toast} />
    </div>
  )
}
