import './App.css'
import { Route, Routes } from 'react-router-dom'
import JobsPage from './components/Jobs/JobsPage'
import CandidatesPage from './components/Candidates/CandidatesPage'
import CandidateProfile from './components/Candidates/CandidateProfile'
import KanbanBoard from './components/Candidates/KanbanBoard'
import Builder from './components/Assessments/Builder'
import RuntimeForm from './components/Assessments/RuntimeForm'
import Header from './components/common/Header'
import Home from './components/common/Home'
export default function App() {
  return (
    <div className="page-shell">
      <Header />
      <main className="main-content fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/assessments/:jobId" element={<Builder />} />
          <Route path="/assessments/:jobId/run" element={<RuntimeForm />} />
        </Routes>
      </main>
    </div>
  )
}
