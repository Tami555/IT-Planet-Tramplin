import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import OpportunityCard from '../../components/OpportunityCard/OpportunityCard';
import Button from '../../components/UI/Button/Button';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import './FavoritesPage.css';


const FavoritesPage = () => {
  const navigate = useNavigate();
  const { IsAuth } = useAuth();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);

  // Загружаем отклики
  useEffect(() => {
    if (!IsAuth) {
      const storedApplied = localStorage.getItem('applied');
      if (storedApplied) {
        try {
          setAppliedOpportunities(JSON.parse(storedApplied));
        } catch (e) {
          console.error('Error parsing applied:', e);
        }
      }
    } else {
      // Для авторизованных - позже
    }
  }, [IsAuth]);

  const handleFavoriteToggle = (opportunity) => {
    removeFromFavorites(opportunity.id);
  };

  const handleApply = (opportunityId) => {
    const opportunity = favorites.find(fav => fav.id === opportunityId);
    if (!opportunity) return;

    if (!IsAuth) {
      alert('Вы не можете откликнуться на возможность! Войдите в аккаунт.');
    } else {
      // Для авторизованных - позже
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Вы уверены, что хотите удалить все избранное?')) {
      clearFavorites();
    }
  };

  return (
    <div className="favorites-page">
      <Header isAuth={IsAuth} />
      
      <div className="favorites-container container">
        {/* Навигация */}
        <div className="favorites-nav">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
        </div>

        {/* Заголовок */}
        <div className="favorites-header">
          <div className="header-left">
            <Heart size={32} className="header-icon" />
            <h1 className="favorites-title">Избранное</h1>
            {favorites.length > 0 && (
              <span className="favorites-count">{favorites.length}</span>
            )}
          </div>
          {favorites.length > 0 && (
            <Button 
              variant="outline" 
              size="medium"
              onClick={handleClearAll}
              className="clear-all-btn"
            >
              <Trash2 size={18} />
              Очистить всё
            </Button>
          )}
        </div>

        {/* Контент */}
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map(opportunity => {
              const isApplied = appliedOpportunities.some(app => app.id === opportunity.id);
              return (
                <div key={opportunity.id} className="favorite-item">
                  <OpportunityCard
                    opportunity={opportunity}
                    isFavorite={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    variant="default"
                  />
                  <div className="favorite-actions">
                    <Button
                      variant={isApplied ? 'outline' : 'primary'}
                      size="small"
                      onClick={() => handleApply(opportunity.id)}
                      disabled={isApplied}
                    >
                      {isApplied ? '✓ Откликнулись' : 'Откликнуться'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => removeFromFavorites(opportunity.id)}
                    >
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="favorites-empty">
            <div className="empty-icon">
              <Heart size={64} strokeWidth={1.5} />
            </div>
            <h2>Избранное пусто</h2>
            <p>Добавляйте интересные вакансии, стажировки и мероприятия в избранное, чтобы не потерять их</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Найти возможности
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FavoritesPage;