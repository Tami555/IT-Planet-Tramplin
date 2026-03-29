import React from 'react';
import { Users, Building2, Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Пользователи',
      icon: Users,
      value: stats?.users?.total || 0,
      color: '#18A3B7',
      details: [
        { label: 'Соискатели', value: stats?.users?.applicants || 0 },
        { label: 'Работодатели', value: stats?.users?.employers || 0 }
      ]
    },
    {
      title: 'Верификация',
      icon: CheckCircle,
      value: stats?.verification?.verified || 0,
      color: '#4caf50',
      details: [
        { label: 'Верифицированы', value: stats?.verification?.verified || 0 },
        { label: 'Ожидают', value: stats?.verification?.pending || 0 }
      ]
    },
    {
      title: 'Возможности',
      icon: Briefcase,
      value: stats?.opportunities?.total || 0,
      color: '#ff9800',
      details: [
        { label: 'Активные', value: stats?.opportunities?.active || 0 },
        { label: 'На модерации', value: stats?.opportunities?.pendingModeration || 0 }
      ]
    },
    {
      title: 'Отклики',
      icon: FileText,
      value: stats?.applications?.total || 0,
      color: '#9c27b0',
      details: []
    }
  ];

  return (
    <div className="stats-cards-grid">
      {cards.map((card, index) => (
        <div key={index} className="stat-card-curator">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              <card.icon size={24} />
            </div>
            <h3 className="stat-title">{card.title}</h3>
          </div>
          <div className="stat-value">{card.value.toLocaleString()}</div>
          {card.details.length > 0 && (
            <div className="stat-details">
              {card.details.map((detail, idx) => (
                <div key={idx} className="stat-detail">
                  <span className="detail-label">{detail.label}</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;