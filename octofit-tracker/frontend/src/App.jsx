import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import './App.css'

function App() {
  const navigation = [
    { label: 'Activities', path: '/activities' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Teams', path: '/teams' },
    { label: 'Members', path: '/users' },
    { label: 'Workouts', path: '/workouts' },
  ]

  return (
    <div className="tracker-shell">
      <header className="tracker-header">
        <NavLink className="brand" to="/activities" aria-label="Octofit home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>octofit<span className="brand-period">.</span></span>
        </NavLink>
        <p className="header-caption">Your training, in motion</p>
      </header>

      <nav className="tracker-nav" aria-label="Main navigation">
        {navigation.map(({ label, path }) => (
          <NavLink
            key={path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            to={path}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="tracker-main">
        <Routes>
          <Route path="/" element={<Navigate replace to="/activities" />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="*" element={<Navigate replace to="/activities" />} />
        </Routes>
      </main>
      <footer className="tracker-footer">OCTOFIT <span>·</span> MOVE WITH INTENT</footer>
    </div>
  )
}

export default App
