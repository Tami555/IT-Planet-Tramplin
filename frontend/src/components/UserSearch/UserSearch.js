import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Loader, X, Filter, School, MapPin, Code, UserCheck  } from 'lucide-react';
import Button from '../UI/Button/Button';
import InputBlock from '../UI/InputBlock/InputBlock';
import { getTags } from '../../api/services';
import './UserSearch.css';
import { default_user_ava } from '../../images';
import { getMediaData } from '../../utils/files';


const UserSearch = ({ contacts, onSearch, onSendRequest, isLoading, searchResults, isSending, onClearResults }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skills: [],
    university: '',
    city: ''
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Загружаем доступные навыки для фильтрации
  useEffect(() => {
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const tags = await getTags({ category: 'technology' });
        setAvailableSkills(tags || []);
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSearch = () => {
    const searchParams = {
      search: query.trim()
    };
    
    // Добавляем фильтры, если они есть
    if (filters.skills.length > 0) {
      searchParams.skills = filters.skills;
    }
    if (filters.university) {
      searchParams.university = filters.university;
    }
    if (filters.city) {
      searchParams.city = filters.city;
    }
    
    onSearch(searchParams);
  };

  const handleClearFilters = () => {
    setFilters({
      skills: [],
      university: '',
      city: ''
    });
  };

  const handleClearAll = () => {
    setQuery('');
    handleClearFilters();
    if (onClearResults) {
      onClearResults();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSkillToggle = (skillName) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  const hasActiveFilters = filters.skills.length > 0 || filters.university || filters.city;

  return (
    <div className="user-search">
      {/* Поисковая строка */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Поиск по имени, фамилии или университету..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          {query && (
            <button className="clear-input" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="search-actions">
          <Button 
            variant="outline" 
            size="medium"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter size={18} />}
            className={showFilters ? 'active' : ''}
          >
            Фильтры
            {hasActiveFilters && <span className="filter-badge" />}
          </Button>
          <Button 
            variant="primary" 
            size="medium"
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            icon={<Search size={18} />}
          >
            Найти
          </Button>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h4>Фильтры поиска</h4>
            {hasActiveFilters && (
              <button className="clear-filters" onClick={handleClearFilters}>
                <X size={14} />
                Сбросить все
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Фильтр по навыкам */}
            <div className="filter-group">
              <label className="filter-label">
                <Code size={16} />
                <span>Навыки</span>
              </label>
              <div className="skills-filter">
                {loadingSkills ? (
                  <div className="skills-loading">Загрузка навыков...</div>
                ) : (
                  <div className="skills-list">
                    {availableSkills.slice(0, 10).map(skill => (
                      <button
                        key={skill.id}
                        className={`skill-chip ${filters.skills.includes(skill.name) ? 'active' : ''}`}
                        onClick={() => handleSkillToggle(skill.name)}
                      >
                        {skill.name}
                      </button>
                    ))}
                    {availableSkills.length > 10 && (
                      <span className="more-skills">+{availableSkills.length - 10}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Фильтр по университету */}
            <div className="filter-group">
              <label className="filter-label">
                <School size={16} />
                <span>Университет</span>
              </label>
              <input
                type="text"
                placeholder="Название вуза"
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className="filter-input"
              />
            </div>

            {/* Фильтр по городу */}
            <div className="filter-group">
              <label className="filter-label">
                <MapPin size={16} />
                <span>Город</span>
              </label>
              <input
                type="text"
                placeholder="Город"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filters-actions">
            <Button 
              variant="primary" 
              size="small"
              onClick={handleSearch}
              disabled={isLoading}
            >
              Применить фильтры
            </Button>
          </div>
        </div>
      )}

      {/* Состояние загрузки */}
      {isLoading && (
        <div className="search-loading">
          <Loader size={24} className="spinner" />
          <p>Поиск пользователей...</p>
        </div>
      )}

      {/* Результаты поиска */}
      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h4>Результаты поиска</h4>
            <span className="results-count">Найдено: {searchResults.length}</span>
          </div>
          <div className="results-list">
            {searchResults.map(user => (
              <div key={user.id} className="search-result-item">
                <div className="result-avatar-wrapper">
                  <img 
                    src={user.avatarUrl ? getMediaData(user.avatarUrl) : default_user_ava} 
                    alt={`${user.firstName} ${user.lastName}`}
                    className="result-avatar"
                  />
                  {user.privacyProfile === 'PRIVATE' && (
                    <span className="privacy-badge" title="Приватный профиль">🔒</span>
                  )}
                </div>
                <div className="result-info">
                  <div className="result-name">
                    {user.firstName} {user.lastName}
                  </div>
                  {user.university && (
                    <div className="result-university">
                      <School size={12} />
                      <span>{user.university}</span>
                    </div>
                  )}
                  {user.skills && user.skills.length > 0 && (
                    <div className="result-skills">
                      {user.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="result-skill">{skill}</span>
                      ))}
                      {user.skills.length > 3 && (
                        <span className="result-skill-more">+{user.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                  <div className="result-meta">
                    <span>На сайте с {new Date(user.user?.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                {contacts.map(c => c?.applicant.id).includes(user.id) ?
                <Button
                  variant="outline"
                  size="small"
                  disabled={true}
                  icon={<UserCheck size={16} />}
                >
                  Ваш друг
                </Button>
                :
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onSendRequest(user.id)}
                  disabled={isSending}
                  icon={<UserPlus size={16} />}
                >
                  Добавить в друзья
                </Button>    
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Пустой результат */}
      {searchResults && searchResults.length === 0 && query && (
        <div className="search-empty">
          <Search size={48} className="empty-icon" />
          <h4>Ничего не найдено</h4>
          <p>Попробуйте изменить поисковый запрос или фильтры</p>
          {hasActiveFilters && (
            <Button variant="outline" size="small" onClick={handleClearFilters}>
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;