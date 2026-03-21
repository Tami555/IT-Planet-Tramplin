import React, { useRef, useEffect, useState, useCallback } from 'react';
import useYandesMaps from '../../hooks/useYandexMaps';
import './YandexMap.css';

const YandexMap = ({ 
  apiKey,
  opportunities = [],
  favorites = [],
  applied = [],
  onMarkerClick,
  initialLocation = [55.7558, 37.6176],
  zoom = 10,
  className = '',
  theme = 'dark'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [mapCenter, setMapCenter] = useState(initialLocation);
  
  const { ymaps, loading, error } = useYandesMaps(apiKey, theme);

  // Функция для создания иконки маркера в зависимости от статуса
  const getMarkerIcon = useCallback((opportunity, isFavorite, isApplied) => {
    if (isApplied) {
      return {
        preset: 'islands#greenCircleDotIcon',
        iconColor: '#27E6EC'
      };
    }
    if (isFavorite) {
      return {
        preset: 'islands#violetCircleDotIcon',
        iconColor: '#6F71A1'
      };
    }
    
    // Разные цвета для разных типов возможностей
    const typeColors = {
      internship: '#18A3B7',
      vacancy: '#5AA5CD',
      mentorship: '#6F71A1',
      event: '#27E6EC'
    };
    
    return {
      preset: 'islands#blueCircleDotIcon',
      iconColor: typeColors[opportunity.type] || '#1E536E'
    };
  }, []);

  // Функция для создания содержимого балуна
  const createBalloonContent = useCallback((opportunity) => {
    return `
      <div class="custom-balloon">
        <div class="balloon-header">
          <img src="${opportunity.company.logo}" alt="${opportunity.company.name}" class="balloon-logo" 
               onerror="this.src='https://via.placeholder.com/40x40?text=Company'">
          <div class="balloon-company">
            <div class="balloon-company-name">${opportunity.company.name}</div>
            <div class="balloon-type">${opportunity.type === 'internship' ? 'Стажировка' : 
                                         opportunity.type === 'vacancy' ? 'Вакансия' : 
                                         opportunity.type === 'mentorship' ? 'Менторство' : 'Мероприятие'}</div>
          </div>
        </div>
        <div class="balloon-body">
          <h4 class="balloon-title">${opportunity.title}</h4>
          ${opportunity.salary ? `
            <div class="balloon-salary">
              ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(opportunity.salary)}
            </div>
          ` : ''}
          <div class="balloon-format">
            <span>${opportunity.format === 'office' ? '🏢' : opportunity.format === 'remote' ? '🏠' : '🔄'}</span>
            ${opportunity.city}
          </div>
          <div class="balloon-tags">
            ${opportunity.tags.slice(0, 3).map(tagId => {
              const tagNames = {1: 'Python', 2: 'Java', 3: 'JS', 4: 'React', 5: 'SQL'};
              return `<span class="balloon-tag">${tagNames[tagId] || 'IT'}</span>`;
            }).join('')}
          </div>
        </div>
        <div class="balloon-footer">
          <button class="balloon-btn" onclick="window.open('/opportunity/${opportunity.id}', '_self')">
            Подробнее
          </button>
        </div>
      </div>
    `;
  }, []);

  // Отображение маркеров на карте
  const displayMarkers = useCallback(() => {
    if (!ymaps || !mapInstanceRef.current || !opportunities.length) return;

    // Удаляем старые маркеры
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.geoObjects.remove(marker);
    });
    markersRef.current = [];

    // Фильтруем возможности только с координатами
    const opportunitiesWithCoords = opportunities.filter(opp => opp.coordinates);

    // Создаем кластеризатор для большого количества маркеров
    const clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedVioletClusterIcons',
      clusterIcons: [{
        href: '/images/cluster-icon.png',
        size: [40, 40],
        offset: [-20, -20]
      }],
      clusterIconColor: '#6F71A1',
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false
    });

    // Создаем маркеры
    opportunitiesWithCoords.forEach(opportunity => {
      const isFavorite = favorites.some(fav => fav.id === opportunity.id);
      const isApplied = applied.some(app => app.id === opportunity.id);
      
      const markerIcon = getMarkerIcon(opportunity, isFavorite, isApplied);
      
      const marker = new ymaps.Placemark(
        opportunity.coordinates,
        {
          balloonContent: createBalloonContent(opportunity),
          hintContent: opportunity.title
        },
        {
          ...markerIcon,
          balloonCloseButton: true,
          hideIconOnBalloonOpen: false,
          openBalloonOnClick: true
        }
      );

      marker.events.add('click', () => {
        if (onMarkerClick) {
          onMarkerClick(opportunity);
        }
      });

      clusterer.add(marker);
      markersRef.current.push(marker);
    });

    mapInstanceRef.current.geoObjects.add(clusterer);

    // Автоматически центрируем карту по маркерам если есть
    if (opportunitiesWithCoords.length > 0) {
      const bounds = clusterer.getBounds();
      if (bounds) {
        mapInstanceRef.current.setBounds(bounds, {
          checkZoomRange: true,
          zoomMargin: 50
        });
      }
    }
  }, [ymaps, opportunities, favorites, applied, getMarkerIcon, createBalloonContent, onMarkerClick]);

  // Инициализация карты
  useEffect(() => {
    if (!ymaps || !mapRef.current || mapInstanceRef.current) return;

    // Создаем карту с темной темой
    const map = new ymaps.Map(mapRef.current, {
      center: mapCenter,
      zoom: zoom,
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
    }, {
      suppressMapOpenBlock: true,
      yandexMapAutoSwitch: false,
      autoFitToViewport: 'always'
    });

    // Применяем темную тему
    if (theme === 'dark') {
      // Кастомная темная тема
      map.options.set('theme', {
        region: {
          fillColor: '#1A334A',
          strokeColor: '#1E536E',
          activeFillColor: '#18A3B7'
        },
        road: {
          fillColor: '#2C3E50',
          strokeColor: '#5AA5CD'
        }
      });
    }

    mapInstanceRef.current = map;

    // Добавляем поиск по городам
    const searchControl = new ymaps.control.SearchControl({
      options: {
        provider: 'yandex#search',
        useMapBounds: true,
        noPlacemark: true,
        resultsPerPage: 5
      }
    });
    map.controls.add(searchControl);

    searchControl.events.add('resultselect', (e) => {
      const index = e.get('index');
      searchControl.getResult(index).then((res) => {
        const coords = res.geometry.getCoordinates();
        setMapCenter(coords);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [ymaps, mapCenter, zoom, theme]);

  // Обновляем маркеры при изменении данных
  useEffect(() => {
    if (mapInstanceRef.current && ymaps) {
      displayMarkers();
    }
  }, [opportunities, favorites, applied, ymaps, displayMarkers]);

  if (loading) {
    return (
      <div className="yandex-map-loading">
        <div className="spinner"></div>
        <p>Загрузка карты...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="yandex-map-error">
        <div className="error-icon">⚠️</div>
        <h4>Ошибка загрузки карты</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`yandex-map-container ${className}`}>
      <div ref={mapRef} className="yandex-map" />
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#18A3B7' }}></span>
          <span>Стажировка</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#5AA5CD' }}></span>
          <span>Вакансия</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#6F71A1' }}></span>
          <span>Менторство</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#27E6EC' }}></span>
          <span>Мероприятие</span>
        </div>
        <div className="legend-divider"></div>
        <div className="legend-item favorite">
          <span className="legend-dot" style={{ backgroundColor: '#6F71A1' }}></span>
          <span>В избранном</span>
        </div>
        <div className="legend-item applied">
          <span className="legend-dot" style={{ backgroundColor: '#27E6EC' }}></span>
          <span>Откликнулся</span>
        </div>
      </div>
    </div>
  );
};

export default YandexMap;