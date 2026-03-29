import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import InputBlock from '../UI/InputBlock/InputBlock';
import Button from '../UI/Button/Button';
import './ProfileEditModal.css';

const ProfileEditModal = ({ isOpen, onClose, profileData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    university: '',
    graduationYear: '',
    course: '',
    bio: '',
    skills: [],
    portfolioLinks: []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        middleName: profileData.middleName || '',
        university: profileData.university || '',
        graduationYear: profileData.graduationYear || '',
        course: profileData.course || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        portfolioLinks: profileData.portfolioLinks || []
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddLink = () => {
    if (newLink.trim() && !formData.portfolioLinks.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (link) => {
    setFormData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter(l => l !== link)
    }));
  };

  const handleSubmit = () => {
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || null,
      university: formData.university || null,
      graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
      course: formData.course ? parseInt(formData.course) : null,
      bio: formData.bio || null,
      skills: formData.skills,
      portfolioLinks: formData.portfolioLinks
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать профиль</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <InputBlock
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введите имя"
            />
            <InputBlock
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введите фамилию"
            />
          </div>

          <InputBlock
            label="Отчество"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Введите отчество"
          />

          <InputBlock
            label="Университет"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="Название учебного заведения"
          />

          <div className="form-row">
            <InputBlock
              label="Курс"
              name="course"
              type="number"
              value={formData.course}
              onChange={handleChange}
              placeholder="1-6"
            />
            <InputBlock
              label="Год выпуска"
              name="graduationYear"
              type="number"
              value={formData.graduationYear}
              onChange={handleChange}
              placeholder="2027"
            />
          </div>

          <InputBlock
            label="О себе"
            name="bio"
            type="textarea"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Расскажите о себе, своих интересах и целях"
          />

          {/* Навыки */}
          <div className="section-block">
            <label className="section-label">Навыки</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.skills.map(skill => (
                  <span key={skill} className="tag-item">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-tag">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Добавить навык"
                  className="tag-input"
                />
                <button onClick={handleAddSkill} className="add-btn">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Портфолио */}
          <div className="section-block">
            <label className="section-label">Ссылки на портфолио</label>
            <div className="links-list">
              {formData.portfolioLinks.map((link, index) => (
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
                placeholder="https://github.com/username"
                className="link-input"
              />
              <button onClick={handleAddLink} className="add-btn">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;