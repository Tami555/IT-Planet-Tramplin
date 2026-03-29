import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import InputBlock from '../UI/InputBlock/InputBlock';
import Button from '../UI/Button/Button';
import { getTags } from '../../api/services';
import { supportedCities, cityCoordinates } from '../../data/mockData';
import './OpportunityFormModal.css';

const OpportunityFormModal = ({ isOpen, onClose, onSave, opportunity = null, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    format: 'OFFICE',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
    salaryFrom: '',
    salaryTo: '',
    currency: 'RUB',
    expiresAt: '',
    eventDate: '',
    contactEmail: '',
    contactPhone: '',
    contactLinks: [],
    tagIds: []
  });
  
  const [tags, setTags] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  
  // Состояние для ручного ввода координат (если нужно)
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: '',
    longitude: ''
  });

  const opportunityTypes = [
    { value: 'INTERNSHIP', label: 'Стажировка' },
    { value: 'VACANCY_JUNIOR', label: 'Вакансия (Junior+)' },
    { value: 'MENTORSHIP', label: 'Менторская программа' },
    { value: 'CAREER_EVENT', label: 'Карьерное мероприятие' }
  ];

  const workFormats = [
    { value: 'OFFICE', label: 'Офис' },
    { value: 'HYBRID', label: 'Гибрид' },
    { value: 'REMOTE', label: 'Удалённо' }
  ];

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        type: opportunity.type || 'INTERNSHIP',
        format: opportunity.format || 'OFFICE',
        address: opportunity.address || '',
        city: opportunity.city || '',
        latitude: opportunity.latitude || null,
        longitude: opportunity.longitude || null,
        salaryFrom: opportunity.salaryFrom || '',
        salaryTo: opportunity.salaryTo || '',
        currency: opportunity.currency || 'RUB',
        expiresAt: opportunity.expiresAt ? opportunity.expiresAt.split('T')[0] : '',
        eventDate: opportunity.eventDate ? opportunity.eventDate.split('T')[0] : '',
        contactEmail: opportunity.contactEmail || '',
        contactPhone: opportunity.contactPhone || '',
        contactLinks: opportunity.contactLinks || [],
        tagIds: opportunity.tags?.map(t => t.tagId) || []
      });
      setSelectedTags(opportunity.tags?.map(t => t.tagId) || []);
      
      // Инициализируем ручные координаты
      setManualCoordinates({
        latitude: opportunity.latitude || '',
        longitude: opportunity.longitude || ''
      });
    }
  }, [opportunity]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoadingTags(true);
    try {
      const data = await getTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Функция для обновления координат в зависимости от формата
  const updateCoordinatesForFormat = (format, city) => {
    // Если формат REMOTE - ставим координаты города
    if (format === 'REMOTE' && city && cityCoordinates[city]) {
      const coords = cityCoordinates[city];
      setFormData(prev => ({
        ...prev,
        latitude: coords[0],
        longitude: coords[1]
      }));
      setManualCoordinates({
        latitude: coords[0],
        longitude: coords[1]
      });
    }
    // Если формат OFFICE или HYBRID - оставляем текущие координаты (могут быть null или ручные)
    // Не делаем ничего
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Обработка изменения формата работы
    if (name === 'format') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Если новый формат REMOTE, обновляем координаты на координаты города
      if (value === 'REMOTE' && formData.city && cityCoordinates[formData.city]) {
        const coords = cityCoordinates[formData.city];
        setFormData(prev => ({
          ...prev,
          latitude: coords[0],
          longitude: coords[1]
        }));
        setManualCoordinates({
          latitude: coords[0],
          longitude: coords[1]
        });
      }
      // Если формат OFFICE или HYBRID, но координаты не заданы - можно оставить пустыми
      return;
    }
    
    // Обработка изменения города
    if (name === 'city') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Если формат REMOTE - обновляем координаты
      if (formData.format === 'REMOTE' && value && cityCoordinates[value]) {
        const coords = cityCoordinates[value];
        setFormData(prev => ({
          ...prev,
          latitude: coords[0],
          longitude: coords[1]
        }));
        setManualCoordinates({
          latitude: coords[0],
          longitude: coords[1]
        });
      }
      return;
    }
    
    // Обычное изменение поля
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик ручного ввода координат
  const handleCoordinateChange = (type, value) => {
    const numValue = value ? parseFloat(value) : null;
    
    setManualCoordinates(prev => ({
      ...prev,
      [type]: value
    }));
    
    setFormData(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const handleAddLink = () => {
    if (newLink.trim() && !formData.contactLinks.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        contactLinks: [...prev.contactLinks, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (link) => {
    setFormData(prev => ({
      ...prev,
      contactLinks: prev.contactLinks.filter(l => l !== link)
    }));
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      setFormData(prevData => ({ ...prevData, tagIds: newTags }));
      return newTags;
    });
  };

  const handleSubmit = () => {
    const submitData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      format: formData.format,
      address: formData.address,
      city: formData.city,
      latitude: formData.latitude,
      longitude: formData.longitude,
      salaryFrom: formData.salaryFrom ? parseInt(formData.salaryFrom) : null,
      salaryTo: formData.salaryTo ? parseInt(formData.salaryTo) : null,
      currency: formData.currency,
      expiresAt: formData.expiresAt || null,
      eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactLinks: formData.contactLinks,
      tagIds: formData.tagIds
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  // Проверяем, нужно ли показывать поля для координат
  const showCoordinates = formData.format === 'OFFICE' || formData.format === 'HYBRID';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container opportunity-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{opportunity ? 'Редактировать' : 'Создать'} возможность</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <InputBlock
            label="Название"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите название"
            required
          />

          <InputBlock
            label="Описание"
            name="description"
            type="textarea"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Опишите вакансию, требования, обязанности..."
            required
          />

          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Тип</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="select-field"
              >
                {opportunityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Формат работы</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="select-field"
              >
                {workFormats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Поля для адреса и координат показываем только для OFFICE и HYBRID */}
          {showCoordinates && (
            <>
              <InputBlock
                label="Адрес"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Улица, дом"
              />
              
              <div className="form-row">
                <InputBlock
                  label="Широта (latitude)"
                  name="latitude"
                  type="number"
                  step="any"
                  value={manualCoordinates.latitude}
                  onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                  placeholder="55.7558"
                />
                <InputBlock
                  label="Долгота (longitude)"
                  name="longitude"
                  type="number"
                  step="any"
                  value={manualCoordinates.longitude}
                  onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                  placeholder="37.6176"
                />
              </div>
              
              <div className="form-hint">
                <small>Укажите координаты для точного отображения на карте</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="input-label">Город</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="">Выберите город</option>
              {supportedCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Для REMOTE показываем подсказку о координатах */}
          {formData.format === 'REMOTE' && formData.city && (
            <div className="info-message">
              <small>
                📍 Для удалённой работы будут использованы координаты города {formData.city}
              </small>
            </div>
          )}

          <div className="form-row">
            <InputBlock
              label="Зарплата от"
              name="salaryFrom"
              type="number"
              value={formData.salaryFrom}
              onChange={handleChange}
              placeholder="0"
            />
            <InputBlock
              label="Зарплата до"
              name="salaryTo"
              type="number"
              value={formData.salaryTo}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-row">
            <InputBlock
              label="Срок действия (до)"
              name="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
            />
            <InputBlock
              label="Дата мероприятия (если есть)"
              name="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <InputBlock
              label="Контактный email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="hr@company.ru"
            />
            <InputBlock
              label="Контактный телефон"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="section-block">
            <label className="section-label">Ссылки (HH.ru, сайт и т.д.)</label>
            <div className="links-list">
              {formData.contactLinks.map((link, index) => (
                <div key={index} className="link-item">
                  <span>{link}</span>
                  <button onClick={() => handleRemoveLink(link)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-link">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                placeholder="https://hh.ru/vacancy/123"
                className="link-input"
              />
              <button onClick={handleAddLink} className="add-btn">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="section-block">
            <label className="section-label">Теги (навыки)</label>
            {loadingTags ? (
              <p>Загрузка тегов...</p>
            ) : (
              <div className="tags-grid">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`tag-chip ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : (opportunity ? 'Сохранить' : 'Создать')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityFormModal;