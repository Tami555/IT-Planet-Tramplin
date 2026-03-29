import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Globe, MapPin, Phone, Briefcase, 
  Users, ArrowLeft, CheckCircle, XCircle, Clock, 
  ExternalLink, Shield, Instagram, Twitter, Linkedin
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import OpportunitiesList from '../../components/OpportunitiesList/OpportunitiesList';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getUserDetails, getEmployerById } from '../../api/services';
import './EmployerViewPage.css';
import { getMediaData } from '../../utils/files';
import { default_company_ava } from '../../images';


const EmployerViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { IsAuth, IsApplicant, IsAdmin, User } = useAuth();
  const [employer, setEmployer] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Загрузка профиля
  const [fetchProfile, loadingProfile, profileError] = useFetch(async () => {
    if (IsAdmin == true) {
      // админ смотрит
      const data = await getUserDetails(id);
      setEmployer(data.employer);
      setOpportunitiesCount(data.employer?._count?.opportunities || 0);
    } 
    else {// Соискатель или работодатель смотрит 
      const data = await getEmployerById(id);
      setEmployer(data);
      setOpportunitiesCount(data._count?.opportunities || 0);
     // Проверяем, является ли текущий пользователь владельцем профиля
      setIsCurrentUser(User?.id === data.id);
    }
  });

  // Загрузка возможностей компании
  const [fetchOpportunities, loadingOpportunities] = useFetch(async () => {
    // TODO: Добавить эндпоинт для получения возможностей компании
    // const data = await getEmployerOpportunities(id);
    // setOpportunities(data.data || []);
    // Пока заглушка
    setOpportunities([]);
  });

  useEffect(() => {
    fetchProfile();
    fetchOpportunities();
  }, [id]);

  const getVerificationStatus = () => {
    if (!employer) return null;
    switch(employer.verificationStatus) {
      case 'VERIFIED':
        return { label: 'Верифицирована', class: 'verified', icon: CheckCircle };
      case 'PENDING':
        return { label: 'На проверке', class: 'pending', icon: Clock };
      case 'REJECTED':
        return { label: 'Отклонена', class: 'rejected', icon: XCircle };
      default:
        return { label: 'Не верифицирована', class: 'unverified', icon: Shield };
    }
  };

  const getSocialIcon = (url) => {
    if (url.includes('instagram')) return Instagram;
    if (url.includes('twitter') || url.includes('x.com')) return Twitter;
    if (url.includes('linkedin')) return Linkedin;
    return Globe;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loadingProfile) {
    return (
      <div className="employer-view-page">
        <Header />
        <div className="view-container container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка профиля компании...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError || !employer) {
    return (
      <div className="employer-view-page">
        <Header />
        <div className="view-container container">
          <div className="error-state">
            <Building2 size={64} />
            <h2>Компания не найдена</h2>
            <p>{profileError || 'Компания не существует или была удалена'}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="employer-view-page">
      <Header />
      
      <div className="view-container container">
        {/* Навигация */}
        <div className="view-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
        </div>

        <div className="view-grid">
          {/* Левая колонка */}
          <div className="view-sidebar-employer">
            <div className="logo-section">
              <div className="logo-wrapper-view">
                <img 
                  src={employer.logoUrl ? getMediaData(employer.logoUrl) : default_company_ava} 
                  alt={employer.companyName}
                  className="company-logo-view"
                  onError={(e) => {
                    e.target.src = default_company_ava;
                  }}
                />
              </div>
            </div>

            <div className="verification-card-view">
              <div className={`verification-status-view ${verificationStatus.class}`}>
                {verificationStatus.icon && <verificationStatus.icon size={20} />}
                <span>{verificationStatus.label}</span>
              </div>
              {employer.verifiedAt && (
                <p className="verified-date">
                  Верифицирована: {formatDate(employer.verifiedAt)}
                </p>
              )}
              {employer.verificationStatus === 'REJECTED' && employer.verificationNote && (
                <p className="verification-note-view">{employer.verificationNote}</p>
              )}
            </div>

            {opportunitiesCount != 0 && 
            <div className="stats-card-view">
              <div className="stat-item-view">
                <Briefcase size={20} />
                <div>
                  <div className="stat-value">{opportunitiesCount}</div>
                  <div className="stat-label">Возможностей</div>
                </div>
              </div>
            </div>
            }
          </div>

          {/* Правая колонка */}
          <div className="view-main">
            <div className="info-card">
              <div className="card-header">
                <h2>{employer.companyName}</h2>
                <div className="company-industry">
                  <Briefcase size={16} />
                  <span>{employer.industry || 'Сфера деятельности не указана'}</span>
                </div>
              </div>
              
              {/* Основная информация */}
              <div className="info-grid-employer-view">
                <div className="info-row-view">
                  <Building2 size={18} />
                  <div>
                    <label>Название компании</label>
                    <p>{employer.companyName}</p>
                  </div>
                </div>
                
                <div className="info-row-view">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <p>{employer.corporateEmail || employer.user?.email || 'Не указан'}</p>
                  </div>
                </div>

                <div className="info-row-view">
                  <MapPin size={18} />
                  <div>
                    <label>Город</label>
                    <p>{employer.city || 'Не указан'}</p>
                  </div>
                </div>

                {employer.inn && (
                  <div className="info-row-view">
                    <Shield size={18} />
                    <div>
                      <label>ИНН</label>
                      <p>{employer.inn}</p>
                    </div>
                  </div>
                )}

                {employer.websiteUrl && (
                  <div className="info-row-view">
                    <Globe size={18} />
                    <div>
                      <label>Сайт</label>
                      <a href={employer.websiteUrl} target="_blank" rel="noopener noreferrer">
                        {employer.websiteUrl} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Описание компании */}
            {employer.description && (
              <div className="info-card">
                <h2>О компании</h2>
                <p className="description-text-view">{employer.description}</p>
              </div>
            )}

            {/* Социальные сети */}
            {employer.socialLinks && employer.socialLinks.length > 0 && (
              <div className="info-card">
                <h2>Социальные сети</h2>
                <div className="social-links">
                  {employer.socialLinks.map((link, index) => {
                    const SocialIcon = getSocialIcon(link);
                    return (
                      <a 
                        key={index} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link-company"
                      >
                        <SocialIcon size={18} />
                        {link.replace(/^https?:\/\//, '').split('/')[0]}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Фото офиса */}
            {employer.officePhotoUrls && employer.officePhotoUrls.length > 0 && (
              <div className="info-card">
                <h2>Фото офиса</h2>
                <div className="office-photos-view">
                  {employer.officePhotoUrls.map((photo, index) => (
                    <div key={index} className="office-photo-view">
                      <img src={getMediaData(photo)} alt={`Office ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCurrentUser && IsApplicant && (
              <div className="action-buttons-view">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/company/${employer.id}/opportunities`)}
                >
                  Смотреть вакансии
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployerViewPage;