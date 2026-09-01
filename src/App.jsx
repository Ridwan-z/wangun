import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HouseView } from './pages/HouseView';
import { EditorView } from './pages/EditorView';
import { LogoMark } from './components/ui/BlueprintIcons';
import './App.css';

const iconBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function NavBar() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-logo">
            <LogoMark />
          </span>
          <h2 className="nav-title"><span className="nav-title-accent">W</span>angun</h2>
        </div>
        <div className="nav-links">
          <a href="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <svg {...iconBase} className="nav-link-icon">
              <path d="M3.5 11.5 12 4l8.5 7.5" />
              <path d="M6 10.2V20h12v-9.8" />
            </svg>
            Rumah
          </a>
          <a href="/editor" className={`nav-link ${location.pathname === '/editor' ? 'active' : ''}`}>
            <svg {...iconBase} className="nav-link-icon">
              <path d="M4 20h16" />
              <path d="M6.5 20V9l5.5-4 5.5 4v11" />
              <path d="M10 20v-5h4v5" />
            </svg>
            Editor
          </a>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HouseView />} />
        <Route path="/editor" element={<EditorView />} />
      </Routes>
    </Router>
  );
}

export default App;

