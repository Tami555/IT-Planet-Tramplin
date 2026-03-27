import React, { useState } from 'react';
import { Eye, Check, X, Clock, Download } from 'lucide-react';
import Button from '../UI/Button/Button';
import './ApplicationsList.css';
import { default_user_ava } from '../../images';
import { getMediaData } from '../../utils/files';


const ApplicationsList = ({ applications, onStatusChange, isLoading }) => {
  console.log("APPLICANTS", applications)
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusBadge = (status) => {
    const statuses = {
      PENDING: { label: 'На рассмотрении', class: 'pending', icon: Clock },
      ACCEPTED: { label: 'Принят', class: 'accepted', icon: Check },
      REJECTED: { label: 'Отклонён', class: 'rejected', icon: X },
      RESERVE: { label: 'В резерве', class: 'reserve', icon: Clock }
    };
    const s = statuses[status] || statuses.PENDING;
    const Icon = s.icon;
    return (
      <span className={`status-badge ${s.class}`}>
        <Icon size={14} />
        {s.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  return (
    <div className="applications-list">
      {applications.length === 0 ? (
        <div className="empty-applications">
          <p>Пока нет откликов на ваши вакансии</p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications?.map(app => (
            <div key={app.id} className="application-card">
              <div className="application-header">
                <div className="applicant-info">
                  <img 
                    src={getMediaData(app.applicant.avatarUrl) || default_user_ava }
                    alt={app.applicant.firstName}
                    className="applicant-avatar"
                  />
                  <div>
                    <h4>{app.applicant.firstName} {app.applicant.lastName}</h4>
                    <p className="applicant-university">{app.applicant.university || 'Вуз не указан'}</p>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="application-body">
                <div className="applications-opportunity-title">
                  <strong>Вакансия:</strong> {app.opportunity.title}
                </div>
                {app.coverLetter && (
                  <div className="cover-letter">
                    <strong>Сопроводительное письмо:</strong>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
                <div className="applicant-skills">
                  <strong>Навыки:</strong>
                  <div className="applications-skills-list">
                    {app.applicant.skills?.map((skill, idx) => (
                      <span key={idx} className="applications-skill-tag-small">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="application-footer">
                <div className="application-date">
                  Отклик от {formatDate(app.createdAt)}
                </div>
                <div className="application-actions">
                  {app.applicant.resumeUrl && (
                    <a 
                      href={app.applicant.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-icon"
                      title="Скачать резюме"
                    >
                      <Download size={18} />
                    </a>
                  )}
                  <button 
                    className="action-icon"
                    onClick={() => handleViewDetails(app)}
                    title="Подробнее"
                  >
                    <Eye size={18} />
                  </button>
                  {app.status === 'PENDING' && (
                    <>
                      <button 
                        className="action-icon accept"
                        onClick={() => onStatusChange(app.id, 'ACCEPTED')}
                        title="Принять"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        className="action-icon reject"
                        onClick={() => onStatusChange(app.id, 'REJECTED')}
                        title="Отклонить"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        className="action-icon reserve"
                        onClick={() => onStatusChange(app.id, 'RESERVE')}
                        title="В резерв"
                      >
                        <Clock size={18} />
                      </button>
                    </>
                  )}
                  {app.status === 'RESERVE' && (
                    <>
                      <button 
                        className="action-icon accept"
                        onClick={() => onStatusChange(app.id, 'ACCEPTED')}
                        title="Принять"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        className="action-icon reject"
                        onClick={() => onStatusChange(app.id, 'REJECTED')}
                        title="Отклонить"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с деталями */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Детали отклика</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Кандидат</h4>
                <p><strong>Имя:</strong> {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}</p>
                <p><strong>Университет:</strong> {selectedApplication.applicant.university || 'Не указан'}</p>
                <p><strong>Навыки:</strong></p>
                <div className="applications-skills-list">
                  {selectedApplication.applicant.skills?.map((skill, idx) => (
                    <span key={idx} className="applications-skill-tag-small">{skill}</span>
                  ))}
                </div>
                {selectedApplication.applicant.portfolioLinks?.length > 0 && (
                  <>
                    <p><strong>Портфолио:</strong></p>
                    <div className="portfolio-links">
                      {selectedApplication.applicant.portfolioLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="detail-section">
                <h4>Вакансия</h4>
                <p><strong>Название:</strong> {selectedApplication.opportunity.title}</p>
                <p><strong>Тип:</strong> {selectedApplication.opportunity.type}</p>
              </div>
              {selectedApplication.coverLetter && (
                <div className="detail-section">
                  <h4>Сопроводительное письмо</h4>
                  <p>{selectedApplication.coverLetter}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;