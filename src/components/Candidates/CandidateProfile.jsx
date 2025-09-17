import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './CandidateProfile.css'
import { client } from '../../api/client'

// Highlight @mentions in text
function MentionText({ text }) {
  return text.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="mention">{part}</span>
      : <span key={i}>{part}</span>
  )
}

export default function CandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch candidate details
  useEffect(() => {
    async function loadCandidate() {
      setLoading(true)
      try {
        const res = await client.get('/candidates')
        const c = (res.data || []).find(c => c.id === id)
        setCandidate(c || null)
      } catch (err) {
        console.error('Failed to load candidate:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCandidate()
  }, [id])

  // Generate unique ID
  const uniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`

  // Add a new note
  async function addNote() {
    if (!note.trim()) return

    const newNote = {
      id: uniqueId(),
      text: note.trim(),
      createdAt: new Date().toISOString()
    }

    try {
      // Append note only; backend should handle timeline
      const updatedCandidate = {
        ...candidate,
        notes: [...(candidate.notes || []), newNote]
      }

      // Patch candidate on backend and get updated record
      const res = await client.patch(`/candidates/${id}`, updatedCandidate)

      // Update local candidate
      setCandidate(res)
      setNote('')
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  if (loading) return <p className="loading">Loading…</p>
  if (!candidate) return <p className="loading">Candidate not found</p>

  return (
    <div className="profile">
      <header className="profile-header">
        <div>
          <h2>{candidate.name}</h2>
          <p className="email">{candidate.email}</p>
          <p><b>Job:</b> {candidate.job}</p>
          <p><b>Experience:</b> {candidate.experience} yrs</p>
          <p><b>Skills:</b> {candidate.skills?.join(', ')}</p>
          <p><b>Location:</b> {candidate.location}</p>
        </div>
        <span className={`stage-badge ${candidate.stage}`}>{candidate.stage}</span>
      </header>

      <div className="notes-timeline">
        {/* Notes */}
        <section className="card">
          <h3>Notes</h3>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write a note with @mentions"
          />
          <button onClick={addNote}>Add</button>
          <div className="notes-list">
            {(candidate.notes || []).slice().reverse().map(n => (
              <div key={n.id} className="note-item">
                <small>{new Date(n.createdAt).toLocaleString()}</small>
                <p><MentionText text={n.text} /></p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="card">
          <h3>Timeline</h3>
          <div className="timeline-list">
            {(candidate.timeline || []).slice().reverse().map(t => (
              <div key={t.id} className="timeline-item">
                <small>{new Date(t.at).toLocaleString()}</small>
                <p>{t.from ? `${t.from} → ${t.to}` : t.to}</p>
                {t.note && <p className="timeline-note"><MentionText text={t.note} /></p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
