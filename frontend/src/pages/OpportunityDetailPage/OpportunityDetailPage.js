import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Users,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Clock
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Button from '../../components/UI/Button/Button';
import { opportunities, skillsTags } from '../../data/mockData';
import { useFavorites } from '../../hooks/useFavorites';
import './OpportunityDetailPage.css';


const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarOpportunities, setSimilarOpportunities] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    // Загружаем данные о возможности
    const found = opportunities.find(opp => opp.id === parseInt(id));
    if (found) {
      setOpportunity(found);
      
      // Находим похожие (по тегам)
      const similar = opportunities
        .filter(opp => opp.id !== found.id && 
          opp.tags.some(tag => found.tags.includes(tag)))
        .slice(0, 3);
      setSimilarOpportunities(similar);
    }
    setLoading(false);

    // Проверяем, откликался ли пользователь
    const applied = JSON.parse(localStorage.getItem('applied') || '[]');
    setHasApplied(applied.some(item => item.id === parseInt(id)));
  }, [id]);

  const handleFavoriteToggle = () => {
    if (!opportunity) return;
    
    if (isFavorite(opportunity.id)) {
      removeFromFavorites(opportunity.id);
    } else {
      addToFavorites(opportunity);
    }
  };

  const handleApply = () => {
    // Для неавторизованных сохраняем в localStorage
    const applied = JSON.parse(localStorage.getItem('applied') || '[]');
    if (!applied.some(item => item.id === opportunity.id)) {
      applied.push(opportunity);
      localStorage.setItem('applied', JSON.stringify(applied));
      setHasApplied(true);
      
      // Показываем уведомление
      alert('Вы откликнулись на возможность! Для отслеживания статуса войдите в аккаунт.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity.title,
        text: opportunity.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      internship: { label: 'Стажировка', icon: '🎓', color: '#18A3B7' },
      vacancy: { label: 'Вакансия', icon: '💼', color: '#5AA5CD' },
      mentorship: { label: 'Менторство', icon: '🤝', color: '#6F71A1' },
      event: { label: 'Мероприятие', icon: '🎉', color: '#27E6EC' }
    };
    return types[type] || { label: type, icon: '📌', color: '#1E536E' };
  };

  const getFormatLabel = (format) => {
    const formats = {
      office: { label: 'В офисе', icon: '🏢' },
      remote: { label: 'Удаленно', icon: '🏠' },
      hybrid: { label: 'Гибрид', icon: '🔄' }
    };
    return formats[format] || { label: format, icon: '📍' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="detail-page">
        <Header />
        <div className="not-found">
          <h1>Возможность не найдена</h1>
          <p>К сожалению, запрашиваемая вакансия или мероприятие не существует</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  const typeInfo = getTypeLabel(opportunity.type);
  const formatInfo = getFormatLabel(opportunity.format);

  return (
    <div className="detail-page">
      <Header />

      <div className="detail-container container">
        {/* Навигация */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>

        {/* Основной контент */}
        <div className="detail-content">
          {/* Левая колонка - основная информация */}
          <div className="detail-main">
            {/* Шапка с компанией */}
            <div className="detail-header">
              <div className="company-badge">
                <img 
                  src={opportunity.company.logo} 
                  alt={opportunity.company.name}
                  className="company-logo-large"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Company';
                  }}
                />
                <div className="company-info">
                  <h2 className="company-name">{opportunity.company.name}</h2>
                  <div className="company-meta">
                    <span className="company-industry">{opportunity.company.industry}</span>
                    {opportunity.company.verified && (
                      <span className="verified-badge">✓ Верифицирован</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="header-actions">
                <button 
                  className={`action-btn ${isFavorite(opportunity.id) ? 'active' : ''}`}
                  onClick={handleFavoriteToggle}
                  title={isFavorite(opportunity.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  <Heart size={24} fill={isFavorite(opportunity.id) ? 'currentColor' : 'none'} />
                </button>
                <button 
                  className="action-btn"
                  onClick={handleShare}
                  title="Поделиться"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            {/* Заголовок вакансии */}
            <div className="title-section">
              <h1 className="opportunity-title">{opportunity.title}</h1>
              <div className="opportunity-badges">
                <span className="badge" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                  {typeInfo.icon} {typeInfo.label}
                </span>
                <span className="badge">
                  {formatInfo.icon} {formatInfo.label}
                </span>
                {opportunity.level && (
                  <span className="badge">
                    👤 {opportunity.level}
                  </span>
                )}
              </div>
            </div>

            {/* Ключевая информация */}
            <div className="info-grid">
              {opportunity.salary && (
                <div className="info-card salary-card">
                  <DollarSign size={20} />
                  <div className="info-content">
                    <span className="info-label">Заработная плата</span>
                    <span className="info-value">{formatSalary(opportunity.salary)}</span>
                  </div>
                </div>
              )}

              <div className="info-card">
                <Briefcase size={20} />
                <div className="info-content">
                  <span className="info-label">Тип занятости</span>
                  <span className="info-value">
                    {opportunity.employmentType === 'full-time' ? 'Полная' : 
                     opportunity.employmentType === 'part-time' ? 'Частичная' : 
                     opportunity.employmentType === 'project' ? 'Проектная' : 'Не указано'}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <MapPin size={20} />
                <div className="info-content">
                  <span className="info-label">Местоположение</span>
                  <span className="info-value">{opportunity.address || opportunity.city}</span>
                </div>
              </div>

              <div className="info-card">
                <Calendar size={20} />
                <div className="info-content">
                  <span className="info-label">Опубликовано</span>
                  <span className="info-value">{formatDate(opportunity.publicationDate)}</span>
                </div>
              </div>
            </div>

            {/* Описание */}
            <div className="detail-section">
              <h3>Описание</h3>
              <p className="description-text">{opportunity.description}</p>
            </div>

            {/* Требования */}
            <div className="detail-section">
              <h3>Требования к кандидату</h3>
              <p className="requirements-text">{opportunity.requirements}</p>
            </div>

            {/* Навыки */}
            <div className="detail-section">
              <h3>Ключевые навыки</h3>
              <div className="tags-large">
                {opportunity.tags.map(tagId => {
                  const tag = skillsTags.find(t => t.id === tagId);
                  return (
                    <span key={tagId} className="tag-large">
                      {tag?.name || `Навык ${tagId}`}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Даты */}
            {(opportunity.expirationDate || opportunity.eventDate) && (
              <div className="detail-section">
                <h3>Сроки</h3>
                <div className="dates">
                  {opportunity.eventDate ? (
                    <div className="date-item">
                      <Clock size={18} />
                      <span>Дата проведения: {formatDate(opportunity.eventDate)}</span>
                    </div>
                  ) : (
                    <div className="date-item">
                      <Clock size={18} />
                      <span>Срок действия до: {formatDate(opportunity.expirationDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Контакты */}
            <div className="detail-section">
              <h3>Контакты</h3>
              <div className="contacts">
                <div className="contact-item">
                  <Mail size={18} />
                  <a href={`mailto:${opportunity.contacts}`} className="contact-link">
                    {opportunity.contacts}
                  </a>
                </div>
                {opportunity.company.website && (
                  <div className="contact-item">
                    <Globe size={18} />
                    <a 
                      href={opportunity.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      {opportunity.company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка - действия и похожее */}
          <div className="detail-sidebar">
            {/* Блок с действиями */}
            <div className="action-card">
              <h3>Действия</h3>
              <Button
                variant={hasApplied ? 'outline' : 'primary'}
                size="large"
                fullWidth
                onClick={handleApply}
                disabled={hasApplied}
              >
                {hasApplied ? '✓ Вы откликнулись' : 'Откликнуться'}
              </Button>
              <Button
                variant="outline"
                size="large"
                fullWidth
                onClick={handleFavoriteToggle}
              >
                <Heart size={18} fill={isFavorite(opportunity.id) ? 'currentColor' : 'none'} />
                {isFavorite(opportunity.id) ? 'В избранном' : 'В избранное'}
              </Button>
            </div>

            {/* Информация о компании */}
            <div className="company-card">
              <h3>О компании</h3>
              <p className="company-description">{opportunity.company.description}</p>
              <div className="company-stats">
                <div className="stat">
                  <Users size={16} />
                  <span>IT-компания</span>
                </div>
                <div className="stat">
                  <MapPin size={16} />
                  <span>{opportunity.company.city}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="medium"
                fullWidth
                onClick={() => navigate(`/company/${opportunity.company.id}`)}
              >
                Все вакансии компании
                <ExternalLink size={16} />
              </Button>
            </div>

            {/* Похожие возможности */}
            {similarOpportunities.length > 0 && (
              <div className="similar-card">
                <h3>Похожие возможности</h3>
                <div className="similar-list">
                  {similarOpportunities.map(similar => (
                    <div 
                      key={similar.id} 
                      className="similar-item"
                      onClick={() => navigate(`/opportunity/${similar.id}`)}
                    >
                      <img 
                        src={similar.company.logo} 
                        alt={similar.company.name}
                        className="similar-logo"
                      />
                      <div className="similar-info">
                        <h4>{similar.title}</h4>
                        <p>{similar.company.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailPage;