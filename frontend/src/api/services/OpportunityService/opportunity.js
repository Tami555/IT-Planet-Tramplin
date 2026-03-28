import { getBackendUrl, OPPORTUNITY_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";
import axios from "axios";
import { check_token } from "../UserService/tokens";


// Получение списка возможностей с фильтрацией
export const getOpportunities = async (filters = {}) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.format) params.append('format', filters.format);
      if (filters.search) params.append('search', filters.search);
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
      if (filters.city) params.append('city', filters.city);
      if (filters.tagIds && filters.tagIds.length > 0) {
        filters.tagIds.forEach(tagId => params.append('tagIds', tagId));
        params.append('tagIds', " ")
      }
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const url = `${getBackendUrl(OPPORTUNITY_ENDPOINTS.GET_ALL)}?${params.toString()}`;
      const response = await axios.get(url);
      
      return response.data;
    },
    handleApiError
  );
};

// Получение одной возможности по ID
export const getOpportunityById = async (id) => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(OPPORTUNITY_ENDPOINTS.GET_BY_ID.replace(':id', id));
      const response = await axios.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Создать возможность
export const createOpportunity = async (opportunityData) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.post(getBackendUrl(OPPORTUNITY_ENDPOINTS.CREATE), opportunityData);
    return response.data;
  });
};

// Обновить возможность
export const updateOpportunity = async (id, opportunityData) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.patch(
      getBackendUrl(OPPORTUNITY_ENDPOINTS.UPDATE.replace(':id', id)),
      opportunityData
    );
    return response.data;
  });
};

// Удалить возможность
export const deleteOpportunity = async (id) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.delete(getBackendUrl(OPPORTUNITY_ENDPOINTS.DELETE.replace(':id', id)));
    return response.data;
  });
};

// Загрузить медиа для возможности
export const uploadOpportunityMedia = async (opportunityId, files) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const response = await apiClient.post(
      `${getBackendUrl(OPPORTUNITY_ENDPOINTS.UPLOAD_MEDIA.replace(':id', opportunityId))}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  });
};