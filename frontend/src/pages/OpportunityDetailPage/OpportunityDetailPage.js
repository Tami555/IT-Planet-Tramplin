import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, DollarSign, Briefcase, 
  MapPin, Calendar, Clock, Mail, Globe, Users, ExternalLink 
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Button from '../../components/UI/Button/Button';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getOpportunityById, getOpportunities, applyToOpportunity, getTags, getUserApplications } from '../../api/services';
import Footer from '../../components/Footer/Footer';
import './OpportunityDetailPage.css';
import { default_company_ava } from '../../images';
import { getMediaData } from '../../utils/files';


const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [similarOpportunities, setSimilarOpportunities] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [skillsTags, setSkillsTags] = useState([]);
  const { IsAuth, IsApplicant } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  // Загружаем теги
  const [fetchTags] = useFetch(async () => {
    const response = await getTags({ category: 'technology' });
    setSkillsTags(response);
    return response;
  });

  // Загружаем детали возможности
  const [fetchOpportunity, opportunityLoading, opportunityError] = useFetch(async () => {
    const response = await getOpportunityById(id);
    setOpportunity(response);
    return response;
  });

  // Загружаем похожие возможности
  const [fetchSimilar] = useFetch(async () => {
    if (!opportunity) return;
    
    const params = {
      tagIds: opportunity.tags?.map(t => t.tagId) || [],
      limit: 3
    };
    
    const response = await getOpportunities(params);
    // Фильтруем текущую возможность
    const filtered = response.data.filter(opp => opp.id !== opportunity.id);
    setSimilarOpportunities(filtered.slice(0, 3));
  });

  // Проверяем, откликался ли пользователь
  const [checkApplication, loadingcheckApplication] = useFetch(async () => {
    if (!IsAuth || !IsApplicant) return;
    
    // Запрос на проверку отклика
    const response = await getUserApplications(1, 1000)
    setHasApplied(response?.data?.map(a => a?.opportunityId).includes(opportunity?.id));
  });

  useEffect(() => {
    fetchTags();
    fetchOpportunity();
  }, [id]);

  useEffect(() => {
    if (opportunity) {
      fetchSimilar();
      checkApplication();
    }
  }, [opportunity]);

  const handleFavoriteToggle = async () => {
    if (!opportunity) return;
    
    if (isFavorite(opportunity.id)) {
      removeFromFavorites(opportunity.id);
    } else {
      addToFavorites(opportunity);
    }
  };

  const [applyFunc, applyLoading] = useFetch(async () => {
    await applyToOpportunity(opportunity.id);
    setHasApplied(true);
    alert('Вы успешно откликнулись на возможность!');
  });

  const handleApply = () => {
    if (!IsAuth) {
      alert('Войдите в аккаунт, чтобы откликнуться');
      return;
    }
    applyFunc();
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
      INTERNSHIP: { label: 'Стажировка', icon: '🎓', color: '#18A3B7' },
      VACANCY_JUNIOR: { label: 'Вакансия', icon: '💼', color: '#5AA5CD' },
      MENTORSHIP: { label: 'Менторство', icon: '🤝', color: '#6F71A1' },
      CAREER_EVENT: { label: 'Мероприятие', icon: '🎉', color: '#27E6EC' }
    };
    return types[type] || { label: type, icon: '📌', color: '#1E536E' };
  };

  const getFormatLabel = (format) => {
    const formats = {
      OFFICE: { label: 'В офисе', icon: '🏢' },
      REMOTE: { label: 'Удаленно', icon: '🏠' },
      HYBRID: { label: 'Гибрид', icon: '🔄' }
    };
    return formats[format] || { label: format, icon: '📍' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSalary = (salaryFrom, salaryTo) => {
    if (!salaryFrom && !salaryTo) return 'Не указана';
    if (salaryFrom && salaryTo) return `${salaryFrom.toLocaleString()} - ${salaryTo.toLocaleString()} ₽`;
    if (salaryFrom) return `от ${salaryFrom.toLocaleString()} ₽`;
    if (salaryTo) return `до ${salaryTo.toLocaleString()} ₽`;
    return 'Не указана';
  };

  if (opportunityLoading) {
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

  if (opportunityError || !opportunity) {
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
        <Footer />
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
                  src={opportunity.employer?.logoUrl ? getMediaData(opportunity.employer?.logoUrl) : default_company_ava} 
                  alt={opportunity.employer?.companyName}
                  className="company-logo-large"
                  onError={(e) => {
                    e.target.src = default_company_ava;
                  }}
                />
                <div className="company-info">
                  <h2 className="company-name">{opportunity.employer?.companyName}</h2>
                  <div className="company-meta">
                    <span className="company-industry">{opportunity.employer?.industry || 'IT'}</span>
                    {opportunity.employer?.verificationStatus === 'VERIFIED' && (
                      <span className="verified-badge">✓ Верифицирован</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="header-actions">
                {(IsApplicant == true || IsAuth == false) &&
                    <button 
                      className={`action-btn ${isFavorite(opportunity.id) ? 'active' : ''}`}
                      onClick={handleFavoriteToggle}
                      title={isFavorite(opportunity.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      <Heart size={24} fill={isFavorite(opportunity.id) ? 'currentColor' : 'none'} />
                    </button>   
                }
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
              </div>
            </div>

            {/* Ключевая информация */}
            <div className="info-grid">
              {(opportunity.salaryFrom || opportunity.salaryTo) && (
                <div className="info-card salary-card">
                  <DollarSign size={20} />
                  <div className="info-content">
                    <span className="info-label">Заработная плата</span>
                    <span className="info-value">
                      {formatSalary(opportunity.salaryFrom, opportunity.salaryTo)}
                    </span>
                  </div>
                </div>
              )}

              <div className="info-card">
                <Briefcase size={20} />
                <div className="info-content">
                  <span className="info-label">Тип занятости</span>
                  <span className="info-value">
                    {opportunity.type === 'INTERNSHIP' ? 'Стажировка' :
                     opportunity.type === 'VACANCY_JUNIOR' ? 'Полная занятость' :
                     opportunity.type === 'MENTORSHIP' ? 'Менторство' : 'Разовое мероприятие'}
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
                  <span className="info-value">{formatDate(opportunity.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* Описание */}
            <div className="detail-section">
              <h3>Описание</h3>
              <p className="description-text">{opportunity.description}</p>
            </div>

            {/* Навыки */}
            <div className="detail-section">
              <h3>Ключевые навыки</h3>
              <div className="tags-large">
                {opportunity.tags?.map(tag => {
                  const tagInfo = skillsTags.find(t => t.id === tag.tagId);
                  return (
                    <span key={tag.tagId} className="tag-large">
                      {tagInfo?.name || tag.tag?.name || 'Навык'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Даты */}
            {(opportunity.expiresAt || opportunity.eventDate) && (
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
                      <span>Срок действия до: {formatDate(opportunity.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Контакты */}
            {opportunity.contactEmail && (
              <div className="detail-section">
                <h3>Контакты</h3>
                <div className="contacts">
                  <div className="contact-item">
                    <Mail size={18} />
                    <a href={`mailto:${opportunity.contactEmail}`} className="contact-link">
                      {opportunity.contactEmail}
                    </a>
                  </div>
                  {opportunity.employer?.websiteUrl && (
                    <div className="contact-item">
                      <Globe size={18} />
                      <a 
                        href={opportunity.employer.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-link"
                      >
                        {opportunity.employer.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - действия и похожее */}
          <div className="detail-sidebar">
            {/* Блок с действиями */}
            {(IsApplicant == true || IsAuth == false) &&
              <div className="action-card">
                <h3>Действия</h3>
                {IsAuth && IsApplicant &&
                  <Button
                    variant={hasApplied ? 'outline' : 'primary'}
                    size="large"
                    fullWidth
                    onClick={handleApply}
                    disabled={hasApplied || applyLoading}
                  >
                    {hasApplied ? '✓ Вы откликнулись' : applyLoading ? 'Отправка...' : 'Откликнуться'}
                  </Button>
                }
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
            }
            
            {/* Информация о компании */}
            <div className="company-card">
              <h3>О компании</h3>
              <p className="company-description">{opportunity.employer?.description || 'Информация о компании отсутствует'}</p>
              <div className="company-stats">
                <div className="stat">
                  <Users size={16} />
                  <span>IT-компания</span>
                </div>
                <div className="stat">
                  <MapPin size={16} />
                  <span>{opportunity.employer?.city || opportunity.city}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="medium"
                fullWidth
                onClick={() => navigate(`/company/${opportunity.employer?.id}`)}
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
                        src={similar.employer?.logoUrl ? getMediaData(similar.employer?.logoUrl) : default_company_ava} 
                        alt={similar.employer?.companyName}
                        className="similar-logo"
                        onError={(e) => {
                          e.target.src = default_company_ava;
                        }}
                      />
                      <div className="similar-info">
                        <h4>{similar.title}</h4>
                        <p>{similar.employer?.companyName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OpportunityDetailPage;