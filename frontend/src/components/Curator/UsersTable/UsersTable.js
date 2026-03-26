import React, { useState } from 'react';
import { Search, Eye, Ban, CheckCircle, User, Building2, Shield } from 'lucide-react';
import Button from '../../UI/Button/Button';
import './UsersTable.css';
import { useNavigate } from 'react-router-dom';

const UsersTable = ({ users, onToggleStatus, loading }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  const onViewDetails = (user) => {
    // Детальный показ профилей
    if (user.applicant != null){
      return navigate(`/applicant/${user.id}`)
    }
    else if (user.employer != null){
      console.log(`Profile: ${user.employer.companyName}`)
    }
    else{
      console.log('Profile Admin')
    }
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'APPLICANT':
        return <User size={16} />;
      case 'EMPLOYER':
        return <Building2 size={16} />;
      case 'CURATOR':
        return <Shield size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'APPLICANT':
        return 'Соискатель';
      case 'EMPLOYER':
        return 'Работодатель';
      case 'CURATOR':
        return 'Куратор';
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="users-table-container">
      <div className="table-filters">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по email или имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="role-filters">
          <button
            className={`role-filter ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRole('all')}
          >
            Все
          </button>
          <button
            className={`role-filter ${selectedRole === 'APPLICANT' ? 'active' : ''}`}
            onClick={() => setSelectedRole('APPLICANT')}
          >
            Соискатели
          </button>
          <button
            className={`role-filter ${selectedRole === 'EMPLOYER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('EMPLOYER')}
          >
            Работодатели
          </button>
          <button
            className={`role-filter ${selectedRole === 'CURATOR' ? 'active' : ''}`}
            onClick={() => setSelectedRole('CURATOR')}
          >
            Кураторы
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-table">Загрузка...</div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-curator ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn-view"
                        onClick={() => onViewDetails(user)}
                        title="Просмотреть"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className={`action-btn-status ${user.isActive ? 'ban' : 'unban'}`}
                        onClick={() => onToggleStatus(user.id, !user.isActive)}
                        title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                      >
                        {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="no-results">Пользователи не найдены</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersTable;