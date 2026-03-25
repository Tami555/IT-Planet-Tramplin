import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


// Получение профиля текущего соискателя
export const getCurrentApplicant = async () => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(APPLICANT_ENDPOINTS.GET_ME);
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Обновить профиль соискателя
export const updateApplicantProfile = async (profileData) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE), profileData);
    return response.data;
  });
};

// Обновить настройки приватности
export const updatePrivacySettings = async (privacyData) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(`${getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE)}/privacy`, privacyData);
    return response.data;
  });
};

// Загрузить аватар
export const uploadAvatar = async (file) => {
  return await apiRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE)}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  });
};

// Загрузить резюме
export const uploadResume = async (file) => {
  return await apiRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE)}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  });
}