import { getBackendUrl, OPPORTUNITY_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


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
      const response = await apiClient.get(url);
      
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
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Отклик на возможность
export const applyToOpportunity = async (opportunityId, coverLetter = '') => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(OPPORTUNITY_ENDPOINTS.APPLY);
      const response = await apiClient.post(url, {
        opportunityId: opportunityId,
        coverLetter: coverLetter
    });
      return response.data;
    },
    handleApiError
  );
};

// Добавить в избранное
export const addToFavorites = async (opportunityId) => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(OPPORTUNITY_ENDPOINTS.FAVORITE);
      const response = await apiClient.post(url, {opportunityId : opportunityId});
      return response.data;
    },
    handleApiError
  );
};

// Удалить из избранного
export const removeFromFavorites = async (opportunityId) => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(OPPORTUNITY_ENDPOINTS.DELETE_FAVORITE.replace(':id', opportunityId));
      const response = await apiClient.delete(url);
      return response.data;
    },
    handleApiError
  );
};