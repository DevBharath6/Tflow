import { useState } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';

const STAGES = ['', 'applied','screen','tech','offer','hired','rejected'];

// Helper to get stage badge color
const getStageColor = (stage) => {
  switch(stage) {
    case 'applied': return '#0d6efd'; // blue
    case 'screen': return '#6f42c1'; // purple
    case 'tech': return '#fd7e14'; // orange
    case 'offer': return '#20c997'; // teal
    case 'hired': return '#198754'; // green
    case 'rejected': return '#dc3545'; // red
    default: return '#6c757d'; // gray for N/A
  }
};

export default function CandidatesPage() {
  const [params, setParams] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    stage: ''
  });

  const { data, isLoading } = useCandidates(params);
  const navigate = useNavigate();
  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#0d6efd',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ margin: 0 }}>Candidates</h2>
        <span style={{ fontSize: '0.875rem', opacity: 0.75 }}>Click on a card to view details</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by name, email or skill"
            value={params.search}
            onChange={e => setParams(p => ({ ...p, page: 1, search: e.target.value }))}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #ced4da',
              outline: 'none'
            }}
          />
          {params.search && (
            <button
              onClick={() => setParams(p => ({ ...p, page: 1, search: '' }))}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #dc3545',
                backgroundColor: '#dc3545',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <button
              key={s || 'all'}
              onClick={() => setParams(p => ({ ...p, page: 1, stage: s }))}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.375rem',
                border: params.stage === s ? 'none' : '1px solid #0d6efd',
                backgroundColor: params.stage === s ? '#0d6efd' : '#fff',
                color: params.stage === s ? '#fff' : '#0d6efd',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ color: '#6c757d' }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ color: '#6c757d' }}>No candidates found</div>
        ) : (
          rows.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/candidates/${c.id}`)}
              style={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              {/* Card Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0d6efd' }}>{c.name}</div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: getStageColor(c.stage)
                }}>
                  {c.stage || 'N/A'}
                </div>
              </div>

              {/* Card Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#495057' }}>
                <div><strong>Email:</strong> {c.email}</div>
                <div><strong>Job:</strong> {c.job}</div>
                <div><strong>Experience:</strong> {c.experience} yrs</div>
                <div><strong>Skills:</strong> {c.skills.join(', ')}</div>
                <div><strong>Location:</strong> {c.location}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <Pagination
          page={params.page}
          pageSize={params.pageSize}
          total={total}
          onPageChange={(page) => setParams(p => ({ ...p, page }))}
        />
      </div>
    </div>
  );
}
