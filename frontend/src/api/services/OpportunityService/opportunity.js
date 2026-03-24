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