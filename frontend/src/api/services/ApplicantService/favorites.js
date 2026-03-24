import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


// Получение избранных текущего пользователя
export const getUserFavorites = async (page = 1, limit = 20) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      const url = `${getBackendUrl(APPLICANT_ENDPOINTS.FAVORITE)}?${params.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Добавить в избранное
export const addToFavorites = async (opportunityId) => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(APPLICANT_ENDPOINTS.FAVORITE);
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
      const url = getBackendUrl(APPLICANT_ENDPOINTS.DELETE_FAVORITE.replace(':id', opportunityId));
      const response = await apiClient.delete(url);
      return response.data;
    },
    handleApiError
  );
};