import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../UI/Button/Button';
import './OpportunityCard.css';

const OpportunityCard = ({ 
  opportunity, 
  isFavorite = false,
  onFavoriteToggle,
  variant = 'default' // default, compact, detailed
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Не переходим, если клик был по кнопке избранного
    if (e.target.closest('.favorite-btn')) {
      return;
    }
    navigate(`/opportunity/${opportunity.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle(opportunity);
  };

  const getTypeLabel = (type) => {
    const types = {
      internship: 'Стажировка',
      vacancy: 'Вакансия',
      mentorship: 'Менторство',
      event: 'Мероприятие'
    };
    return types[type] || type;
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'office': return '🏢';
      case 'remote': return '🏠';
      case 'hybrid': return '🔄';
      default: return '📍';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(salary);
  };

  return (
    <div 
      className={`opportunity-card opportunity-card-${variant} ${isFavorite ? 'is-favorite' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="company-info">
          <img 
            src={opportunity.company.logo} 
            alt={opportunity.company.name}
            className="company-logo"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/40x40?text=Company';
            }}
          />
          <div className="company-details">
            <h3 className="company-name">{opportunity.company.name}</h3>
            <span className="opportunity-type">{getTypeLabel(opportunity.type)}</span>
          </div>
        </div>
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="card-body">
        <h4 className="opportunity-title">{opportunity.title}</h4>
        <p className="opportunity-description">{opportunity.description.substring(0, 100)}...</p>
        
        {opportunity.salary && (
          <div className="salary">
            <span className="salary-label">З/п:</span>
            <span className="salary-value">{formatSalary(opportunity.salary)}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="tags">
          {opportunity.tags.slice(0, 3).map(tagId => {
            // В реальном приложении здесь нужно маппиться к тегам из данных
            const tagName = tagId === 1 ? 'Python' : 
                           tagId === 2 ? 'Java' : 
                           tagId === 3 ? 'JS' : 
                           tagId === 4 ? 'React' : 
                           tagId === 5 ? 'SQL' : 'IT';
            return (
              <span key={tagId} className="tag">{tagName}</span>
            );
          })}
          {opportunity.tags.length > 3 && (
            <span className="tag-more">+{opportunity.tags.length - 3}</span>
          )}
        </div>

        <div className="meta-info">
          <span className="format" title={opportunity.format}>
            {getFormatIcon(opportunity.format)} {opportunity.city}
          </span>
          <Button 
            variant="outline" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/opportunity/${opportunity.id}`);
            }}
          >
            Подробнее
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;