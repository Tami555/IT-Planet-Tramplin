import { getBackendUrl, TAG_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


// Получение списка тегов с фильтрацией
export const getTags = async (filters = {}) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const url = `${getBackendUrl(TAG_ENDPOINTS.GET_ALL)}?${params.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};