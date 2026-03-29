import React from 'react';
import { User, GraduationCap, Check, X } from 'lucide-react';
import Button from '../UI/Button/Button';
import './FriendRequestCard.css';
import { default_user_ava } from '../../images';
import { getMediaData } from '../../utils/files';
import { useNavigate } from 'react-router-dom';

const FriendRequestCard = ({ request, onAccept, onReject, isProcessing }) => {
  const nav = useNavigate()
  return (
    <div className="friend-request-card">
      <div className="request-avatar">
        <img 
          src={request?.sender?.avatarUrl ? getMediaData(request?.sender?.avatarUrl) : default_user_ava} 
          alt={`${request.firstName} ${request.lastName}`}
          className="request-avatar-img"
        />
      </div>
      
      <div className="request-info">
        <h4 className="request-name">
          {request.sender.firstName} {request.sender.lastName}
        </h4>
        {request.university && (
          <div className="request-university">
            <GraduationCap size={12} />
            <span>{request.sender.university}</span>
          </div>
        )}
      </div>
      
      <div className="request-actions">
        <Button
          variant="primary"
          size="small"
          onClick={() => onAccept(request.id)}
          disabled={isProcessing}
          icon={<Check size={16} />}
        >
          Принять
        </Button>
        <Button
          variant="ghost"
          size="small"
          onClick={() => onReject(request.id)}
          disabled={isProcessing}
          icon={<X size={16} />}
        >
          Отклонить
        </Button>

        <Button
          variant="ghost"
          size="small"
          onClick={() => nav(`/applicant/${request.senderId}`)}
          disabled={isProcessing}
          icon={<User size={16} />}
        >
          Профиль
        </Button>

      </div>
    </div>
  );
};

export default FriendRequestCard;