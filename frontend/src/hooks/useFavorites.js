import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    getUserFavorites,
    addToFavorites as addToFavoritesBackend,
    removeFromFavorites as removeFromFavoritesBackend 
} from '../api/services';


export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { IsAuth } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!IsAuth) {
        // Для неавторизованных - из localStorage
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          try {
            const parsed = JSON.parse(storedFavorites);
            setFavorites(parsed);
          } catch (e) {
            console.error('Error parsing favorites:', e);
            setFavorites([]);
          }
        }
      } else {
        // Для авторизованных - запрос к бэкенду
        try {
          const response = await getUserFavorites(1, 1000);
          setFavorites(response?.data || []);
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        }
      }
    };
    
    loadFavorites();
  }, [IsAuth]);

  // Добавить в избранное
  const addToFavorites = async (opportunity) => {
    if (!IsAuth) {
      // Неавторизованные - в localStorage
      setFavorites(prev => {
        // Проверяем по id, так как храним полные объекты
        if (prev.some(item => item.id === opportunity.id)) {
          return prev;
        }
        const newFavorites = [...prev, opportunity];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    } else {
      // Авторизованные - запрос к бэкенду
      // Проверяем по opportunityId
      if (favorites.some(item => item.opportunityId === opportunity.id)) {
        return;
      }
      try {
        await addToFavoritesBackend(opportunity.id);
        const newFavorite = {
          id: Date.now(),
          opportunityId: opportunity.id,
          opportunity: opportunity
        };
        setFavorites(prev => [...prev, newFavorite]);
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    }
  };

  // Удалить из избранного
  const removeFromFavorites = async (opportunityId) => {
    if (!IsAuth) {
      // Неавторизованные - удаляем по id (так как храним полные объекты)
      setFavorites(prev => {
        const newFavorites = prev.filter(item => item.id !== opportunityId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      });
    } else {
      // Авторизованные - удаляем по opportunityId
      setFavorites(prev => prev.filter(item => item.opportunityId !== opportunityId));
      try {
        await removeFromFavoritesBackend(opportunityId);
      } catch (error) {
        console.error('Error removing from favorites:', error);
      }
    }
  };

  // Проверить, в избранном ли
  const isFavorite = (opportunityId) => {
    if (!IsAuth) {
      // Для неавторизованных - проверяем по id (поля объектов)
      return favorites.some(item => item.id === opportunityId);
    } else {
      // Для авторизованных - проверяем по opportunityId
      return favorites.some(item => item.opportunityId === opportunityId);
    }
  };

  // Очистить избранное
  const clearFavorites = async () => {
    if (!IsAuth) {
      localStorage.removeItem('favorites');
      setFavorites([]);
    } else {
      try {
        await Promise.all(favorites.map(f => removeFromFavoritesBackend(f.opportunityId)));
        setFavorites([]);
      } catch (error) {
        console.error('Error clearing favorites:', error);
      }
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