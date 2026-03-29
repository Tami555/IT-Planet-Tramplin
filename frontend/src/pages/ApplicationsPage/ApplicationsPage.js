import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, Trash2, Briefcase, Calendar } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import OpportunityCard from '../../components/OpportunityCard/OpportunityCard';
import Button from '../../components/UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getUserApplications, revokeOpportunity } from '../../api/services';
import './ApplicationsPage.css';
import { useFavorites } from '../../hooks/useFavorites';
import { getMediaData } from '../../utils/files';


const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { IsAuth, IsApplicant, User } = useAuth();
  const [applications, setApplications] = useState([]);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  // Загружаем отклики пользователя
  const [fetchApplications, applicationsLoading] = useFetch(async () => {
    const response = await getUserApplications(1, 1000);
    setApplications(response?.data || []);
    setPaginationMeta(response?.meta || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1
    });
    return response;
  });

  // Отозвать отклик
  const [revokeFunc, revokeLoading] = useFetch(async (applicationId) => {
    await revokeOpportunity(applicationId);
    // После успешного отзыва обновляем список
    await fetchApplications();
  });

  useEffect(() => {
    if (IsAuth && IsApplicant && User) {
      fetchApplications();
    }
  }, [IsAuth, IsApplicant, User]);

  const handleRevoke = useCallback(async (applicationId) => {
    if (window.confirm('Вы уверены, что хотите отозвать отклик?')) {
      await revokeFunc(applicationId);
    }
  }, [revokeFunc]);


  // Обработчик добавления/удаления из избранного
    const handleFavoriteToggle = useCallback((opportunity) => {
      if (isFavorite(opportunity.id)) {
        removeFromFavorites(opportunity.id);
      } else {
        addToFavorites(opportunity);
      }
    }, [isFavorite, addToFavorites, removeFromFavorites]);


  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING':
        return <Clock size={18} className="status-icon pending" />;
      case 'ACCEPTED':
        return <CheckCircle size={18} className="status-icon accepted" />;
      case 'REJECTED':
        return <XCircle size={18} className="status-icon rejected" />;
      case 'RESERVE':
        return <Briefcase size={18} className="status-icon reserve" />;
      default:
        return <Clock size={18} className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонён';
      case 'RESERVE':
        return 'В резерве';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      case 'RESERVE':
        return 'status-reserve';
      default:
        return '';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      INTERNSHIP: 'Стажировка',
      VACANCY_JUNIOR: 'Вакансия',
      MENTORSHIP: 'Менторство',
      CAREER_EVENT: 'Мероприятие'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Подготовка данных для карточки
  const prepareOpportunityData = (application) => {
    const opportunity = application.opportunity;
    return {
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description || '',
      type: opportunity.type,
      format: opportunity.format,
      city: opportunity.city || opportunity.employer?.city || 'Не указан',
      salaryFrom: opportunity.salaryFrom,
      salaryTo: opportunity.salaryTo,
      company: {
        name: opportunity.employer?.companyName || 'Компания',
        logo: opportunity.employer?.logoUrl ? getMediaData(opportunity.employer?.logoUrl) : null
      },
      tags: opportunity.tags || [],
      employer: opportunity.employer
    };
  };

  if (!IsAuth || !IsApplicant) {
    return (
      <div className="applications-page">
        <Header isAuth={IsAuth} />
        <div className="applications-container container">
          <div className="applications-empty">
            <div className="empty-icon">
              <Clock size={64} strokeWidth={1.5} />
            </div>
            <h2>Доступ ограничен</h2>
            <p>Эта страница доступна только авторизованным соискателям</p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Войти как соискатель
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="applications-page">
      <Header isAuth={IsAuth} />
      
      <div className="applications-container container">
        {/* Навигация */}
        <div className="applications-nav">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
        </div>

        {/* Заголовок */}
        <div className="applications-header">
          <div className="header-left">
            <CheckCircle size={32} className="header-icon" />
            <h1 className="applications-title">Мои отклики</h1>
            {applications.length > 0 && (
              <span className="applications-count">{applications.length}</span>
            )}
          </div>
        </div>

        {/* Статистика */}
        {applications.length > 0 && (
          <div className="applications-stats">
            <div className="stat-card">
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Всего откликов</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => app.status === 'PENDING').length}
              </div>
              <div className="stat-label">На рассмотрении</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => app.status === 'ACCEPTED').length}
              </div>
              <div className="stat-label">Принято</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {applications.filter(app => app.status === 'REJECTED').length}
              </div>
              <div className="stat-label">Отклонено</div>
            </div>
          </div>
        )}

        {/* Контент */}
        {applicationsLoading ? (
          <div className="applications-loading">
            <div className="spinner"></div>
            <p>Загрузка откликов...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="applications-grid">
            {applications.map(application => {
              const opportunity = prepareOpportunityData(application);
              const canRevoke = application.status === 'PENDING';
              
              return (
                <div key={application.id} className="application-item">
                  <div className="application-header">
                    <div className={`application-status ${getStatusClass(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span>{getStatusText(application.status)}</span>
                    </div>
                    <div className="application-date">
                      <Calendar size={14} />
                      <span>{formatDate(application.createdAt)}</span>
                    </div>
                  </div>
                  
                  <OpportunityCard
                    opportunity={opportunity}
                    // isFavorite={false}
                    // onFavoriteToggle={() => {}}
                    isFavorite={isFavorite(opportunity.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(opportunity)}
                    variant="default"
                  />
                  
                  <div className="application-footer">
                    {canRevoke && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleRevoke(application.id)}
                        disabled={revokeLoading}
                        className="revoke-btn"
                      >
                        <Trash2 size={16} />
                        {revokeLoading ? 'Отзыв...' : 'Отозвать отклик'}
                      </Button>
                    )}
                    {application.coverLetter && (
                      <div className="cover-letter-preview">
                        <span className="cover-letter-label">Сопроводительное письмо:</span>
                        <p className="cover-letter-text">{application.coverLetter.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="applications-empty">
            <div className="empty-icon">
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h2>У вас пока нет откликов</h2>
            <p>Откликайтесь на интересные вакансии, стажировки и мероприятия, чтобы они появились здесь</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Найти возможности
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ApplicationsPage;