import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {User as UserIcon, Mail, GraduationCap, BookOpen, Globe, Edit2, 
    Upload, Heart, Users, FileText, LogOut, Lock, Github } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import ProfileEditModal from '../../components/ProfileEditModal/ProfileEditModal';
import PrivacySettings from '../../components/PrivacySettings/PrivacySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import {
  getCurrentApplicant,
  updateApplicantProfile,
  updatePrivacySettings,
  uploadAvatar,
  uploadResume,
  logout
} from '../../api/services';
import './ApplicantProfilePage.css';
import { default_user_ava } from "../../images/index";


const ApplicantProfilePage = () => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';
  const { User, ClearUser, IsApplicant } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // Загрузка профиля
  const [fetchProfile, loadingProfile, profileError] = useFetch(async () => {
    const data = await getCurrentApplicant();
    setProfile(data);
  });

  // Обновление профиля
  const [updateProfile, updatingProfile, updateError] = useFetch(async (profileData) => {
    const updated = await updateApplicantProfile(profileData);
    setProfile(updated);
    setIsEditModalOpen(false);
  });

  // Обновление приватности
  const [updatePrivacy, updatingPrivacy, privacyError] = useFetch(async (privacyData) => {
    const updated = await updatePrivacySettings(privacyData);
    setProfile(prev => ({ ...prev, ...updated }));
    setIsPrivacyOpen(false);
  });

  // Загрузка аватара
  const [uploadAvatarFunc, uploadingAvatar, avatarError] = useFetch(async (file) => {
    const result = await uploadAvatar(file);
    setProfile(prev => ({ ...prev, avatarUrl: result.avatarUrl }));
    setAvatarFile(null);
  });

  // Загрузка резюме
  const [uploadResumeFunc, uploadingResume, resumeError] = useFetch(async (file) => {
    const result = await uploadResume(file);
    setProfile(prev => ({ ...prev, resumeUrl: result.resumeUrl }));
    setResumeFile(null);
  });

  // Выход
  const [logoutFunc, loggingOut] = useFetch(async () => {
    await logout();
    ClearUser();
    window.location = '/';
  });

  useEffect(() => {
    if (IsApplicant) {
      fetchProfile();
    }
  }, [IsApplicant]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      uploadAvatarFunc(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      uploadResumeFunc(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logoutFunc();
    }
  };

  if (!IsApplicant) {
    return (
      <div className="applicant-profile-page">
        <Header />
        <div className="profile-container container">
          <div className="not-applicant">
            <Lock size={64} />
            <h2>Доступ ограничен</h2>
            <p>Этот раздел доступен только соискателям</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="applicant-profile-page">
        <Header />
        <div className="profile-container container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="applicant-profile-page">
        <Header />
        <div className="profile-container container">
          <div className="error-state">
            <h2>Ошибка загрузки профиля</h2>
            <p>{profileError}</p>
            <Button variant="primary" onClick={() => fetchProfile()}>
              Попробовать снова
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="applicant-profile-page">
      <Header />
      
      <div className="profile-container container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <span className="current">Мой профиль</span>
        </div>

        <div className="profile-grid">
          {/* Левая колонка - Аватар и основная информация */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img 
                    src={profile.avatarUrl ? `${API_URL}${profile.avatarUrl}` : default_user_ava} 
                    alt="Avatar"
                    className="profile-avatar"
                />
                <label className="avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                  <Upload size={20} />
                </label>
              </div>
              {uploadingAvatar && <p className="uploading-text">Загрузка...</p>}
              {avatarError && <p className="error-text">{avatarError}</p>}
            </div>

            <div className="profile-stats">
              <div className="stat-item" onClick={() => navigate('/favorites')}>
                <Heart size={35} />
                <div className="stat-label">Избранное</div>
              </div>
              <div className="stat-item">
                <Users size={35} />
                  <div className="stat-label">Контакты</div>
              </div>
              <div className="stat-item" onClick={() => navigate('/applications')}>
                <FileText size={35} />
                <div className="stat-label">Отклики</div>
              </div>
            </div>

            <Button 
              variant="outline" 
              fullWidth
              onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
              className="privacy-toggle"
            >
              <Lock size={18} />
              Настройки приватности
            </Button>

            <Button 
              variant="ghost" 
              fullWidth
              onClick={handleLogout}
              disabled={loggingOut}
              className="logout-btn"
            >
              <LogOut size={18} />
              Выйти
            </Button>
          </div>

          {/* Правая колонка - Детальная информация */}
          <div className="profile-main">
            {/* Настройки приватности */}
            {isPrivacyOpen && (
              <div className="privacy-section">
                <PrivacySettings 
                  settings={{
                    privacyProfile: profile.privacyProfile,
                    privacyResume: profile.privacyResume,
                    privacyResponses: profile.privacyResponses
                  }}
                  onSave={updatePrivacy}
                  isLoading={updatingPrivacy}
                />
              </div>
            )}

            {/* Основная информация */}
            <div className="info-card">
              <div className="card-header">
                <h2>Основная информация</h2>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 size={18} />
                  Редактировать
                </button>
              </div>
              
              <div className="info-grid">
                <div className="info-row">
                  <UserIcon size={18} />
                  <div>
                    <label>Имя</label>
                    <p>{profile.firstName || 'Не указано'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <UserIcon size={18} />
                  <div>
                    <label>Фамилия</label>
                    <p>{profile.lastName || 'Не указано'}</p>
                  </div>
                </div>
                {profile.middleName && (
                  <div className="info-row">
                    <UserIcon size={18} />
                    <div>
                      <label>Отчество</label>
                      <p>{profile.middleName}</p>
                    </div>
                  </div>
                )}
                <div className="info-row">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <p>{User?.email || 'Не указан'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <GraduationCap size={18} />
                  <div>
                    <label>Университет</label>
                    <p>{profile.university || 'Не указан'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <BookOpen size={18} />
                  <div>
                    <label>Курс / Год выпуска</label>
                    <p>
                      {profile.course ? `${profile.course} курс` : ''}
                      {profile.course && profile.graduationYear ? ', ' : ''}
                      {profile.graduationYear ? `${profile.graduationYear}` : ''}
                      {!profile.course && !profile.graduationYear ? 'Не указано' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* О себе */}
            {profile.bio && (
              <div className="info-card">
                <h2>О себе</h2>
                <p className="bio-text">{profile.bio}</p>
              </div>
            )}

            {/* Навыки */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="info-card">
                <h2>Навыки</h2>
                <div className="skills-list">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Портфолио */}
            {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
              <div className="info-card">
                <h2>Портфолио</h2>
                <div className="portfolio-links">
                  {profile.portfolioLinks.map((link, index) => (
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
              </div>
            )}

            {/* Резюме */}
            <div className="info-card">
              <h2>Резюме</h2>
              {profile.resumeUrl ? (
                <div className="resume-section">
                  <a 
                    href={`${API_URL}${profile.resumeUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    <FileText size={20} />
                    Посмотреть резюме
                  </a>
                </div>
              ) : (
                <div className="upload-resume">
                  <label className="upload-label">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      disabled={uploadingResume}
                    />
                    <Upload size={20} />
                    Загрузить резюме
                  </label>
                  {uploadingResume && <p className="uploading-text">Загрузка...</p>}
                  {resumeError && <p className="error-text">{resumeError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profile}
        onSave={updateProfile}
        isLoading={updatingProfile}
      />

      <Footer />
    </div>
  );
};

export default ApplicantProfilePage;