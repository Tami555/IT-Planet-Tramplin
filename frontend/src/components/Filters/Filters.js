import React, { useState } from 'react';
import { Sliders, X, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../UI/Button/Button';
import './Filters.css';

const Filters = ({ 
  onFilterChange,
  skills = [],
  initialFilters = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [workFormat, setWorkFormat] = useState([]);
  const [opportunityType, setOpportunityType] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const workFormats = [
    { id: 'office', label: 'Офис', icon: '🏢' },
    { id: 'remote', label: 'Удаленно', icon: '🏠' },
    { id: 'hybrid', label: 'Гибрид', icon: '🔄' }
  ];

  const opportunityTypes = [
    { id: 'internship', label: 'Стажировка', color: '#18A3B7' },
    { id: 'vacancy', label: 'Вакансия', color: '#5AA5CD' },
    { id: 'mentorship', label: 'Менторство', color: '#6F71A1' },
    { id: 'event', label: 'Мероприятие', color: '#27E6EC' }
  ];

  const cities = [
    'Москва',
    'Санкт-Петербург',
    'Казань',
    'Новосибирск',
    'Екатеринбург',
    'Нижний Новгород'
  ];

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      return newSkills;
    });
  };

  const handleFormatToggle = (formatId) => {
    setWorkFormat(prev => {
      const newFormats = prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId];
      return newFormats;
    });
  };

  const handleTypeToggle = (typeId) => {
    setOpportunityType(prev => {
      const newTypes = prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId];
      return newTypes;
    });
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const applyFilters = () => {
    const filters = {
      skills: selectedSkills,
      salary: salaryRange,
      format: workFormat,
      type: opportunityType,
      city: selectedCity
    };
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedSkills([]);
    setSalaryRange({ min: '', max: '' });
    setWorkFormat([]);
    setOpportunityType([]);
    setSelectedCity('');
    onFilterChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedSkills.length) count += selectedSkills.length;
    if (salaryRange.min || salaryRange.max) count += 1;
    if (workFormat.length) count += workFormat.length;
    if (opportunityType.length) count += opportunityType.length;
    if (selectedCity) count += 1;
    return count;
  };

  return (
    <div className={`filters-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="filters-header">
        <div className="filters-title">
          <Sliders size={20} />
          <span>Фильтры</span>
          {getActiveFiltersCount() > 0 && (
            <span className="filters-count">{getActiveFiltersCount()}</span>
          )}
        </div>
        <div className="filters-actions">
          {getActiveFiltersCount() > 0 && (
            <Button 
              variant="ghost" 
              size="small" 
              onClick={resetFilters}
              className="reset-filters-btn"
            >
              Сбросить
            </Button>
          )}
          <button 
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Город */}
          <div className="filter-section">
            <h4 className="filter-section-title">Город</h4>
            <select 
              className="city-select"
              value={selectedCity}
              onChange={handleCityChange}
            >
              <option value="">Все города</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Тип возможности */}
          <div className="filter-section">
            <h4 className="filter-section-title">Тип</h4>
            <div className="filter-options-grid">
              {opportunityTypes.map(type => (
                <button
                  key={type.id}
                  className={`filter-chip ${opportunityType.includes(type.id) ? 'active' : ''}`}
                  onClick={() => handleTypeToggle(type.id)}
                  style={{ '--chip-color': type.color }}
                >
                  <span className="chip-dot" style={{ backgroundColor: type.color }}></span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Формат работы */}
          <div className="filter-section">
            <h4 className="filter-section-title">Формат работы</h4>
            <div className="filter-options">
              {workFormats.map(format => (
                <button
                  key={format.id}
                  className={`filter-chip ${workFormat.includes(format.id) ? 'active' : ''}`}
                  onClick={() => handleFormatToggle(format.id)}
                >
                  <span>{format.icon}</span>
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Зарплата */}
          <div className="filter-section">
            <h4 className="filter-section-title">Зарплата</h4>
            <div className="salary-range">
              <div className="salary-input">
                <label>От</label>
                <input
                  type="number"
                  name="min"
                  value={salaryRange.min}
                  onChange={handleSalaryChange}
                  placeholder="0 ₽"
                  min="0"
                />
              </div>
              <div className="salary-input">
                <label>До</label>
                <input
                  type="number"
                  name="max"
                  value={salaryRange.max}
                  onChange={handleSalaryChange}
                  placeholder="∞"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Навыки */}
          <div className="filter-section">
            <h4 className="filter-section-title">Навыки</h4>
            <div className="skills-grid">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  className={`skill-chip ${selectedSkills.includes(skill.id) ? 'active' : ''}`}
                  onClick={() => handleSkillToggle(skill.id)}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка применения */}
          <div className="filter-apply">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={applyFilters}
            >
              Применить фильтры
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;