import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Globe, MapPin, Users, Briefcase, Loader } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getEmployers } from '../../api/services';
import { supportedCities } from '../../data/mockData';
import './CompaniesPage.css';
import { default_company_ava } from '../../images';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const { IsAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  
  // Список индустрий для фильтрации
  const industries = [
    { id: 'all', label: 'Все' },
    { id: 'IT', label: 'IT-компании' },
    { id: 'FinTech', label: 'Финтех' },
    { id: 'Banking', label: 'Банки' },
    { id: 'Social Media', label: 'Соцсети' },
    { id: 'E-commerce', label: 'E-commerce' },
    { id: 'Education', label: 'Образование' },
    { id: 'Consulting', label: 'Консалтинг' }
  ];

  // Загрузка компаний
  const [fetchCompanies, loading, error] = useFetch(async () => {
    const params = {
      search: searchQuery || undefined,
      industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
      city: selectedCity !== 'all' ? selectedCity : undefined,
      page: currentPage,
      limit: limit
    };
    
    // Удаляем undefined значения
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await getEmployers(params);
    setCompanies(response.data);
    setMeta(response.meta);
    return response;
  });
  
  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });

  // Загружаем данные при изменении фильтров или страницы
  useEffect(() => {
    fetchCompanies();
  }, [searchQuery, selectedIndustry, selectedCity, currentPage]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1); // Сбрасываем страницу при новом поиске
        fetchCompanies();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleIndustryChange = (industryId) => {
    setSelectedIndustry(industryId);
    setCurrentPage(1);
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setSelectedCity('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVerificationStatus = (status) => {
    switch(status) {
      case 'VERIFIED':
        return { label: 'Верифицирована', class: 'verified', icon: '✓' };
      case 'PENDING':
        return { label: 'На проверке', class: 'pending', icon: '⏳' };
      default:
        return { label: 'Не верифицирована', class: 'unverified', icon: '⚠️' };
    }
  };

  const getIndustryIcon = (industry) => {
    switch(industry) {
      case 'IT': return '💻';
      case 'FinTech': return '💰';
      case 'Banking': return '🏦';
      case 'Social Media': return '📱';
      case 'E-commerce': return '🛍️';
      case 'Education': return '📚';
      case 'Consulting': return '📊';
      default: return '🏢';
    }
  };

  const hasActiveFilters = searchQuery || selectedIndustry !== 'all' || selectedCity !== 'all';

  return (
    <div className="companies-page">
      <Header isAuth={IsAuth} />
      
      <div className="companies-container container">
        {/* Заголовок */}
        <div className="companies-header">
          <div className="header-content">
            <Building2 size={48} className="header-icon" />
            <h1 className="companies-title">Компании-партнеры</h1>
            <p className="companies-subtitle">
              Ведущие IT-компании, которые ищут талантливых студентов и выпускников
            </p>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="search-filters">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Поиск компаний по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Сфера деятельности</label>
              <div className="industry-filters">
                {industries.map(industry => (
                  <button
                    key={industry.id}
                    className={`industry-chip ${selectedIndustry === industry.id ? 'active' : ''}`}
                    onClick={() => handleIndustryChange(industry.id)}
                  >
                    {industry.id !== 'all' && getIndustryIcon(industry.id)} {industry.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Город</label>
              <div className="city-filters">
                <button
                  className={`city-chip ${selectedCity === 'all' ? 'active' : ''}`}
                  onClick={() => handleCityChange('all')}
                >
                  Все города
                </button>
                {supportedCities.map(city => (
                  <button
                    key={city}
                    className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                    onClick={() => handleCityChange(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-actions">
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Состояние загрузки */}
        {loading && (
          <div className="loading-state">
            <Loader size={40} className="spinner" />
            <p>Загрузка компаний...</p>
          </div>
        )}

        {/* Ошибка */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <Button variant="primary" onClick={() => fetchCompanies()}>
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Список компаний */}
        {!loading && !error && companies.length > 0 && (
          <>
            <div className="companies-grid">
              {companies.map(company => {
                const verification = getVerificationStatus(company.verificationStatus);
                const opportunitiesCount = company._count?.opportunities || 0;
                
                return (
                  <div key={company.id} className="company-card">
                    <div className="company-card-header">
                      <img 
                        src={company.logoUrl || default_company_ava} 
                        alt={company.companyName}
                        className="company-logo-large"
                        onError={(e) => {
                          e.target.src = default_company_ava;
                        }}
                      />
                      <div className="company-header-info">
                        <h3 className="company-name">{company.companyName}</h3>
                        <div className="company-meta">
                          <span className="company-industry-badge">
                            {getIndustryIcon(company.industry)} {company.industry || 'IT'}
                          </span>
                          <span className={`verification-badge ${verification.class}`}>
                            {verification.icon} {verification.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="company-description">
                      {company.description?.substring(0, 150)}
                      {company.description?.length > 150 ? '...' : ''}
                    </p>

                    <div className="company-stats">
                      <div className="stat-item">
                        <Briefcase size={16} />
                        <span>{opportunitiesCount} возможностей</span>
                      </div>
                      <div className="stat-item">
                        <MapPin size={16} />
                        <span>{company.city || 'Не указан'}</span>
                      </div>
                      {company.websiteUrl && (
                        <a 
                          href={company.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="stat-item website-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe size={16} />
                          <span>Сайт</span>
                        </a>
                      )}
                    </div>

                    <div className="company-actions">
                      <Button
                        variant="primary"
                        size="medium"
                        fullWidth
                        onClick={() => navigate(`/employer/${company.id}`)}
                      >
                        Посмотреть компанию
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Пагинация */}
            {meta.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                
                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (meta.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= meta.totalPages - 2) {
                    pageNum = meta.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {meta.totalPages > 5 && currentPage < meta.totalPages - 2 && (
                  <>
                    <span className="pagination-dots">...</span>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(meta.totalPages)}
                    >
                      {meta.totalPages}
                    </button>
                  </>
                )}
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.totalPages}
                >
                  →
                </button>
              </div>
            )}

            {/* Статистика */}
            <div className="companies-stats">
              <div className="stat-card">
                <div className="stat-value">{meta.total}</div>
                <div className="stat-label">компаний</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {companies.reduce((sum, company) => sum + (company._count?.opportunities || 0), 0)}
                </div>
                <div className="stat-label">активных возможностей</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {companies.filter(c => c.verificationStatus === 'VERIFIED').length}
                </div>
                <div className="stat-label">верифицированных</div>
              </div>
            </div>
          </>
        )}

        {/* Пустой результат */}
        {!loading && !error && companies.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🏢</div>
            <h3>Компании не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CompaniesPage;