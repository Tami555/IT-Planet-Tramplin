import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Globe, MapPin, Users, Briefcase } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import { companies, opportunities } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import './CompaniesPage.css';
import { default_company_ava } from '../../images';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const { IsAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Индустрии для фильтрации
  const industries = [
    { id: 'all', label: 'Все' },
    { id: 'IT', label: 'IT-компании' },
    { id: 'FinTech', label: 'Финтех' },
    { id: 'Banking', label: 'Банки' },
    { id: 'Social Media', label: 'Соцсети' },
    { id: 'E-commerce', label: 'E-commerce' },
  ];

  useEffect(() => {
    let filtered = [...companies];
    
    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.description.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по индустрии
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }
    
    setFilteredCompanies(filtered);
  }, [searchQuery, selectedIndustry]);

  // Подсчет вакансий для компании
  const getCompanyOpportunitiesCount = (companyId) => {
    return opportunities.filter(opp => opp.company.id === companyId).length;
  };

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
              placeholder="Поиск компаний по названию или сфере..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="industry-filters">
            {industries.map(industry => (
              <button
                key={industry.id}
                className={`industry-chip ${selectedIndustry === industry.id ? 'active' : ''}`}
                onClick={() => setSelectedIndustry(industry.id)}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </div>

        {/* Список компаний */}
        {filteredCompanies.length > 0 ? (
          <div className="companies-grid">
            {filteredCompanies.map(company => {
              const opportunitiesCount = getCompanyOpportunitiesCount(company.id);
              
              return (
                <div key={company.id} className="company-card">
                  <div className="company-card-header">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="company-logo-large"
                      onError={(e) => {
                        e.target.src = default_company_ava;
                      }}
                    />
                    <div className="company-header-info">
                      <h3 className="company-name">{company.name}</h3>
                      <div className="company-meta">
                        <span className="company-industry-badge">
                          {company.industry === 'IT' ? '💻 IT' :
                           company.industry === 'FinTech' ? '💰 FinTech' :
                           company.industry === 'Banking' ? '🏦 Банк' :
                           company.industry === 'Social Media' ? '📱 Соцсети' :
                           company.industry === 'E-commerce' ? '🛍️ E-commerce' : '🏢 Компания'}
                        </span>
                        {company.verified && (
                          <span className="verified-badge">
                            ✓ Верифицирован
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="company-description">{company.description}</p>

                  <div className="company-stats">
                    <div className="stat-item">
                      <Briefcase size={16} />
                      <span>{opportunitiesCount} возможностей</span>
                    </div>
                    <div className="stat-item">
                      <MapPin size={16} />
                      <span>{company.city}</span>
                    </div>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="stat-item website-link"
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
                      onClick={() => navigate('/', { state: { companyId: company.id } })}
                    >
                      Посмотреть возможности
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🏢</div>
            <h3>Компании не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}

        {/* Статистика */}
        {filteredCompanies.length > 0 && (
          <div className="companies-stats">
            <div className="stat-card">
              <div className="stat-value">{filteredCompanies.length}</div>
              <div className="stat-label">компаний</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {filteredCompanies.reduce((sum, company) => sum + getCompanyOpportunitiesCount(company.id), 0)}
              </div>
              <div className="stat-label">активных возможностей</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{filteredCompanies.filter(c => c.verified).length}</div>
              <div className="stat-label">верифицированных</div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CompaniesPage;