import { getBackendUrl } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";


// Получить список друзей (контактов)
export const getContacts = async () => {
  return await apiRequest(async () => {
    const response = await apiClient.get('/applicants/me/contacts');
    return response.data;
  });
};

// Отправить запрос в друзья
export const sendFriendRequest = async (receiverId) => {
  return await apiRequest(async () => {
    const response = await apiClient.post('/applicants/me/contacts', {
      receiverId: receiverId
    });
    return response.data;
  });
};

// Получить входящие запросы в друзья
export const getFriendRequests = async () => {
  return await apiRequest(async () => {
    const response = await apiClient.get('/applicants/me/contacts/requests');
    return response.data;
  });
};

// Принять входящий запрос в друзья
export const acceptFriendRequest = async (contactId) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(`/applicants/me/contacts/${contactId}/accept`);
    return response.data;
  });
};

// Отклонить входящий запрос в друзья
export const rejectFriendRequest = async (contactId) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(`/applicants/me/contacts/${contactId}/reject`);
    return response.data;
  });
};

// Удалить контакт
export const deleteContact = async (contactId) => {
  return await apiRequest(async () => {
    const response = await apiClient.delete(`/applicants/me/contacts/${contactId}`);
    return response.data;
  });
};

// Получить профиль соискателя по ID
export const getApplicantById = async (applicantId) => {
  return await apiRequest(async () => {
    const response = await apiClient.get(`/applicants/${applicantId}`);
    return response.data;
  });
};