import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Building2, Briefcase, Tag, Plus, X,
  Eye, CheckCircle, Clock, FileText, UserPlus, LogOut
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import StatsCards from '../../components/Curator/StatsCards/StatsCards';
import UsersTable from '../../components/Curator/UsersTable/UsersTable';
import VerificationQueue from '../../components/Curator/VerificationQueue/VerificationQueue';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import {
  getPlatformStats,
  createCurator,
  getCurators,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getPendingVerifications,
  reviewVerification,
  getModerationOpportunities,
  moderateOpportunity,
  createTag,
  deleteTag,
  logout
} from '../../api/services';
import { getTags } from '../../api/services';
import './CuratorProfilePage.css';

const CuratorProfilePage = () => {
  const navigate = useNavigate();
  const { IsAdmin, User, ClearUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [moderationOpportunities, setModerationOpportunities] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCreateCurator, setShowCreateCurator] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newCurator, setNewCurator] = useState({ email: '', displayName: '', password: '' });
  const [newTag, setNewTag] = useState({ name: '', category: 'technology' });

  // Загрузка статистики
  const [fetchStats, loadingStats] = useFetch(async () => {
    const data = await getPlatformStats();
    setStats(data);
  });

  // Загрузка пользователей
  const [fetchUsers, loadingUsers] = useFetch(async () => {
    const data = await getUsers({ page: 1, limit: 100 });
    setUsers(data.data || []);
  });

  // Загрузка верификаций
  const [fetchVerifications, loadingVerifications] = useFetch(async () => {
    const data = await getPendingVerifications({ page: 1, limit: 100 });
    setPendingVerifications(data.data || []);
  });

  // Загрузка возможностей на модерации
  const [fetchModeration, loadingModeration] = useFetch(async () => {
    const data = await getModerationOpportunities({ page: 1, limit: 100 });
    setModerationOpportunities(data.data || []);
  });

  // Загрузка тегов
  const [fetchTags, loadingTags] = useFetch(async () => {
    const data = await getTags();
    setTags(data);
  });

  // Создание куратора
  const [createCuratorFunc, creatingCurator, errorCreatingCurator] = useFetch(async () => {
    await createCurator(newCurator);
    setShowCreateCurator(false);
    setNewCurator({ email: '', displayName: '', password: '' });
    fetchUsers();
  });

  // Изменение статуса пользователя
  const [toggleStatus, togglingStatus] = useFetch(async (userId, isActive) => {
    await updateUserStatus(userId, isActive);
    fetchUsers();
  });

  // Рассмотрение верификации
  const [reviewVerificationFunc, reviewing] = useFetch(async (employerId, status, note) => {
    await reviewVerification(employerId, status, note);
    fetchVerifications();
    fetchStats();
  });

  // Модерация возможности
  const [moderateFunc, moderating] = useFetch(async (opportunityId, status, note) => {
    await moderateOpportunity(opportunityId, status, note);
    fetchModeration();
    fetchStats();
  });

  // Создание тега
  const [createTagFunc, creatingTag] = useFetch(async () => {
    await createTag(newTag.name, newTag.category);
    setShowCreateTag(false);
    setNewTag({ name: '', category: 'technology' });
    fetchTags();
  });

  // Удаление тега
  const [deleteTagFunc, deletingTag] = useFetch(async (tagId) => {
    if (window.confirm('Удалить этот тег?')) {
      await deleteTag(tagId);
      fetchTags();
    }
  });

  // Выход
    const [logoutFunc, loggingOut] = useFetch(async () => {
      await logout();
      ClearUser();
      window.location = '/';
    });

  useEffect(() => {
    if (IsAdmin) {
      fetchStats();
      fetchUsers();
      fetchVerifications();
      fetchModeration();
      fetchTags();
    }
  }, [IsAdmin]);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logoutFunc();
    }
  };

  if (!IsAdmin) {
    return (
      <div className="curator-profile-page">
        <Header />
        <div className="profile-container container">
          <div className="not-curator">
            <Shield size={64} />
            <h2>Доступ ограничен</h2>
            <p>Этот раздел доступен только администраторам платформы</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getOpportunityTypeLabel = (type) => {
    const types = {
      INTERNSHIP: 'Стажировка',
      VACANCY_JUNIOR: 'Вакансия',
      MENTORSHIP: 'Менторство',
      CAREER_EVENT: 'Мероприятие'
    };
    return types[type] || type;
  };

  return (
    <div className="curator-profile-page">
      <Header />
      
      <div className="profile-container container">
        <div className="breadcrumbs">
          <span onClick={() => navigate('/')}>Главная</span>
          <span>/</span>
          <span className="current">Панель администратора</span>
        </div>

        <div className="curator-header">
          <div className="header-info">
            <Shield size={40} className="header-icon" />
            <div>
              <h1>Здравствуйте {User.displayName} 👋</h1>
              <h1>Вы в панели администратора</h1>
              <p>Управление платформой, пользователями и контентом</p>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="curator-tabs">
          <button
            className={`tab-btn-curator ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Eye size={18} />
            Обзор
          </button>
          <button
            className={`tab-btn-curator ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Пользователи
          </button>
          <button
            className={`tab-btn-curator ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <CheckCircle size={18} />
            Верификация
          </button>
          <button
            className={`tab-btn-curator ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <FileText size={18} />
            Модерация
          </button>
          <button
            className={`tab-btn-curator ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            <Tag size={18} />
            Теги
          </button>
        </div>

        <div className="tab-content-curator">
          {/* Обзор */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <StatsCards stats={stats} />
              
              <div className="quick-actions">
                <h3>Быстрые действия</h3>
                <div className="actions-grid">
                  <button className="quick-action" onClick={() => setShowCreateCurator(true)}>
                    <UserPlus size={24} />
                    <span>Добавить куратора</span>
                  </button>
                  <button className="quick-action" onClick={() => setActiveTab('verification')}>
                    <CheckCircle size={24} />
                    <span>Проверить компании</span>
                  </button>
                  <button className="quick-action" onClick={() => setActiveTab('moderation')}>
                    <FileText size={24} />
                    <span>Промодерировать</span>
                  </button>
                  <button className="quick-action" onClick={() => setShowCreateTag(true)}>
                    <Tag size={24} />
                    <span>Создать тег</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Пользователи */}
          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="tab-header">
                <h2>Управление пользователями</h2>
                <Button variant="primary" onClick={() => setShowCreateCurator(true)}>
                  <UserPlus size={18} />
                  Добавить куратора
                </Button>
              </div>
              <UsersTable
                users={users}
                onToggleStatus={toggleStatus}
                loading={loadingUsers}
              />
            </div>
          )}

          {/* Верификация */}
          {activeTab === 'verification' && (
            <div className="verification-tab">
              <div className="tab-header">
                <h2>Заявки на верификацию</h2>
                <span className="pending-count">{pendingVerifications.length} ожидают</span>
              </div>
              <VerificationQueue
                items={pendingVerifications}
                onReview={reviewVerificationFunc}
                loading={loadingVerifications}
              />
            </div>
          )}

          {/* Модерация */}
          {activeTab === 'moderation' && (
            <div className="moderation-tab">
              <div className="tab-header">
                <h2>Возможности на модерации</h2>
                <span className="pending-count">{moderationOpportunities.length} ожидают</span>
              </div>
              <div className="moderation-grid">
                {moderationOpportunities.map(opp => (
                  <div key={opp.id} className="moderation-card">
                    <div className="card-header-mod">
                      <h4>{opp.title}</h4>
                      <span className="type-badge">{getOpportunityTypeLabel(opp.type)}</span>
                    </div>
                    <div className="card-body-mod">
                      <p><strong>Компания:</strong> {opp.employer?.companyName || 'Не указана'}</p>
                      <p><strong>Город:</strong> {opp.city}</p>
                      <p className="description-mod">{opp.description?.substring(0, 150)}...</p>
                    </div>
                    <div className="card-footer-mod">
                      <button
                        className="accept-mod"
                        onClick={() => moderateFunc(opp.id, 'ACTIVE', '')}
                      >
                        <CheckCircle size={16} />
                        Одобрить
                      </button>
                      <button
                        className="reject-mod"
                        onClick={() => {
                          const note = prompt('Укажите причину отклонения:');
                          if (note) moderateFunc(opp.id, 'REJECTED', note);
                        }}
                      >
                        <X size={16} />
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
                {moderationOpportunities.length === 0 && (
                  <div className="empty-moderation">
                    <CheckCircle size={48} />
                    <p>Нет возможностей на модерации</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Теги */}
          {activeTab === 'tags' && (
            <div className="tags-tab">
              <div className="tab-header">
                <h2>Управление тегами</h2>
                <Button variant="primary" onClick={() => setShowCreateTag(true)}>
                  <Plus size={18} />
                  Создать тег
                </Button>
              </div>
              <div className="tags-grid-manage">
                {tags.map(tag => (
                  <div key={tag.id} className="tag-manage-card">
                    <span className="tag-name">{tag.name}</span>
                    <span className={`tag-category ${tag.category}`}>
                      {tag.category === 'technology' ? 'Технология' :
                       tag.category === 'level' ? 'Уровень' :
                       tag.category === 'employment' ? 'Занятость' : 'Пользовательский'}
                    </span>
                    <button
                      className="delete-tag"
                      onClick={() => deleteTagFunc(tag.id)}
                      disabled={deletingTag}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Модальное окно создания куратора */}
      {showCreateCurator && (
        <div className="modal-overlay" onClick={() => setShowCreateCurator(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить куратора</h2>
              <button className="modal-close" onClick={() => setShowCreateCurator(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <InputBlock
                label="Email"
                value={newCurator.email}
                onChange={(e) => setNewCurator({ ...newCurator, email: e.target.value })}
                placeholder="curator@university.ru"
                required
              />
              <InputBlock
                label="Отображаемое имя"
                value={newCurator?.displayName}
                onChange={(e) => setNewCurator({ ...newCurator, displayName: e.target.value })}
                placeholder="Мария Петрова"
                required
              />
              <InputBlock
                label="Пароль"
                type="password"
                value={newCurator.password}
                onChange={(e) => setNewCurator({ ...newCurator, password: e.target.value })}
                placeholder="******"
                required
              />
              {errorCreatingCurator && <p style={{color: "red"}}>{errorCreatingCurator}</p>}
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowCreateCurator(false)}>
                Отмена
              </Button>
              <Button variant="primary" onClick={createCuratorFunc} disabled={creatingCurator}>
                {creatingCurator ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания тега */}
      {showCreateTag && (
        <div className="modal-overlay" onClick={() => setShowCreateTag(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Создать тег</h2>
              <button className="modal-close" onClick={() => setShowCreateTag(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <InputBlock
                label="Название тега"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Kotlin"
                required
              />
              <div className="form-group">
                <label className="input-label">Категория</label>
                <select
                  value={newTag.category}
                  onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                  className="select-field"
                >
                  <option value="technology">Технология</option>
                  <option value="level">Уровень</option>
                  <option value="employment">Тип занятости</option>
                  <option value="custom">Пользовательский</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowCreateTag(false)}>
                Отмена
              </Button>
              <Button variant="primary" onClick={createTagFunc} disabled={creatingTag}>
                {creatingTag ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CuratorProfilePage;