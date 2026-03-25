import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Inbox, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ContactCard from '../../components/ContactCard/ContactCard';
import FriendRequestCard from '../../components/FriendRequestCard/FriendRequestCard';
import UserSearch from '../../components/UserSearch/UserSearch';
import Button from '../../components/UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import {
  getContacts,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteContact
} from '../../api/services/ApplicantService/contacts';
import './ContactsPage.css';

const ContactsPage = () => {
  const navigate = useNavigate();
  const { IsApplicant } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts'); // contacts, requests, search
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Загрузка контактов
  const [fetchContacts, loadingContacts, contactsError] = useFetch(async () => {
    const data = await getContacts();
    setContacts(data);
  });

  // Загрузка запросов
  const [fetchRequests, loadingRequests, requestsError] = useFetch(async () => {
    const data = await getFriendRequests();
    setRequests(data);
  });

  // Отправка запроса в друзья
  const [sendRequest, sendingRequest] = useFetch(async (receiverId) => {
    await sendFriendRequest(receiverId);
    alert('Запрос в друзья отправлен!');
    // Очищаем поиск
    setSearchResults(null);
  });

  // Принять запрос
  const [acceptRequest, acceptingRequest] = useFetch(async (contactId) => {
    await acceptFriendRequest(contactId);
    // Обновляем списки
    await fetchRequests();
    await fetchContacts();
  });

  // Отклонить запрос
  const [rejectRequest, rejectingRequest] = useFetch(async (contactId) => {
    await rejectFriendRequest(contactId);
    await fetchRequests();
  });

  // Удалить контакт
  const [removeContact, removingContact] = useFetch(async (contactId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контакт?')) {
      await deleteContact(contactId);
      await fetchContacts();
    }
  });

  // Поиск пользователей (заглушка, т.к. нет эндпоинта для поиска)
  const handleSearch = (query) => {
    // TODO: добавить эндпоинт для поиска пользователей
    // Пока показываем заглушку
    alert('Функция поиска будет доступна в ближайшее время');
  };

  useEffect(() => {
    if (IsApplicant) {
      fetchContacts();
      fetchRequests();
    }
  }, [IsApplicant]);

  const handleViewProfile = (contactId) => {
    navigate(`/applicant/${contactId}`);
  };

  const handleSendRequest = (receiverId) => {
    sendRequest(receiverId);
  };

  if (!IsApplicant) {
    return (
      <div className="contacts-page">
        <Header />
        <div className="contacts-container container">
          <div className="not-applicant">
            <Users size={64} />
            <h2>Доступ ограничен</h2>
            <p>Этот раздел доступен только соискателям</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <Header />
      
      <div className="contacts-container container">
        {/* Навигация */}
        <div className="contacts-nav">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
            <span>Вернуться в профиль</span>
          </button>
        </div>

        {/* Заголовок */}
        <div className="contacts-header">
          <Users size={32} className="header-icon" />
          <h1 className="contacts-title">Мои контакты</h1>
          <p className="contacts-subtitle">
            Общайтесь с единомышленниками, делитесь опытом и находите новые возможности
          </p>
        </div>

        {/* Табы */}
        <div className="contacts-tabs">
          <button
            className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={18} />
            <span>Мои контакты</span>
            {contacts.length > 0 && <span className="tab-count">{contacts.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Inbox size={18} />
            <span>Запросы</span>
            {requests.length > 0 && <span className="tab-count">{requests.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <UserPlus size={18} />
            <span>Найти друзей</span>
          </button>
        </div>

        {/* Контент */}
        <div className="contacts-content">
          {/* Мои контакты */}
          {activeTab === 'contacts' && (
            <>
              {loadingContacts ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Загрузка контактов...</p>
                </div>
              ) : contactsError ? (
                <div className="error-state">
                  <p>{contactsError}</p>
                  <Button variant="primary" onClick={fetchContacts}>
                    Попробовать снова
                  </Button>
                </div>
              ) : contacts.length > 0 ? (
                <div className="contacts-grid">
                  {contacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onViewProfile={handleViewProfile}
                      onRemoveContact={removeContact}
                      isRemoving={removingContact}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={64} className="empty-icon" />
                  <h3>У вас пока нет контактов</h3>
                  <p>Найдите друзей через поиск или примите входящие заявки</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setActiveTab('search')}
                  >
                    Найти друзей
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Запросы в друзья */}
          {activeTab === 'requests' && (
            <>
              {loadingRequests ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Загрузка запросов...</p>
                </div>
              ) : requestsError ? (
                <div className="error-state">
                  <p>{requestsError}</p>
                  <Button variant="primary" onClick={fetchRequests}>
                    Попробовать снова
                  </Button>
                </div>
              ) : requests.length > 0 ? (
                <div className="requests-list">
                  {requests.map(request => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      onAccept={acceptRequest}
                      onReject={rejectRequest}
                      isProcessing={acceptingRequest || rejectingRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Inbox size={64} className="empty-icon" />
                  <h3>Нет входящих заявок</h3>
                  <p>Когда кто-то отправит вам заявку в друзья, она появится здесь</p>
                </div>
              )}
            </>
          )}

          {/* Поиск друзей */}
          {activeTab === 'search' && (
            <UserSearch
              onSearch={handleSearch}
              onSendRequest={handleSendRequest}
              isLoading={false}
              isSending={sendingRequest}
              searchResults={searchResults}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactsPage;