import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, List, Search, Filter } from 'lucide-react';
import Header from '../../components/Header/Header';
import YandexMap from '../../components/YandexMap/YandexMap';
import OpportunityCard from '../../components/OpportunityCard/OpportunityCard';
import Filters from '../../components/Filters/Filters';
import Button from '../../components/UI/Button/Button';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from "../../contexts/AuthContext";
import { useFetch } from '../../hooks/useFetch';
import { getOpportunities, applyToOpportunity, getUserApplications, getTags } from '../../api/services';
import Footer from '../../components/Footer/Footer';
import './MainPage.css';
import { cityCoordinates } from '../../data/mockData';
import { getMediaData } from '../../utils/files';


const MainPage = () => {
  const navigate = useNavigate();
  const { IsAuth, User, IsApplicant } = useAuth();
  const [viewMode, setViewMode] = useState('both');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [skillsTags, setSkillsTags] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({
    type: null,
    format: null,
    salaryMin: null,
    salaryMax: null,
    city: null,
    tagIds: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12); // количество на странице
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  // Загружаем теги с бэкенда
  const [fetchTags, tagsLoading] = useFetch(async () => {
    const response = await getTags({ category: 'technology' });
    setSkillsTags(response);
    return response;
  });
  
  useEffect(() => {
    fetchTags();
  }, []);
  
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
  
  // Запрос на получение возможностей с пагинацией
  const [fetchOpportunities, opportunitiesLoading, opportunitiesError] = useFetch(async () => {
    const params = {
      ...currentFilters,
      search: searchQuery || undefined,
      page: currentPage,
      limit: limit
    };
    
    // Удаляем null значения
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
      if (key === 'tagIds' && params[key] && params[key].length === 0) {
        delete params[key];
      }
    });
    
    const response = await getOpportunities(params);
    setFilteredOpportunities(response.data);
    setPaginationMeta(response.meta);
    return response;
  });
  
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  
  // Генерируем уникальный ключ для карты на основе данных
  const [mapKey, setMapKey] = useState(0);
  
  // Загружаем данные при изменении поиска, фильтров или страницы
  useEffect(() => {
    fetchOpportunities();
  }, [searchQuery, currentFilters, currentPage]);
  
  // Обновляем ключ карты при изменении отфильтрованных данных
  useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, [filteredOpportunities, currentFilters, searchQuery]);
  
  // Обработчик изменения фильтров из компонента Filters
  const handleFilterChange = useCallback((filters) => {
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
    setCurrentFilters({
      type: filters.type?.[0] || null,
      format: filters.format?.[0] || null,
      salaryMin: filters.salary?.min ? parseInt(filters.salary.min) : null,
      salaryMax: filters.salary?.max ? parseInt(filters.salary.max) : null,
      city: filters.city || null,
      tagIds: filters.skills || []
    });
  }, []);
  
  // Функция для смены страницы
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Скроллим к верху списка
    const opportunitiesSection = document.querySelector('.opportunities-section');
    if (opportunitiesSection) {
      opportunitiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  
  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = useCallback((opportunity) => {
    if (isFavorite(opportunity.id)) {
      removeFromFavorites(opportunity.id);
    } else {
      addToFavorites(opportunity);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);
  
  // Обработчик отклика на возможность
  const [applyToOpportunityFunc, applyLoading] = useFetch(async (opportunityId) => {
    await applyToOpportunity(opportunityId);
    await fetchApplications();
    alert('Вы успешно откликнулись на возможность!');
  });
  
  const handleApply = useCallback(async (opportunityId) => {
    if (!IsAuth) {
      alert('Войдите в аккаунт, чтобы откликнуться');
      return;
    }
    
    await applyToOpportunityFunc(opportunityId);
  }, [IsAuth, applyToOpportunityFunc]);
  
  // Обработчик клика на маркер
  const handleMarkerClick = () => {}
  // useCallback((opportunity) => {
  //   setSelectedOpportunity(opportunity);
  //   if (viewMode !== 'map') {
  //     setTimeout(() => {
  //       const element = document.getElementById(`opportunity-${opportunity.id}`);
  //       if (element) {
  //         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //       }
  //     }, 500);
  //   }
  // }, [viewMode]);
  
  // Подготовка данных для карты
  const mapOpportunities = filteredOpportunities.map(opp => ({
    ...opp,
    coordinates: opp.latitude && opp.longitude 
      ? [opp.latitude, opp.longitude]
      : cityCoordinates[opp.city] || cityCoordinates['Москва'],
    company: {
      name: opp.employer?.companyName || 'Компания',
      logo: opp.employer?.logoUrl ? getMediaData(opp.employer?.logoUrl) : null
    },
    salary: opp.salaryFrom || null,
    format: opp.format?.toLowerCase() || 'offline',
    tags: opp.tags?.map(t => t.tag?.id) || []
  }));
  
  // Проверка, откликался ли пользователь
  const isApplied = useCallback((opportunityId) => {
    return appliedOpportunities.some(app => app.opportunityId === opportunityId);
  }, [appliedOpportunities]);
  
  // Компонент пагинации
  const Pagination = ({ meta, onPageChange }) => {
    const { page, totalPages, total } = meta;
    
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;
      
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
          range.push(i);
        }
      }
      
      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });
      
      return rangeWithDots;
    };
    
    return (
      <div className="pagination">
        <button
          className="pagination-btn pagination-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          ←
        </button>
        
        {getPageNumbers().map((item, index) => (
          item === '...' ? (
            <span key={`dots-${index}`} className="pagination-dots">...</span>
          ) : (
            <button
              key={item}
              className={`pagination-btn ${page === item ? 'active' : ''}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        ))}
        
        <button
          className="pagination-btn pagination-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          →
        </button>
      </div>
    );
  };
  
  if (opportunitiesError) {
    return (
      <div className="main-page">
        <Header />
        <div className="error-container">
          <h2>Ошибка загрузки данных</h2>
          <p>{opportunitiesError}</p>
          <Button onClick={() => fetchOpportunities()}>Повторить</Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="main-page">
      <Header />

      <div className="main-content">
        {/* Hero секция с поиском */}
        <div className="hero-section">
          <div className="container">
            <h1 className="hero-title">
              Найди свою <span className="gradient-text">траекторию</span> в IT
            </h1>
            <p className="hero-subtitle">
              Стажировки, вакансии, менторство и мероприятия от ведущих IT-компаний
            </p>

            <div className="search-container">
              <div className="search-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Поиск вакансий, стажировок, компаний..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <Button 
                variant="primary" 
                size="large"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="filter-toggle-btn"
              >
                <Filter size={20} />
                Фильтры
              </Button>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Переключатель режимов отображения */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              <Map size={18} />
              <List size={18} />
              <span>Карта и список</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              <Map size={18} />
              <span>Только карта</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
              <span>Только список</span>
            </button>
          </div>

          {/* Фильтры */}
          {isFiltersVisible && !tagsLoading && (
            <Filters 
              onFilterChange={handleFilterChange}
              skills={skillsTags}
            />
          )}

          {/* Основной контент */}
          <div className={`content-grid ${viewMode === 'both' ? 'grid-2cols' : ''}`}>
            {/* Карта - добавляем key для принудительной перерисовки */}
            {(viewMode === 'map' || viewMode === 'both') && (
              <div className="map-section">
                <YandexMap
                  key={`map-${viewMode}-${mapKey}`}
                  apiKey={process.env.REACT_APP_YANDEX_MAPS_API_KEY}
                  opportunities={mapOpportunities}
                  favorites={favorites}
                  applied={appliedOpportunities}
                  onMarkerClick={handleMarkerClick}
                  theme="dark"
                />
                {opportunitiesLoading && mapOpportunities.length === 0 && (
                  <div className="loading-overlay">
                    <div className="loading-spinner">Загрузка данных...</div>
                  </div>
                )}
              </div>
            )}

            {/* Список возможностей */}
            {(viewMode === 'list' || viewMode === 'both') && (
              <div className="opportunities-section">
                <div className="opportunities-header">
                  <h2 className="section-title">
                    Найдено: {paginationMeta.total} возможностей
                  </h2>
                  <select className="sort-select">
                    <option value="newest">Сначала новые</option>
                    <option value="salary_desc">По убыванию зарплаты</option>
                    <option value="salary_asc">По возрастанию зарплаты</option>
                  </select>
                </div>

                <div className="opportunities-list">
                  {opportunitiesLoading && filteredOpportunities.length === 0 ? (
                    <div className="loading-spinner">Загрузка...</div>
                  ) : filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map(opportunity => (
                      <div 
                        key={opportunity.id} 
                        id={`opportunity-${opportunity.id}`}
                        className={`opportunity-item ${selectedOpportunity?.id === opportunity.id ? 'highlighted' : ''}`}
                      >
                        <OpportunityCard
                          opportunity={{
                            ...opportunity,
                            company: {
                              name: opportunity.employer?.companyName,
                              logo: getMediaData(opportunity.employer?.logoUrl )
                            },
                            salary: opportunity.salaryFrom
                          }}
                          isFavorite={isFavorite(opportunity.id)}
                          onFavoriteToggle={() => handleFavoriteToggle(opportunity)}
                        />
                        {viewMode === 'list' && (
                          <div className="card-actions">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleApply(opportunity.id)}
                              disabled={isApplied(opportunity.id) || applyLoading}
                            >
                              {isApplied(opportunity.id) ? 'Откликнулись' : applyLoading ? 'Отправка...' : 'Откликнуться'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <div className="no-results-icon">🔍</div>
                      <h3>Ничего не найдено</h3>
                      <p>Попробуйте изменить параметры поиска</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentPage(1);
                          setCurrentFilters({
                            type: null,
                            format: null,
                            salaryMin: null,
                            salaryMax: null,
                            city: null,
                            tagIds: []
                          });
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    </div>
                  )}
                </div>

                {/* Пагинация - используем новый компонент */}
                {paginationMeta.totalPages > 1 && (
                  <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для быстрого просмотра */}
      {selectedOpportunity && viewMode === 'map' && (
        <div className="quick-view-modal">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setSelectedOpportunity(null)}
            >
              ×
            </button>
            <OpportunityCard
              opportunity={{
                ...selectedOpportunity,
                company: {
                  name: selectedOpportunity.employer?.companyName,
                  logo: getMediaData(selectedOpportunity.employer?.logoUrl)
                },
                salary: selectedOpportunity.salaryFrom,
                tags: selectedOpportunity.tags?.map(t => t.tag?.id) || []
              }}
              isFavorite={isFavorite(selectedOpportunity.id)}
              onFavoriteToggle={() => handleFavoriteToggle(selectedOpportunity)}
              variant="detailed"
            />
            <div className="modal-actions">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  handleApply(selectedOpportunity.id);
                  setSelectedOpportunity(null);
                }}
                disabled={isApplied(selectedOpportunity.id) || applyLoading}
              >
                {isApplied(selectedOpportunity.id) ? 'Вы уже откликнулись' : applyLoading ? 'Отправка...' : 'Откликнуться'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MainPage;