import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, Mail, User as UserIcon, Calendar, CheckCircle, XCircle, 
  ArrowLeft, Star, Clock, Users, Building2, Briefcase
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getUserDetails } from '../../api/services';
import './CuratorViewPage.css';
import { default_user_ava } from '../../images';
import { getMediaData } from '../../utils/files';


const CuratorViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { IsAdmin, User } = useAuth();
  const [curator, setCurator] = useState(null);

  // Загрузка профиля куратора
  const [fetchProfile, loadingProfile, profileError] = useFetch(async () => {
    const data = await getUserDetails(id);
    setCurator(data);
  });

  useEffect(() => {
    if (IsAdmin) {
      fetchProfile();
    }
  }, [id, IsAdmin]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = () => {
    if (!curator) return null;
    const isSuperAdmin = curator.curator?.isAdmin;
    
    if (isSuperAdmin) {
      return { label: 'Главный администратор', class: 'super-admin', icon: Star };
    }
    return { label: 'Куратор', class: 'curator', icon: Shield };
  };

  const getStatusBadge = () => {
    if (!curator) return null;
    
    if (curator.isActive) {
      return { label: 'Активен', class: 'active', icon: CheckCircle };
    }
    return { label: 'Заблокирован', class: 'inactive', icon: XCircle };
  };

  if (!IsAdmin) {
    return (
      <div className="curator-view-page">
        <Header />
        <div className="view-container container">
          <div className="access-denied">
            <Shield size={64} />
            <h2>Доступ ограничен</h2>
            <p>Эта страница доступна только администраторам платформы</p>
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
      <div className="curator-view-page">
        <Header />
        <div className="view-container container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка профиля куратора...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError || !curator || curator.role !== 'CURATOR') {
    return (
      <div className="curator-view-page">
        <Header />
        <div className="view-container container">
          <div className="error-state">
            <Shield size={64} />
            <h2>Куратор не найден</h2>
            <p>{profileError || 'Пользователь не является куратором или был удален'}</p>
            <Button variant="primary" onClick={() => navigate('/admin/curators')}>
              К списку кураторов
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const roleBadge = getRoleBadge();
  const statusBadge = getStatusBadge();
  const RoleIcon = roleBadge?.icon || Shield;
  const StatusIcon = statusBadge?.icon || Clock;

  return (
    <div className="curator-view-page">
      <Header />
      
      <div className="view-container container">
        {/* Навигация */}
        <div className="view-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
        </div>

        <div className="view-grid-curator">
          {/* Левая колонка */}
          <div className="view-sidebar-curator">
            <div className="avatar-section-curator">
              <div className="avatar-wrapper">
                <img 
                  src={curator.avatarUrl ? getMediaData(curator.avatarUrl) : default_user_ava} 
                  alt={curator.displayName}
                  className="curator-avatar"
                  onError={(e) => {
                    e.target.src = default_user_ava;
                  }}
                />
              </div>
              
              <div className="curator-name">
                <h1>{curator.displayName}</h1>
                <div className="curator-email">
                  <Mail size={16} />
                  <span>{curator.email}</span>
                </div>
              </div>
            </div>

            <div className="badges-section">
              <div className={`role-badge ${roleBadge.class}`}>
                <RoleIcon size={18} />
                <span>{roleBadge.label}</span>
              </div>
              <div className={`status-badge ${statusBadge.class}`}>
                <StatusIcon size={18} />
                <span>{statusBadge.label}</span>
              </div>
            </div>
          </div>
          {/* Правая колонка */}
          <div className="view-main-curator">
            {/* Основная информация */}
            <div className="info-card-curator">
              <div className="card-header-curator">
                <h2>Информация о кураторе</h2>
              </div>
              
              <div className="info-grid-curator">
                <div className="info-row-curator">
                  <UserIcon size={18} />
                  <div>
                    <label>Отображаемое имя</label>
                    <p>{curator.displayName}</p>
                  </div>
                </div>
                
                <div className="info-row-curator">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <p>{curator.email}</p>
                  </div>
                </div>

                <div className="info-row-curator">
                  <Shield size={18} />
                  <div>
                    <label>Роль</label>
                    <p>{curator.curator?.isAdmin ? 'Главный администратор' : 'Куратор'}</p>
                  </div>
                </div>

                <div className="info-row-curator">
                  <Calendar size={18} />
                  <div>
                    <label>Дата регистрации</label>
                    <p>{formatDate(curator.createdAt)}</p>
                  </div>
                </div>

                <div className="info-row-curator">
                  <Clock size={18} />
                  <div>
                    <label>Последнее обновление</label>
                    <p>{formatDate(curator.updatedAt)}</p>
                  </div>
                </div>

                {curator.curator?.createdAt && (
                  <div className="info-row-curator">
                    <Star size={18} />
                    <div>
                      <label>Назначен куратором</label>
                      <p>{formatDate(curator.curator.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Права доступа */}
            <div className="info-card-curator">
              <h2>Права доступа</h2>
              <div className="permissions-list">
                <div className="permission-item">
                  <CheckCircle size={18} className="permission-icon allowed" />
                  <span>Просмотр списка пользователей</span>
                </div>
                <div className="permission-item">
                  <CheckCircle size={18} className="permission-icon allowed" />
                  <span>Просмотр профилей пользователей</span>
                </div>
                <div className="permission-item">
                  <CheckCircle size={18} className="permission-icon allowed" />
                  <span>Управление тегами</span>
                </div>
                <div className="permission-item">
                  <CheckCircle size={18} className="permission-icon allowed" />
                  <span>Модерация возможностей</span>
                </div>
                <div className="permission-item">
                  <CheckCircle size={18} className="permission-icon allowed" />
                  <span>Верификация компаний</span>
                </div>
                {curator.curator?.isAdmin && (
                  <>
                    <div className="permission-item">
                      <CheckCircle size={18} className="permission-icon super" />
                      <span>Создание и удаление кураторов</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle size={18} className="permission-icon super" />
                      <span>Блокировка пользователей</span>
                    </div>
                    <div className="permission-item">
                      <CheckCircle size={18} className="permission-icon super" />
                      <span>Полный доступ ко всем данным</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CuratorViewPage;