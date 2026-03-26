import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../UI/Button/Button';
import './OpportunityCard.css';
import { useAuth } from '../../contexts/AuthContext';
import { default_company_ava } from "../../images/index"


const OpportunityCard = ({ 
  opportunity, 
  isFavorite = false,
  onFavoriteToggle,
  variant = 'default', // default, compact, detailed
}) => {
  const navigate = useNavigate();
  const { IsApplicant, IsAuth } = useAuth();
  const handleCardClick = (e) => {
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
      INTERNSHIP: 'Стажировка',
      VACANCY_JUNIOR: 'Вакансия',
      MENTORSHIP: 'Менторство',
      CAREER_EVENT: 'Мероприятие'
    };
    return types[type] || type;
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'OFFICE': return '🏢';
      case 'REMOTE': return '🏠';
      case 'HYBRID': return '🔄';
      default: return '📍';
    }
  };

  const formatSalary = (salaryFrom, salaryTo) => {
    if (!salaryFrom && !salaryTo) return 'Не указана';
    if (salaryFrom && salaryTo) return `${salaryFrom.toLocaleString()} - ${salaryTo.toLocaleString()} ₽`;
    if (salaryFrom) return `от ${salaryFrom.toLocaleString()} ₽`;
    if (salaryTo) return `до ${salaryTo.toLocaleString()} ₽`;
    return 'Не указана';
  };

  return (
    <div 
      className={`opportunity-card opportunity-card-${variant} ${isFavorite ? 'is-favorite' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="company-info">
          <img 
            src={opportunity.company?.logo || opportunity.employer?.logoUrl || default_company_ava} 
            alt={opportunity.company?.name || opportunity.employer?.companyName}
            className="company-logo"
            onError={(e) => {
              e.target.src = default_company_ava;
            }}
          />
          <div className="company-details">
            <h3 className="company-name">{opportunity.company?.name || opportunity.employer?.companyName}</h3>
            <span className="opportunity-type">{getTypeLabel(opportunity.type)}</span>
          </div>
        </div>
        {
          (IsApplicant == true || IsAuth == false) && 
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        }
      </div>

      <div className="card-body">
        <h4 className="opportunity-title">{opportunity.title}</h4>
        <p className="opportunity-description">{opportunity.description?.substring(0, 100)}...</p>
        
        {(opportunity.salaryFrom || opportunity.salaryTo) && (
          <div className="salary">
            <span className="salary-label">З/п:</span>
            <span className="salary-value">
              {formatSalary(opportunity.salaryFrom, opportunity.salaryTo)}
            </span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="tags">
          {opportunity.tags?.slice(0, 3).map(tag => {
            return (
              <span key={tag.tag.id} className="tag">{tag.tag.name}</span>
            );
          })}
          {opportunity.tags?.length > 3 && (
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