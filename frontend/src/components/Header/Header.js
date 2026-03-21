import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, Home, Heart, Briefcase } from 'lucide-react';
import Button from '../UI/Button/Button';
import './Header.css';

const Header = ({ isAuth = false }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">Трамплин</span>
          </Link>
          
          <nav className="nav-menu">
            <Link to="/" className="nav-link active">
              <Home size={18} />
              <span>Главная</span>
            </Link>
            <Link to="/favorites" className="nav-link">
              <Heart size={18} />
              <span>Избранное</span>
            </Link>
            <Link to="/companies" className="nav-link">
              <Briefcase size={18} />
              <span>Компании</span>
            </Link>
          </nav>
        </div>

        <div className="header-right">
          {isAuth ? (
            <div className="user-menu">
              <button className="user-avatar">
                <img src="https://via.placeholder.com/32x32" alt="User" />
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">Профиль</Link>
                <Link to="/dashboard" className="dropdown-item">Личный кабинет</Link>
                <Link to="/settings" className="dropdown-item">Настройки</Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout">Выйти</button>
              </div>
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