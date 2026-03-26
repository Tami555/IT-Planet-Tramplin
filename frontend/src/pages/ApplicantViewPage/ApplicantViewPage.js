import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Mail, GraduationCap, BookOpen, Globe, 
  Github, ArrowLeft, UserPlus, UserCheck, Lock
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getApplicantById, getContacts, sendFriendRequest } from '../../api/services/ApplicantService/contacts';
import './ApplicantViewPage.css';
import { default_user_ava } from '../../images';
import { getMediaData } from '../../utils/files';
import { getUserDetails } from '../../api/services';


const ApplicantViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { IsAuth, User, IsApplicant, IsAdmin } = useAuth();
  const [applicant, setApplicant] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  // Загрузка профиля
  const [fetchProfile, loadingProfile, profileError] = useFetch(async () => {
    if (IsApplicant){
      const data = await getApplicantById(id);
      setApplicant(data);
      const currentUserFriends = await getContacts();
      setIsFriend(currentUserFriends.map(f => f?.id).includes(id))
    }
    else{
      const data = await getUserDetails(id);
      setApplicant(data.applicant);
      setIsFriend(true)
    }
  });

  // Отправка запроса в друзья
  const [sendRequest, sendingRequest, ErrorsendRequest] = useFetch(async () => {
    await sendFriendRequest(id);
    alert('Запрос в друзья отправлен!');
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const canViewField = (fieldPrivacy) => {
    if (!IsAuth) return false;
    if (fieldPrivacy === 'PUBLIC') return true;
    if ((fieldPrivacy === 'CONTACTS' && isFriend) || IsAdmin == true) return true;
    if ((fieldPrivacy === 'PRIVATE' && User?.id === applicant?.userId) || IsAdmin == true) return true;
    return false;
  };

  const getPrivacyIcon = (privacy) => {
    switch(privacy) {
      case 'PUBLIC': return <Globe size={14} />;
      case 'CONTACTS': return <UserIcon size={14} />;
      case 'PRIVATE': return <Lock size={14} />;
      default: return null;
    }
  };

  if (loadingProfile) {
    return (
      <div className="applicant-view-page">
        <Header />
        <div className="view-container container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError || !applicant ) {
    return (
      <div className="applicant-view-page">
        <Header />
        <div className="view-container container">
          <div className="error-state">
            <h2>Профиль не найден</h2>
            <p>{profileError || 'Пользователь не существует или был удален'}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canViewProfile = canViewField(applicant.privacyProfile);
  const canViewResume = canViewField(applicant.privacyResume);
  const canViewResponses = canViewField(applicant.privacyResponses);

  if (!canViewProfile) {
    return (
      <div className="applicant-view-page">
        <Header />
        <div className="view-container container">
          <div className="private-profile">
            <Lock size={64} />
            <h2>Профиль скрыт</h2>
            <p>Пользователь ограничил доступ к своему профилю</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="applicant-view-page">
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
          <div className="view-sidebar">
            <div className="avatar-section">
              <img 
                src={applicant.avatarUrl ? getMediaData(applicant.avatarUrl) : default_user_ava} 
                alt={`${applicant.firstName} ${applicant.lastName}`}
                className="view-avatar"
              />
            </div>

            <div className="action-buttons">
              {IsAuth && IsApplicant && User?.id !== applicant.userId && !isFriend && (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={sendRequest}
                    disabled={sendingRequest}
                    icon={<UserPlus size={18} />}
                  >
                    {sendingRequest ? 'Отправка...' : 'Добавить в друзья'}
                  </Button>
                  <p style={{color: "red"}}>{ErrorsendRequest}</p>
                </>
              )}
            </div>
          </div>

          {/* Правая колонка */}
          <div className="view-main">
            <div className="info-card">
              <div className="card-header">
                <h2>Основная информация</h2>
              </div>
              
              <div className="info-grid">
                <div className="info-row">
                  <UserIcon size={18} />
                  <div>
                    <label>Имя</label>
                    <p>{applicant.firstName || 'Не указано'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <UserIcon size={18} />
                  <div>
                    <label>Фамилия</label>
                    <p>{applicant.lastName || 'Не указано'}</p>
                  </div>
                </div>
                {applicant.middleName && (
                  <div className="info-row">
                    <UserIcon size={18} />
                    <div>
                      <label>Отчество</label>
                      <p>{applicant.middleName}</p>
                    </div>
                  </div>
                )}
                <div className="info-row">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <p>{applicant.user?.email || 'Не указан'}</p>
                    {applicant.privacyProfile !== 'PUBLIC' && (
                      <span className="privacy-badge">
                        {getPrivacyIcon(applicant.privacyProfile)} Доступ ограничен
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-row">
                  <GraduationCap size={18} />
                  <div>
                    <label>Университет</label>
                    <p>{applicant.university || 'Не указан'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <BookOpen size={18} />
                  <div>
                    <label>Курс / Год выпуска</label>
                    <p>
                      {applicant.course ? `${applicant.course} курс` : ''}
                      {applicant.course && applicant.graduationYear ? ', ' : ''}
                      {applicant.graduationYear ? `${applicant.graduationYear}` : ''}
                      {!applicant.course && !applicant.graduationYear ? 'Не указано' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* О себе */}
            {applicant.bio && (
              <div className="info-card">
                <h2>О себе</h2>
                <p className="bio-text">{applicant.bio}</p>
              </div>
            )}

            {/* Навыки */}
            {applicant.skills && applicant.skills.length > 0 && (
              <div className="info-card">
                <h2>Навыки</h2>
                <div className="skills-list">
                  {applicant.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Портфолио */}
            {applicant.portfolioLinks && applicant.portfolioLinks.length > 0 && canViewResponses && (
              <div className="info-card">
                <h2>Портфолио</h2>
                <div className="portfolio-links">
                  {applicant.portfolioLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="portfolio-link"
                    >
                      {link.includes('github') ? <Github size={16} /> : <Globe size={16} />}
                      {link}
                    </a>
                  ))}
                </div>
                {!canViewResponses && (
                  <p className="privacy-note">Портфолио скрыто настройками приватности</p>
                )}
              </div>
            )}

            {/* Резюме */}
            {canViewResume && applicant.resumeUrl && (
              <div className="info-card">
                <h2>Резюме</h2>
                <a 
                  href={getMediaData(applicant.resumeUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resume-link"
                >
                  Посмотреть резюме
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ApplicantViewPage;