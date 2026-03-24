import React, { useState } from 'react';
import { Globe, Users, Lock } from 'lucide-react';
import Button from '../UI/Button/Button';
import './PrivacySettings.css';

const PrivacySettings = ({ settings, onSave, isLoading }) => {
  const [privacy, setPrivacy] = useState({
    privacyProfile: settings?.privacyProfile || 'PUBLIC',
    privacyResume: settings?.privacyResume || 'CONTACTS',
    privacyResponses: settings?.privacyResponses || 'CONTACTS'
  });

  const handleChange = (field, value) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(privacy);
  };

  const privacyOptions = [
    { value: 'PUBLIC', label: 'Все', icon: Globe, description: 'Видно всем пользователям' },
    { value: 'CONTACTS', label: 'Только контакты', icon: Users, description: 'Видно только вашим контактам' },
    { value: 'PRIVATE', label: 'Только я', icon: Lock, description: 'Видно только вам' }
  ];

  return (
    <div className="privacy-settings">
      <h3 className="privacy-title">Настройки приватности</h3>
      
      <div className="privacy-section">
        <label className="privacy-label">Профиль</label>
        <div className="privacy-options">
          {privacyOptions.map(option => (
            <button
              key={option.value}
              className={`privacy-option ${privacy.privacyProfile === option.value ? 'active' : ''}`}
              onClick={() => handleChange('privacyProfile', option.value)}
            >
              <option.icon size={18} />
              <div className="option-content">
                <span className="option-label">{option.label}</span>
                <span className="option-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="privacy-section">
        <label className="privacy-label">Резюме</label>
        <div className="privacy-options">
          {privacyOptions.map(option => (
            <button
              key={option.value}
              className={`privacy-option ${privacy.privacyResume === option.value ? 'active' : ''}`}
              onClick={() => handleChange('privacyResume', option.value)}
            >
              <option.icon size={18} />
              <div className="option-content">
                <span className="option-label">{option.label}</span>
                <span className="option-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="privacy-section">
        <label className="privacy-label">Отклики</label>
        <div className="privacy-options">
          {privacyOptions.map(option => (
            <button
              key={option.value}
              className={`privacy-option ${privacy.privacyResponses === option.value ? 'active' : ''}`}
              onClick={() => handleChange('privacyResponses', option.value)}
            >
              <option.icon size={18} />
              <div className="option-content">
                <span className="option-label">{option.label}</span>
                <span className="option-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button 
        variant="primary" 
        onClick={handleSave}
        disabled={isLoading}
        className="save-privacy-btn"
      >
        {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
      </Button>
    </div>
  );
};

export default PrivacySettings;