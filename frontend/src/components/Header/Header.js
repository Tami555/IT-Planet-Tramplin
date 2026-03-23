import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogIn, Home, Heart, Briefcase } from 'lucide-react';
import Button from '../UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import { logout } from '../../api/services';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { IsAuth, User, ClearUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const logout_func = async () => {
    await logout();
    ClearUser();
    window.location = '/';
  }

  return (
    <header className="header">
      <div className="header-container container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">Трамплин</span>
          </Link>
          
          <nav className="nav-menu">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Главная</span>
            </Link>
            <Link 
              to="/favorites" 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>Избранное</span>
            </Link>
            <Link 
              to="/companies" 
              className={`nav-link ${isActive('/companies') ? 'active' : ''}`}
            >
              <Briefcase size={18} />
              <span>Компании</span>
            </Link>
          </nav>
        </div>

        <div className="header-right">
          {IsAuth ? (
            <div className="user-menu" onMouseLeave={() => setIsDropdownOpen(false)}>
              <button 
                className="user-avatar"
                onMouseEnter={() => setIsDropdownOpen(true)}
              >
                <img 
                  src={User?.logo || "https://img.freepik.com/premium-photo/cool-hacker-cat_1231246-6534.jpg?semt=ais_hybrid" } 
                  alt={User?.first_name || 'User'}
                />
              </button>
              {isDropdownOpen && (
                <div className="user-dropdown" onMouseEnter={() => setIsDropdownOpen(true)}>
                  <div className="dropdown-user-info">
                    <strong>{User?.first_name} {User?.last_name}</strong>
                    <span>{User?.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item">Профиль</Link>
                  <Link to="/dashboard" className="dropdown-item">Личный кабинет</Link>
                  <Link to="/settings" className="dropdown-item">Настройки</Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={logout_func}>Выйти</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Button 
                variant="outline" 
                size="medium"
                onClick={() => navigate('/login')}
              >
                <LogIn size={18} />
                Вход
              </Button>
              <Button 
                variant="primary" 
                size="medium"
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;