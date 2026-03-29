import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";
import { check_token } from "../UserService/tokens";
import axios from "axios";


//  функция поиска соискателей
export const searchApplicants = async (filters = {}) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.skills && filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','));
      }
      if (filters.university) params.append('university', filters.university);
      if (filters.city) params.append('city', filters.city);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const url = `${getBackendUrl(APPLICANT_ENDPOINTS.SEARCH_APPLICANTS)}?${params.toString()}`;
      
      const response = await axios.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Получение профиля текущего соискателя
export const getCurrentApplicant = async () => {
  return await apiRequest(
    async () => {
      await check_token() //обновляем токен
      
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
    await check_token() //обновляем токен
    const response = await apiClient.patch(getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE), profileData);
    return response.data;
  });
};

// Обновить настройки приватности
export const updatePrivacySettings = async (privacyData) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    const response = await apiClient.patch(`${getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE)}/privacy`, privacyData);
    return response.data;
  });
};

// Загрузить аватар
export const uploadAvatar = async (file) => {
  return await apiRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    await check_token() //обновляем токен
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
    await check_token() //обновляем токен
    const response = await apiClient.post(`${getBackendUrl(APPLICANT_ENDPOINTS.UPDATE_PROFILE)}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  });
}