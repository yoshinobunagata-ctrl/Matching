import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <NavLink to="/home" className="logo">
            <span className="logo-icon">💕</span>
            <span className="logo-text">LoveMatch</span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🔍</span>
              <span>さがす</span>
            </NavLink>
            <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">💌</span>
              <span>マッチ</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👤</span>
              <span>プロフィール</span>
            </NavLink>
          </nav>
          <div className="header-user">
            <img src={user?.profile_image || 'https://via.placeholder.com/40'} alt="" className="avatar" />
            <button onClick={handleLogout} className="logout-btn">ログアウト</button>
          </div>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
