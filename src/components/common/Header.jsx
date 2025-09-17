import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Candidates', path: '/candidates' },
    { label: 'Kanban', path: '/kanban' },
  ];

  const navLinkStyle = (isActive) => ({
    color: isActive ? '#e0f2ff' : '#cce0ff',
    fontWeight: 500,
    textDecoration: 'none',
    padding: '0.5rem 0.75rem',
    borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    transform: 'scale(1)',
  });

  const buttonStyle = {
    fontWeight: 600,
    borderRadius: '20px',
    padding: '0.4rem 1.2rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '1px',
          color: '#fff',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        TalentFlow
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {navLinks.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end
            style={({ isActive }) => navLinkStyle(isActive)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
              e.currentTarget.style.backgroundColor = isActive ? 'transparent' : 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
       
      
      </div>
    </nav>
  );
}
