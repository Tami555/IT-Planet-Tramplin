import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Globe, MapPin, Phone, Edit2, 
  Upload, Trash2, Plus, CheckCircle, XCircle, Clock,
  Image, Users, Briefcase, ExternalLink, Shield, LogOut
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import OpportunitiesList from '../../components/OpportunitiesList/OpportunitiesList';
import ApplicationsList from '../../components/ApplicationsList/ApplicationsList';
import OpportunityFormModal from '../../components/OpportunityFormModal/OpportunityFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import {
  getCurrentEmployer,
  updateEmployerProfile,
  uploadEmployerLogo,
  uploadOfficePhotos,
  submitVerification,
  getMyOpportunities,
  getMyApplications,
  updateApplicationStatus,
  logout
} from '../../api/services';
import { createOpportunity, updateOpportunity, deleteOpportunity } from '../../api/services';
import { supportedCities } from '../../data/mockData';
import './EmployerProfilePage.css';
import { getMediaData } from '../../utils/files';
import { default_user_ava } from '../../images';

const EmployerProfilePage = () => {
  const navigate = useNavigate();
  const { User, IsApplicant, IsAdmin, ClearUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, opportunities, applications
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [officePhotos, setOfficePhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  // Загрузка профиля
  const [fetchProfile, loadingProfile, profileError] = useFetch(async () => {
    const data = await getCurrentEmployer();
    setProfile(data);
    setEditForm({
      companyName: data.companyName || '',
      description: data.description || '',
      industry: data.industry || '',
      websiteUrl: data.websiteUrl || '',
      socialLinks: data.socialLinks || [],
      city: data.city || ''
    });
    setOfficePhotos(data.officePhotoUrls || []);
  });
  
  // Обновление профиля
  const [updateProfile, updatingProfile] = useFetch(async (profileData) => {
    const updated = await updateEmployerProfile(profileData);
    setProfile(updated);
    setIsEditing(false);
  });
  
  // Загрузка логотипа
  const [uploadLogo, uploadingLogo] = useFetch(async (file) => {
    const result = await uploadEmployerLogo(file);
    setProfile(prev => ({ ...prev, logoUrl: result.logoUrl }));
  });
  

// Загрузка фото офиса
const [uploadPhotos, uploadingPhotosFunc] = useFetch(async (files) => {
  const result = await uploadOfficePhotos(files);
  setOfficePhotos(result.officePhotoUrls);  
  setUploadingPhotos(false);
});
    
  // Верификация
  const [verifyCompany, verifying] = useFetch(async () => {
    await submitVerification();
    setProfile(prev => ({ ...prev, verificationStatus: 'PENDING' }));
    alert('Заявка на верификацию отправлена!');
  });
  
  // Загрузка возможностей
  const [fetchOpportunities, loadingOpportunities] = useFetch(async (status = null) => {
    const params = { page: 1, limit: 100 };
    if (status) params.status = status;
    const data = await getMyOpportunities(params);
    setOpportunities(data.data || []);
  });
  
  // Загрузка откликов
  const [fetchApplications, loadingApplications] = useFetch(async (opportunityId = null) => {
    const params = { page: 1, limit: 100 };
    if (opportunityId) params.opportunityId = opportunityId;
    const data = await getMyApplications(params);
    setApplications(data);
  });
  
  // Создание/обновление возможности
  const [saveOpportunity, savingOpportunity] = useFetch(async (opportunityData) => {
    if (editingOpportunity) {
      const updated = await updateOpportunity(editingOpportunity.id, opportunityData);
      setOpportunities(prev => prev.map(opp => opp.id === updated.id ? updated : opp));
    } else {
      const created = await createOpportunity(opportunityData);
      setOpportunities(prev => [created, ...prev]);
    }
    setIsOpportunityModalOpen(false);
    setEditingOpportunity(null);
    fetchOpportunities();
  });
  
  // Удаление возможности
  const [deleteOpportunityFunc, deletingOpportunity] = useFetch(async (id) => {
    await deleteOpportunity(id);
    setOpportunities(prev => prev.filter(opp => opp.id !== id));
  });
  
  // Изменение статуса отклика
  const [changeApplicationStatus, changingStatus] = useFetch(async (applicationId, status) => {
    await updateApplicationStatus(applicationId, status);
    fetchApplications(selectedOpportunityId);
  });

  // Выход
  const [logoutFunc, loggingOut] = useFetch(async () => {
    await logout();
    ClearUser();
    window.location = '/';
  });
  
  useEffect(() => {
    if (!IsApplicant && !IsAdmin && User) {
      fetchProfile();
      fetchOpportunities();
      fetchApplications();
    }
  }, [User]);
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadLogo(file);
    }
  };
  
  const handleOfficePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadingPhotos(true);
      uploadPhotos(files);
    }
  };
  
  const handleEditSubmit = () => {
    updateProfile(editForm);
  };
  
  const handleCreateOpportunity = () => {
    setEditingOpportunity(null);
    setIsOpportunityModalOpen(true);
  };
  
  const handleEditOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setIsOpportunityModalOpen(true);
  };
  
  const handleDeleteOpportunity = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту возможность?')) {
      deleteOpportunityFunc(id);
    }
  };
  
  const handleViewApplications = (opportunityId) => {
    setSelectedOpportunityId(opportunityId);
    setSelectedTab('applications');
    fetchApplications(opportunityId);
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logoutFunc();
    }
  };
  
  const getVerificationStatus = () => {
    if (!profile) return null;
    switch(profile.verificationStatus) {
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
  
  if (!IsApplicant && !IsAdmin === false && !User) {
    return (
      <div className="employer-profile-page">
        <Header />
        <div className="profile-container container">
          <div className="not-employer">
            <Building2 size={64} />
            <h2>Доступ ограничен</h2>
            <p>Этот раздел доступен только работодателям</p>
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
      <div className="employer-profile-page">
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
      <div className="employer-profile-page">
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
  
  const verificationStatus = getVerificationStatus();
  
  return (
    <div className="employer-profile-page">
      <Header />
      
      <div className="profile-container container">
        <div className="breadcrumbs">
          <span onClick={() => navigate('/')}>Главная</span>
          <span>/</span>
          <span className="current">Профиль компании</span>
        </div>
        
        <div className="profile-grid">
          {/* Левая колонка */}
          <div className="profile-sidebar-employer">
            <div className="logo-section">
              <div className="logo-wrapper">
                <img 
                  src={profile.logoUrl || default_user_ava} 
                  alt={profile.companyName}
                  className="logo-company-large"
                />
                <label className="logo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                  />
                  <Upload size={20} />
                </label>
              </div>
              {uploadingLogo && <p className="uploading-text">Загрузка...</p>}
            </div>
            
            <div className="verification-card">
              <div className={`verification-status ${verificationStatus.class}`}>
                {verificationStatus.icon && <verificationStatus.icon size={20} />}
                <span>{verificationStatus.label}</span>
              </div>
              {profile.verificationStatus === 'UNVERIFIED' && (
                <Button 
                  variant="outline" 
                  size="small" 
                  fullWidth
                  onClick={verifyCompany}
                  disabled={verifying}
                >
                  <Shield size={16} />
                  Подать заявку на верификацию
                </Button>
              )}
              {profile.verificationStatus === 'REJECTED' && profile.verificationNote && (
                <p className="verification-note">{profile.verificationNote}</p>
              )}
            </div>
            
            <div className="stats-card">
              <div className="stat-item-employer">
                <Briefcase size={20} />
                <div>
                  <div className="stat-value">{opportunities.length}</div>
                  <div className="stat-label">Возможностей</div>
                </div>
              </div>
              <div className="stat-item-employer">
                <Users size={20} />
                <div>
                  <div className="stat-value">{applications.length}</div>
                  <div className="stat-label">Откликов</div>
                </div>
              </div>
            </div>
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
          
          {/* Правая колонка */}
          <div className="profile-main-employer">
            {/* Основная информация */}
            <div className="info-card-employer">
              <div className="card-header">
                <h2>Информация о компании</h2>
                <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 size={18} />
                  {isEditing ? 'Отмена' : 'Редактировать'}
                </button>
              </div>
              
              {isEditing ? (
                <div className="edit-form">
                  <InputBlock
                    label="Название компании"
                    name="companyName"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                    required
                  />
                  <InputBlock
                    label="Описание"
                    name="description"
                    type="textarea"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                  />
                  <InputBlock
                    label="Сфера деятельности"
                    name="industry"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                  />
                  <InputBlock
                    label="Сайт"
                    name="websiteUrl"
                    value={editForm.websiteUrl}
                    onChange={(e) => setEditForm({...editForm, websiteUrl: e.target.value})}
                  />
                  <div className="form-group">
                    <label className="input-label">Город</label>
                    <select
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="select-field"
                    >
                      <option value="">Выберите город</option>
                      {supportedCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="edit-actions">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                    <Button variant="primary" onClick={handleEditSubmit} disabled={updatingProfile}>
                      {updatingProfile ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="info-grid-employer">
                  <div className="info-row-employer">
                    <Building2 size={18} />
                    <div>
                      <label>Название</label>
                      <p>{profile.companyName || 'Не указано'}</p>
                    </div>
                  </div>
                  <div className="info-row-employer">
                    <Globe size={18} />
                    <div>
                      <label>Сфера</label>
                      <p>{profile.industry || 'Не указана'}</p>
                    </div>
                  </div>
                  <div className="info-row-employer">
                    <Mail size={18} />
                    <div>
                      <label>Email</label>
                      <p>{User?.email || 'Не указан'}</p>
                    </div>
                  </div>
                  <div className="info-row-employer">
                    <MapPin size={18} />
                    <div>
                      <label>Город</label>
                      <p>{profile.city || 'Не указан'}</p>
                    </div>
                  </div>
                  {profile.websiteUrl && (
                    <div className="info-row-employer">
                      <Globe size={18} />
                      <div>
                        <label>Сайт</label>
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                          {profile.websiteUrl} <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Описание */}
            {!isEditing && profile.description && (
              <div className="info-card-employer">
                <h2>О компании</h2>
                <p className="description-text">{profile.description}</p>
              </div>
            )}
            
            {/* Фото офиса */}
            <div className="info-card-employer">
              <h2>Фото офиса</h2>
              <div className="office-photos">
                {officePhotos.map((photo, index) => (
                  <div key={index} className="office-photo">
                    <img src={getMediaData(photo)} alt={`Office ${index + 1}`} />
                  </div>
                ))}
                <label className="add-photo">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleOfficePhotosChange}
                    disabled={uploadingPhotos}
                  />
                  <Plus size={24} />
                  <span>Добавить фото</span>
                </label>
              </div>
              {uploadingPhotos && <p className="uploading-text">Загрузка фото...</p>}
            </div>
            
            {/* Табы */}
            <div className="tabs-section">
              <div className="tabs-header">
                <button
                  className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('overview')}
                >
                  Обзор
                </button>
                <button
                  className={`tab-btn ${selectedTab === 'opportunities' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTab('opportunities');
                    fetchOpportunities();
                  }}
                >
                  Возможности
                </button>
                <button
                  className={`tab-btn ${selectedTab === 'applications' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTab('applications');
                    fetchApplications(selectedOpportunityId);
                  }}
                >
                  Отклики
                </button>
              </div>
              
              <div className="tab-content">
                {selectedTab === 'overview' && (
                  <div className="overview-content">
                    <div className="stats-overview">
                      <div className="stat-card-overview">
                        <Briefcase size={32} />
                        <div>
                          <div className="stat-number">{opportunities.length}</div>
                          <div className="stat-name">Всего возможностей</div>
                        </div>
                      </div>
                      <div className="stat-card-overview">
                        <Users size={32} />
                        <div>
                          <div className="stat-number">{applications.length}</div>
                          <div className="stat-name">Всего откликов</div>
                        </div>
                      </div>
                    </div>
                    {
                      profile.verificationStatus === "VERIFIED" &&
                      <div className="action-buttons">
                      <Button variant="primary" onClick={handleCreateOpportunity}>
                        <Plus size={18} />
                        Создать возможность
                      </Button>
                    </div>
                    }
                  </div>
                )}
                
                {selectedTab === 'opportunities' && (
                  <OpportunitiesList
                    isVerification={profile.verificationStatus === "VERIFIED"}
                    opportunities={opportunities}
                    onEdit={handleEditOpportunity}
                    onDelete={handleDeleteOpportunity}
                    onCreate={handleCreateOpportunity}
                    onViewApplications={handleViewApplications}
                    isLoading={loadingOpportunities}
                  />
                )}
                
                {selectedTab === 'applications' && (
                  <ApplicationsList
                    applications={applications}
                    onStatusChange={changeApplicationStatus}
                    isLoading={loadingApplications || changingStatus}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Модальное окно создания/редактирования возможности */}
      <OpportunityFormModal
        isOpen={isOpportunityModalOpen}
        onClose={() => {
          setIsOpportunityModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSave={saveOpportunity}
        opportunity={editingOpportunity}
        isLoading={savingOpportunity}
      />
      
      <Footer />
    </div>
  );
};

export default EmployerProfilePage;