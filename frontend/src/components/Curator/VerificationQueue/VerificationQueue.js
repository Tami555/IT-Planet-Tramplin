import React, { useState } from 'react';
import { Check, X, Eye, Building2, Mail, MapPin, Globe } from 'lucide-react';
import Button from '../../UI/Button/Button';
import './VerificationQueue.css';
import { useNavigate } from 'react-router-dom';
import {getMediaData } from "../../../utils/files";

const VerificationQueue = ({ items, onReview, loading }) => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [statusModerate, setStatusModerate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleReview = (item, status) => {
    setSelectedItem(item);
    setStatusModerate(status);
    setReviewNote('');
    setShowModal(true);
  };

  const submitReview = () => {
    if (selectedItem) {
      onReview(selectedItem.id, statusModerate, reviewNote);
      setShowModal(false);
      setSelectedItem(null);
      setReviewNote('');
    }
  };

  if (loading) {
    return <div className="verification-loading">Загрузка...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="verification-empty">
        <Check size={48} />
        <p>Нет компаний, ожидающих верификации</p>
      </div>
    );
  }

  return (
    <div className="verification-queue">
      <div className="verification-grid">
        {items.map(item => (
          <div key={item.id} className="verification-card">
            <div className="card-header-verif">
              <div className="company-info-verif">
                <div className="company-logo-small">
                  {item.logoUrl ? (
                    <img src={getMediaData(item.logoUrl)} alt={item.companyName} />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div>
                  <h4>{item.companyName}</h4>
                  <div className="company-email">{item.user?.email}</div>
                </div>
              </div>
            </div>
            
            <div className="card-body-verif">
              <div className="detail-row">
                <Mail size={14} />
                <span>{item.corporateEmail || 'Корпоративная почта не указана'}</span>
              </div>
              <div className="detail-row">
                <MapPin size={14} />
                <span>{item.city || 'Город не указан'}</span>
              </div>
              {item.websiteUrl && (
                <div className="detail-row">
                  <Globe size={14} />
                  <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {item.websiteUrl}
                  </a>
                </div>
              )}
              {item.inn && (
                <div className="detail-row">
                  <span className="detail-label">ИНН:</span>
                  <span>{item.inn}</span>
                </div>
              )}
            </div>
            
            <div className="card-footer-verif">
              <button
                className="view-details"
                onClick={() => navigate(`/employer/${item.userId}`)}
              >
                <Eye size={16} />
                Подробнее
              </button>
              <div className="action-buttons-verif">
                <button
                  className="accept-btn"
                  onClick={() => onReview(item.id, 'VERIFIED', '')}
                >
                  <Check size={16} />
                  Принять
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReview(item, 'REJECTED')}
                >
                  <X size={16} />
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для отклонения */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Отклонить верификацию</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Компания:</strong> {selectedItem.companyName}</p>
              <div className="form-group">
                <label>Причина отклонения</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Укажите причину отклонения верификации..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Отмена
              </Button>
              <Button variant="primary" onClick={submitReview}>
                Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;