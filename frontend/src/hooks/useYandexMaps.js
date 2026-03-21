import { useState, useEffect } from 'react';

const useYandexMaps = (apiKey, theme = 'dark') => {
  const [ymaps, setYmaps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Yandex Maps API key is missing');
      setLoading(false);
      return;
    }

    // Если уже загружено
    if (window.ymaps) {
      window.ymaps.ready(() => {
        setYmaps(window.ymaps);
        setLoading(false);
      });
      return;
    }

    // Создаем скрипт
    const scriptId = 'yandex-maps-script';
    
    if (document.getElementById(scriptId)) {
      return;
    }
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          setYmaps(window.ymaps);
          setLoading(false);
        });
      }
    };

    script.onerror = () => {
      setError('Не удалось загрузить Яндекс Карты');
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Не удаляем скрипт
    };
  }, [apiKey]);

  return { ymaps, loading, error };
};

export default useYandexMaps;