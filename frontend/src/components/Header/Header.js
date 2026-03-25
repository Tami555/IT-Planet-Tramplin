import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Briefcase, LogIn, Users } from 'lucide-react';
import Button from '../UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import { default_user_ava } from '../../images';
import { useFetch } from '../../hooks/useFetch';
import { getCurrentApplicant, getCurrentEmployer } from '../../api/services';
import { getMediaData } from '../../utils/files';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { IsAuth, IsApplicant, IsAdmin } = useAuth();
  const [currentUser, setCurrentUser] = useState({});

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getProfilePath = () => {
    if (IsApplicant) return '/profile';
    if (!IsApplicant && !IsAdmin) return '/employer/profile';
    return '/profile';
  };

  const [getCurrentUser, loadingUser] = useFetch(async () => {
    if (IsApplicant){
      const res = await getCurrentApplicant();
      setCurrentUser(res);
    }
    if (IsAuth && !IsAdmin && !IsApplicant) {
      console.log('AAAAAAAAAAAAAAA')
      const res = await getCurrentEmployer();
      setCurrentUser(res);
    }
    return;
  });
  useEffect(() => {getCurrentUser()}, [])

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
            {(IsApplicant === true || IsAuth === false) && (
              <Link 
                to="/favorites" 
                className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
              >
                <Heart size={18} />
                <span>Избранное</span>
              </Link>
            )}
            {(IsApplicant === true) && (
              <>
                <Link 
                    to="/contacts" 
                    className={`nav-link ${isActive('/contacts') ? 'active' : ''}`}
                  >
                    <Users size={18} />
                    <span>Контакты</span>
                  </Link>
              </>
            )}
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
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => navigate(getProfilePath())}
              >
                <img 
                  src={currentUser?.avatarUrl ? getMediaData(currentUser?.avatarUrl) : (currentUser?.logoUrl ? currentUser?.logoUrl : default_user_ava)} 
                  alt={currentUser?.firstName || 'User'}
                />
              </button>
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