import React from 'react';
import { User, GraduationCap, Code, MessageCircle, UserMinus } from 'lucide-react';
import Button from '../UI/Button/Button';
import './ContactCard.css';
import { getMediaData } from "../../utils/files";
import { default_user_ava} from "../../images/index";

const ContactCard = ({ contact, onViewProfile, onRemoveContact, isRemoving }) => {
  return (
    <div className="contact-card">
      <div className="contact-avatar">
        <img 
          src={contact.avatarUrl ? getMediaData(contact.avatarUrl) : default_user_ava} 
          alt={`${contact.firstName} ${contact.lastName}`}
          className="contact-avatar-img"
          onError={(e) => { e.target.src = default_user_ava; }} 
        />
      </div>
      
      <div className="contact-info">
        <h3 className="contact-name">
          {contact.firstName} {contact.lastName}
        </h3>
        
        {/* Контейнер для мета-информации */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {contact.university && (
            <div className="contact-detail">
                <GraduationCap size={12} />
                <span>{contact.university}</span>
            </div>
            )}
            
            {contact.skills && contact.skills.length > 0 && (
            <div className="contact-skills">
                <Code size={14} />
                <div className="skills-list">
                {contact.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-badge">{skill}</span>
                ))}
                {contact.skills.length > 3 && (
                    <span className="skill-badge" title={contact.skills.slice(3).join(', ')}>
                    +{contact.skills.length - 3}
                    </span>
                )}
                </div>
            </div>
            )}
        </div>
      </div>
      
      <div className="contact-actions">
        <Button
          variant="outline"
          size="small"
          onClick={() => onViewProfile(contact.id)}
        >
          Профиль
        </Button>
        
        <Button
          variant="ghost"
          size="icon" 
          onClick={() => onRemoveContact(contact.id)}
          disabled={isRemoving}
          className="text-red-500 hover:text-red-600 hover:bg-red-50" 
          title="Удалить контакт"
        >
          <UserMinus size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ContactCard;