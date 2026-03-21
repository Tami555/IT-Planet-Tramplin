import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { IsAuth } = useAuth();

  // Загружаем избранное при монтировании
  useEffect(() => {
    if (!IsAuth) {
      // Для неавторизованных - из localStorage
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (e) {
          console.error('Error parsing favorites:', e);
          setFavorites([]);
        }
      }
    } else {
      // Для авторизованных - позже будем делать запрос к бэкенду
      // Пока оставляем пустым
      setFavorites([]);
    }
  }, [IsAuth]);

  // Добавить в избранное
  const addToFavorites = (opportunity) => {
    if (!IsAuth) {
      // Неавторизованные - в localStorage
      setFavorites(prev => {
        if (prev.some(item => item.id === opportunity.id)) {
          return prev;
        }
        const newFavorites = [...prev, opportunity];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    } else {
      // Авторизованные - позже запрос к бэкенду
      setFavorites(prev => {
        if (prev.some(item => item.id === opportunity.id)) {
          return prev;
        }
        return [...prev, opportunity];
      });
    }
  };

  // Удалить из избранного
  const removeFromFavorites = (opportunityId) => {
    if (!IsAuth) {
      setFavorites(prev => {
        const newFavorites = prev.filter(item => item.id !== opportunityId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    } else {
      setFavorites(prev => prev.filter(item => item.id !== opportunityId));
    }
  };

  // Проверить, в избранном ли
  const isFavorite = (opportunityId) => {
    return favorites.some(item => item.id === opportunityId);
  };

  // Очистить избранное
  const clearFavorites = () => {
    setFavorites([]);
    if (!IsAuth) {
      localStorage.removeItem('favorites');
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
  };
};