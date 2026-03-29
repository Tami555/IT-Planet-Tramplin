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
import { useFetch } from '../../hooks/useFetch';
import { getUserApplications } from '../../api/services';


const FavoritesPage = () => {
  const navigate = useNavigate();
  const { IsAuth, IsApplicant, User } = useAuth();
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);

  // Загружаем отклики пользователя (только для авторизованных)
  const [fetchApplications, applicationsLoading] = useFetch(async () => {
    const response = await getUserApplications(1, 1000);
    setAppliedOpportunities(response?.data);
    return response;
  });
    
  useEffect(() => {
    if (IsAuth && IsApplicant && User) {
      fetchApplications();
    }
  }, [IsAuth, User]);

  // Функция для получения объекта возможности из favorites
  const getOpportunityObject = (favoriteItem) => {
    if (!IsAuth) {
      // Для неавторизованных - favoriteItem это сам объект возможности
      return favoriteItem;
    } else {
      // Для авторизованных - у favoriteItem есть поле opportunity
      return favoriteItem.opportunity;
    }
  };

  const handleFavoriteToggle = (opportunityId) => {
    removeFromFavorites(opportunityId);
  };

  const handleApply = (opportunityId) => {
    const favoriteItem = favorites.find(fav => {
      if (!IsAuth) {
        return fav.id === opportunityId;
      } else {
        return fav.opportunityId === opportunityId;
      }
    });
    
    if (!favoriteItem) return;
    
    const opportunity = getOpportunityObject(favoriteItem);
    
    if (!IsAuth) {
      alert('Вы не можете откликнуться на возможность! Войдите в аккаунт.');
    } else {
      // Для авторизованных - позже
      console.log('Отклик на:', opportunity);
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
            {favorites.map(favoriteItem => {
              // Получаем правильный объект возможности
              const opportunity = getOpportunityObject(favoriteItem);
              const opportunityId = !IsAuth ? opportunity.id : favoriteItem.opportunityId;
              const isApplied = appliedOpportunities.some(app => app.opportunityId === opportunityId);
              
              return (
                <div key={opportunityId} className="favorite-item">
                  <OpportunityCard
                    opportunity={opportunity}
                    isFavorite={true}
                    onFavoriteToggle={() => handleFavoriteToggle(opportunityId)}
                    variant="default"
                  />
                  <div className="favorite-actions">
                    <Button
                      variant={isApplied ? 'outline' : 'primary'}
                      size="small"
                      onClick={() => handleApply(opportunityId)}
                      disabled={isApplied}
                    >
                      {isApplied ? '✓ Откликнулись' : 'Откликнуться'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleFavoriteToggle(opportunityId)}
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