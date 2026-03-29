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
  const clustererRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const prevOpportunitiesRef = useRef([]);
  const prevFavoritesRef = useRef([]);
  const prevAppliedRef = useRef([]);
  
  const { ymaps, loading, error } = useYandesMaps(apiKey, theme);

  // Функция для группировки мероприятий по координатам
  const groupByCoordinates = useCallback((opportunities) => {
    const groups = new Map();
    
    opportunities.forEach(opp => {
      const key = `${opp.coordinates[0]},${opp.coordinates[1]}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(opp);
    });
    
    return groups;
  }, []);

  // Функция для создания содержимого балуна (с поддержкой нескольких мероприятий)
  const createBalloonContent = useCallback((opportunitiesGroup) => {
    const isMultiple = opportunitiesGroup.length > 1;
    const firstOpp = opportunitiesGroup[0];
    
    if (!isMultiple) {
      // Одиночное мероприятие
      const opp = opportunitiesGroup[0];
      return `
        <div class="custom-balloon">
          <div class="balloon-header">
            <img src="${opp.company.logo}" alt="${opp.company.name}" class="balloon-logo" 
                 onerror="this.src='https://via.placeholder.com/40x40?text=Company'">
            <div class="balloon-company">
              <div class="balloon-company-name">${opp.company.name}</div>
              <div class="balloon-type">${opp.type === 'INTERNSHIP' ? 'Стажировка' : 
                                           opp.type === 'VACANCY_JUNIOR' ? 'Вакансия' : 
                                           opp.type === 'MENTORSHIP' ? 'Менторство' : 'Мероприятие'}</div>
            </div>
          </div>
          <div class="balloon-body">
            <h4 class="balloon-title">${opp.title}</h4>
            ${opp.salaryFrom ? `
              <div class="balloon-salary">
                ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(opp.salaryFrom)}
              </div>
            ` : ''}
            <div class="balloon-format">
              <span>${opp.format === 'OFFICE' ? '🏢' : opp.format === 'REMOTE' ? '🏠' : '🔄'}</span>
              ${opp.city}
            </div>
          </div>
          <div class="balloon-footer">
            <button class="balloon-btn" onclick="window.open('/opportunity/${opp.id}', '_self')">
              Подробнее
            </button>
          </div>
        </div>
      `;
    } else {
      // Несколько мероприятий - создаем список
      const opportunitiesList = opportunitiesGroup.map(opp => `
        <div class="balloon-opportunity-item" onclick="window.open('/opportunity/${opp.id}', '_self')">
          <div class="balloon-opportunity-title">${opp.title}</div>
          <div class="balloon-opportunity-type">${opp.type === 'INTERNSHIP' ? 'Стажировка' : 
                                                  opp.type === 'VACANCY_JUNIOR' ? 'Вакансия' : 
                                                  opp.type === 'MENTORSHIP' ? 'Менторство' : 'Мероприятие'}</div>
          ${opp.salaryFrom ? `<div class="balloon-opportunity-salary">${opp.salaryFrom.toLocaleString()} ₽</div>` : ''}
        </div>
      `).join('');
      
      return `
        <div class="custom-balloon custom-balloon-multiple">
          <div class="balloon-header">
            <img src="${firstOpp.company.logo}" alt="${firstOpp.company.name}" class="balloon-logo" 
                 onerror="this.src='https://via.placeholder.com/40x40?text=Company'">
            <div class="balloon-company">
              <div class="balloon-company-name">${firstOpp.company.name}</div>
              <div class="balloon-location">📍 ${firstOpp.city}</div>
            </div>
          </div>
          <div class="balloon-body-multiple">
            <div class="balloon-multiple-title">Доступные возможности (${opportunitiesGroup.length}):</div>
            <div class="balloon-opportunities-list">
              ${opportunitiesList}
            </div>
          </div>
        </div>
      `;
    }
  }, []);

  // Функция для создания иконки маркера (для группы показываем особую иконку)
  const getMarkerIconWithCount = useCallback((opportunitiesGroup, isFavorite, isApplied) => {
    const count = opportunitiesGroup.length;
    const isMultiple = count > 1;
    
    if (isApplied) {
      return {
        preset: 'islands#greenCircleDotIcon',
        iconColor: '#4CAF50'
      };
    }
    if (isFavorite) {
      return {
        preset: 'islands#yellowCircleDotIcon',
        iconColor: '#FFC107'
      };
    }
    
    if (isMultiple) {
      // Для группы показываем особый маркер с количеством
      return {
        preset: 'islands#blueCircleDotIcon',
        iconColor: '#18A3B7',
        iconContent: count.toString()
      };
    }
    
    const opp = opportunitiesGroup[0];
    const typeColors = {
      INTERNSHIP: '#18A3B7',
      VACANCY_JUNIOR: '#5AA5CD',
      MENTORSHIP: '#6F71A1',
      CAREER_EVENT: '#27E6EC'
    };
    
    return {
      preset: 'islands#blueCircleDotIcon',
      iconColor: typeColors[opp.type] || '#1E536E'
    };
  }, []);

  // Создание маркеров (с группировкой)
  const createMarkers = useCallback(() => {
    if (!ymaps || !mapInstanceRef.current) return;

    // Проверяем, изменились ли данные
    const opportunitiesChanged = JSON.stringify(prevOpportunitiesRef.current) !== JSON.stringify(opportunities);
    const favoritesChanged = JSON.stringify(prevFavoritesRef.current) !== JSON.stringify(favorites);
    const appliedChanged = JSON.stringify(prevAppliedRef.current) !== JSON.stringify(applied);
    
    if (!opportunitiesChanged && !favoritesChanged && !appliedChanged && clustererRef.current) {
      return;
    }

    // Сохраняем текущие данные
    prevOpportunitiesRef.current = opportunities;
    prevFavoritesRef.current = favorites;
    prevAppliedRef.current = applied;

    // Сохраняем позицию карты
    const currentCenter = mapInstanceRef.current.getCenter();
    const currentZoom = mapInstanceRef.current.getZoom();

    // Удаляем старый кластеризатор
    if (clustererRef.current) {
      mapInstanceRef.current.geoObjects.remove(clustererRef.current);
    }

    // Фильтруем и группируем по координатам
    const opportunitiesWithCoords = opportunities.filter(opp => opp.coordinates);
    const grouped = groupByCoordinates(opportunitiesWithCoords);
    
    if (grouped.size === 0) return;

    // Создаем кластеризатор
    const clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedVioletClusterIcons',
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
      clusterIconLayout: 'default#pieChart',
      clusterIconPieChartRadius: 30,
      clusterIconPieChartCoreRadius: 20,
      clusterIconPieChartStrokeWidth: 2,
      clusterIconPieChartStrokeColor: '#ffffff'
    });

    // Создаем маркеры для каждой группы
    grouped.forEach((group, coordinates) => {
      const [lat, lng] = coordinates.split(',').map(Number);
      
      // Проверяем статусы для группы
      const hasFavorite = group.some(opp => favorites.some(fav => fav.id === opp.id || fav.opportunityId == opp.id));
      const hasApplied = group.some(opp => applied.some(app => app.opportunityId === opp.id));
      
      const markerIcon = getMarkerIconWithCount(group, hasFavorite, hasApplied);
      
      const marker = new ymaps.Placemark(
        [lat, lng],
        {
          balloonContent: createBalloonContent(group),
          hintContent: group.length > 1 ? `${group.length} возможностей в этом месте` : group[0].title
        },
        {
          ...markerIcon,
          balloonCloseButton: true,
          hideIconOnBalloonOpen: false,
          openBalloonOnClick: true,
          ...(group.length > 1 && {
            iconContent: group.length.toString()
          })
        }
      );

      // Обработчик клика
      marker.events.add('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        marker.balloon.open();
        
        // Если группа из одного - вызываем callback
        if (group.length === 1 && onMarkerClick) {
          onMarkerClick(group[0]);
        }
      });

      clusterer.add(marker);
    });

    // Добавляем кластеризатор на карту
    mapInstanceRef.current.geoObjects.add(clusterer);
    clustererRef.current = clusterer;

    // Восстанавливаем позицию карты
    if (currentCenter && currentZoom && !isFirstLoadRef.current) {
      mapInstanceRef.current.setCenter(currentCenter, currentZoom, {
        duration: 0,
        checkZoomRange: true
      });
    }

    // При первой загрузке центрируем по маркерам
    if (isFirstLoadRef.current && grouped.size > 0) {
      const bounds = clusterer.getBounds();
      if (bounds) {
        mapInstanceRef.current.setBounds(bounds, {
          checkZoomRange: true,
          zoomMargin: 50,
          duration: 300
        });
        isFirstLoadRef.current = false;
      }
    }
  }, [ymaps, opportunities, favorites, applied, groupByCoordinates, getMarkerIconWithCount, createBalloonContent, onMarkerClick]);

  // Инициализация карты (остается без изменений)
  useEffect(() => {
    if (!ymaps || !mapRef.current || mapInstanceRef.current) return;

    const map = new ymaps.Map(mapRef.current, {
      center: initialLocation,
      zoom: zoom,
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
    }, {
      suppressMapOpenBlock: true,
      yandexMapAutoSwitch: false,
      autoFitToViewport: 'always'
    });

    if (theme === 'dark') {
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
    createMarkers();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        clustererRef.current = null;
      }
    };
  }, [ymaps, initialLocation, zoom, theme]);

  // Обновляем маркеры
  useEffect(() => {
    if (mapInstanceRef.current && ymaps) {
      createMarkers();
    }
  }, [opportunities, favorites, applied, ymaps, createMarkers]);

  // Добавляем CSS для балуна с несколькими мероприятиями
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-balloon-multiple {
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
      }
      .balloon-body-multiple {
        padding: 12px;
      }
      .balloon-multiple-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 8px;
        color: #333;
      }
      .balloon-opportunities-list {
        max-height: 300px;
        overflow-y: auto;
      }
      .balloon-opportunity-item {
        padding: 8px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .balloon-opportunity-item:hover {
        background-color: #f5f5f5;
      }
      .balloon-opportunity-title {
        font-weight: 500;
        font-size: 13px;
        color: #333;
        margin-bottom: 4px;
      }
      .balloon-opportunity-type {
        font-size: 11px;
        color: #666;
        display: inline-block;
      }
      .balloon-opportunity-salary {
        font-size: 12px;
        color: #18A3B7;
        font-weight: 500;
        margin-top: 4px;
      }
      .balloon-location {
        font-size: 11px;
        color: #666;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#FFC107' }}></span>
          <span>В избранном</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>Откликнулся</span>
        </div>
        <div className="legend-item-group">
          <span className="legend-dot-group">ⓘ</span>
          <span>На маркере цифра - несколько возможностей в этом месте</span>
        </div>
      </div>
    </div>
  );
};

export default YandexMap;