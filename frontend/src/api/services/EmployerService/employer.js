import { getBackendUrl, EMPLOYER_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";
import axios from "axios";
import { handleApiError } from "../../utils/errors/errorHandlers";


// Получение списка компаний с фильтрацией
export const getEmployers = async (filters = {}) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.city) params.append('city', filters.city);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const url = `${getBackendUrl(EMPLOYER_ENDPOINTS.GET_ALL)}?${params.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Получить профиль текущего работодателя
export const getCurrentEmployer = async () => {
  return await apiRequest(async () => {
    const response = await apiClient.get(getBackendUrl(EMPLOYER_ENDPOINTS.GET_ME));
    return response.data;
  });
};


// Получить профиль работодателя по ID
export const getEmployerById = async (EmployerId) => {
  return await apiRequest(async () => {
    const url = getBackendUrl(EMPLOYER_ENDPOINTS.GET_PUBLIC_PROFILE.replace(':id', EmployerId))
    const response = await axios.get(url);
    return response.data;
  });
};

// Обновить профиль работодателя
export const updateEmployerProfile = async (profileData) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(getBackendUrl(EMPLOYER_ENDPOINTS.UPDATE_PROFILE), profileData);
    return response.data;
  });
};

// Загрузить логотип
export const uploadEmployerLogo = async (file) => {
  return await apiRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(getBackendUrl(EMPLOYER_ENDPOINTS.UPLOAD_LOGO), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  });
};

// Загрузить фото офиса
export const uploadOfficePhotos = async (files) => {
  return await apiRequest(async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const response = await apiClient.post(getBackendUrl(EMPLOYER_ENDPOINTS.UPLOAD_PHOTOS), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  });
};

// Подать заявку на верификацию
export const submitVerification = async () => {
  return await apiRequest(async () => {
    const response = await apiClient.post(getBackendUrl(EMPLOYER_ENDPOINTS.VERIFICATION));
    return response.data;
  });
};
