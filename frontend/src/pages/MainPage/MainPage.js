import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, List, Search, Filter } from 'lucide-react';
import Header from '../../components/Header/Header';
import YandexMap from '../../components/YandexMap/YandexMap';
import OpportunityCard from '../../components/OpportunityCard/OpportunityCard';
import Filters from '../../components/Filters/Filters';
import Button from '../../components/UI/Button/Button';
import { opportunities, skillsTags, supportedCities } from '../../data/mockData';
import { useFavorites } from '../../hooks/useFavorites';
import './MainPage.css';
import { useAuth } from "../../contexts/AuthContext";
import Footer from '../../components/Footer/Footer';

const MainPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('both'); // 'map', 'list', 'both'
  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const {IsAuth} = useAuth();
  
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    if (IsAuth == false){
      // Загружаем отклики из localStorage (для неавторизованных)
      const storedApplied = localStorage.getItem('applied');
      if (storedApplied) {
        try {
        setAppliedOpportunities(JSON.parse(storedApplied));
        } catch (e) {
          console.error('Error parsing applied:', e);
        }
      }
    }
    else{
      // для авторизованных работа с бэкендом 
    }
  }, []);

  // Фильтрация возможностей
  useEffect(() => {
    let filtered = [...opportunities];

    // Поиск по названию и описанию
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.company.name.toLowerCase().includes(query)
      );
    }

    setFilteredOpportunities(filtered);
  }, [searchQuery]);

  const handleFilterChange = (filters) => {
    let filtered = [...opportunities];

    // Фильтр по навыкам
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(opp => 
        filters.skills.some(skillId => opp.tags.includes(skillId))
      );
    }

    // Фильтр по зарплате
    if (filters.salary) {
      if (filters.salary.min) {
        filtered = filtered.filter(opp => 
          !opp.salary || opp.salary >= parseInt(filters.salary.min)
        );
      }
      if (filters.salary.max) {
        filtered = filtered.filter(opp => 
          !opp.salary || opp.salary <= parseInt(filters.salary.max)
        );
      }
    }

    // Фильтр по формату работы
    if (filters.format && filters.format.length > 0) {
      filtered = filtered.filter(opp => 
        filters.format.includes(opp.format)
      );
    }

    // Фильтр по типу возможности
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(opp => 
        filters.type.includes(opp.type)
      );
    }

    // Фильтр по городу
    if (filters.city) {
      filtered = filtered.filter(opp => 
        opp.city === filters.city
      );
    }

    setFilteredOpportunities(filtered);
  };

  const handleFavoriteToggle = (opportunity) => {
    if (isFavorite(opportunity.id)) {
      removeFromFavorites(opportunity.id);
    } else {
      addToFavorites(opportunity);
    }
  };

  const handleApply = (opportunityId) => {
    if (IsAuth == false){
      alert('Вы не можете откликнуться на возможность! Войдите в аккаунт.');
    }
    else{
      // Для авторизованных посслыаем запрос
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (opportunity) {
        const newApplied = [...appliedOpportunities, opportunity];
        setAppliedOpportunities(newApplied);
        // запрос для авторизованных      
     }
    }
  };

  const handleMarkerClick = () => {}
//   useCallback((opportunity) => {
//   setSelectedOpportunity(opportunity);
  
//   // Скроллим к карточке, но с задержкой чтобы не блокировать клик по маркеру
//   setTimeout(() => {
//     const element = document.getElementById(`opportunity-${opportunity.id}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }, 500);
// }, []);

  return (
    <div className="main-page">
      <Header isAuth={false} />

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
          {isFiltersVisible && (
            <Filters 
              onFilterChange={handleFilterChange}
              skills={skillsTags}
            />
          )}

          {/* Основной контент */}
          <div className={`content-grid ${viewMode === 'both' ? 'grid-2cols' : ''}`}>
            {/* Карта */}
            {(viewMode === 'map' || viewMode === 'both') && (
              <div className="map-section">
                <YandexMap
                  apiKey={process.env.REACT_APP_YANDEX_MAPS_API_KEY}
                  opportunities={filteredOpportunities}
                  favorites={favorites}
                  applied={appliedOpportunities}
                  onMarkerClick={handleMarkerClick}
                  theme="dark"
                />
              </div>
            )}

            {/* Список возможностей */}
            {(viewMode === 'list' || viewMode === 'both') && (
              <div className="opportunities-section">
                <div className="opportunities-header">
                  <h2 className="section-title">
                    Найдено: {filteredOpportunities.length} возможностей
                  </h2>
                  <select className="sort-select">
                    <option value="newest">Сначала новые</option>
                    <option value="salary_desc">По убыванию зарплаты</option>
                    <option value="salary_asc">По возрастанию зарплаты</option>
                    <option value="popular">По популярности</option>
                  </select>
                </div>

                <div className="opportunities-list">
                  {filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map(opportunity => (
                      <div 
                        key={opportunity.id} 
                        id={`opportunity-${opportunity.id}`}
                        className={`opportunity-item ${selectedOpportunity?.id === opportunity.id ? 'highlighted' : ''}`}
                      >
                        <OpportunityCard
                          opportunity={opportunity}
                          isFavorite={isFavorite(opportunity.id)}
                          onFavoriteToggle={handleFavoriteToggle}
                        />
                        {viewMode === 'list' && (
                          <div className="card-actions">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleApply(opportunity.id)}
                            >
                              Откликнуться
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
                          handleFilterChange({});
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                    </div>
                  )}
                </div>

                {/* Пагинация (для демо) */}
                {filteredOpportunities.length > 0 && (
                  <div className="pagination">
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <button className="pagination-btn">...</button>
                    <button className="pagination-btn">10</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для быстрого просмотра (опционально) */}
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
              opportunity={selectedOpportunity}
              isFavorite={isFavorite(selectedOpportunity.id)}
              onFavoriteToggle={handleFavoriteToggle}
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
              >
                Откликнуться
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