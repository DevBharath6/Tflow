import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>TalentFlow</h1>
          <p>HR Modern, fast, and intuitive hiring platform.</p>
          <div className="hero-cta">
            <Link to="/jobs" className="btn primary-btn">Explore Jobs</Link>
            <Link to="/candidates" className="btn outline-btn">Browse Candidates</Link>
          </div>
        </div>
        <div className="hero-illustration">
          {/* You can add an SVG or image here */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h3>Jobs Management</h3>
          <p>Create, filter, and manage jobs with ease and speed.</p>
          <Link to="/jobs" className="btn small-btn">Go to Jobs</Link>
        </div>

        <div className="feature">
          <h3>Candidates at Scale</h3>
          <p>Search and manage 1000+ candidates instantly.</p>
          <Link to="/candidates" className="btn small-btn">Go to Candidates</Link>
        </div>

        
      </section>
    </div>
  );
}
