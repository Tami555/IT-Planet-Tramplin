import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  // Загружаем избранное из localStorage при монтировании
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Error parsing favorites:', e);
        setFavorites([]);
      }
    }
  }, []);

  // Добавить в избранное
  const addToFavorites = (opportunity) => {
    setFavorites(prev => {
      // Проверяем, нет ли уже такого
      if (prev.some(item => item.id === opportunity.id)) {
        return prev;
      }
      const newFavorites = [...prev, opportunity];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Удалить из избранного
  const removeFromFavorites = (opportunityId) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(item => item.id !== opportunityId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Проверить, в избранном ли
  const isFavorite = (opportunityId) => {
    return favorites.some(item => item.id === opportunityId);
  };

  // Очистить избранное
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
  };
};