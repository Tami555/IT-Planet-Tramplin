import React, { useState } from 'react';
import { Edit2, Trash2, Eye, Copy, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from '../UI/Button/Button';
import './OpportunitiesList.css';

const OpportunitiesList = ({
  isVerification,
  opportunities, 
  onEdit, 
  onDelete, 
  onCreate,
  onViewApplications,
  isLoading 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getStatusBadge = (status) => {
    const statuses = {
      DRAFT: { label: 'Черновик', class: 'draft', icon: Edit2 },
      ACTIVE: { label: 'Активна', class: 'active', icon: CheckCircle },
      CLOSED: { label: 'Закрыта', class: 'closed', icon: XCircle },
      PLANNED: { label: 'Запланирована', class: 'planned', icon: Clock },
      MODERATION: { label: 'На модерации', class: 'moderation', icon: Clock }
    };
    const s = statuses[status] || statuses.DRAFT;
    const Icon = s.icon;
    return (
      <span className={`status-badge-opp ${s.class}`}>
        <Icon size={14} />
        {s.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const types = {
      INTERNSHIP: 'Стажировка',
      VACANCY_JUNIOR: 'Вакансия (Junior+)',
      MENTORSHIP: 'Менторство',
      CAREER_EVENT: 'Мероприятие'
    };
    return types[type] || type;
  };

  const getFormatLabel = (format) => {
    const formats = {
      OFFICE: 'Офис',
      HYBRID: 'Гибрид',
      REMOTE: 'Удалённо'
    };
    return formats[format] || format;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSalary = (from, to, currency) => {
    if (!from && !to) return 'Не указана';
    const currencySymbol = currency === 'RUB' ? '₽' : currency;
    if (from && to) return `${from.toLocaleString()} - ${to.toLocaleString()} ${currencySymbol}`;
    if (from) return `от ${from.toLocaleString()} ${currencySymbol}`;
    if (to) return `до ${to.toLocaleString()} ${currencySymbol}`;
    return 'Не указана';
  };

  const handleDeleteConfirm = (opportunity) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${opportunity.title}"?`)) {
      onDelete(opportunity.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="opportunities-list">
      <div className="opportunities-header-opp">
        <h3>Мои возможности</h3>
      </div>

      {opportunities.length === 0 ? (
        <div className="empty-opportunities">
          <p>У вас пока нет созданных возможностей</p>
          {isVerification == true && 
            <Button variant="outline" onClick={onCreate}>
              Создать первую возможность
            </Button>
          }
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map(opp => (
            <div key={opp.id} className="opportunity-card-opp">
              <div className="card-header-opp">
                <div className="title-section">
                  <h4>{opp.title}</h4>
                  {getStatusBadge(opp.status)}
                </div>
                <div className="card-actions-opp">
                  <button 
                    className="action-btn-opp"
                    onClick={() => onViewApplications(opp.id)}
                    title="Просмотреть отклики"
                  >
                    <Eye size={18} />
                    <span>{opp._count?.applications || 0}</span>
                  </button>
                  <button 
                    className="action-btn-opp"
                    onClick={() => onEdit(opp)}
                    title="Редактировать"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button 
                    className="action-btn-opp delete"
                    onClick={() => handleDeleteConfirm(opp)}
                    title="Удалить"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="card-body-opp">
                <p className="description">{opp.description.substring(0, 150)}...</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Тип:</span>
                    <span className="detail-value">{getTypeLabel(opp.type)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Формат:</span>
                    <span className="detail-value">{getFormatLabel(opp.format)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Город:</span>
                    <span className="detail-value">{opp.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Зарплата:</span>
                    <span className="detail-value salary">
                      {formatSalary(opp.salaryFrom, opp.salaryTo, opp.currency)}
                    </span>
                  </div>
                </div>

                {opp.tags && opp.tags.length > 0 && (
                  <div className="tags-section">
                    {opp.tags.map(tag => (
                      <span key={tag.tagId} className="tag-opp">{tag.tag.name}</span>
                    ))}
                  </div>
                )}

                <div className="dates-section">
                  {opp.expiresAt && (
                    <div className="date-item">
                      <Clock size={14} />
                      <span>Действует до: {formatDate(opp.expiresAt)}</span>
                    </div>
                  )}
                  {opp.eventDate && (
                    <div className="date-item">
                      <Clock size={14} />
                      <span>Дата проведения: {formatDate(opp.eventDate)}</span>
                    </div>
                  )}
                  <div className="date-item">
                    <span>Создана: {formatDate(opp.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;