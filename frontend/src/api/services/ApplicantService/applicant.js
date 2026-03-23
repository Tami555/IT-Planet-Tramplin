import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


// Получение откликов текущего пользователя
export const getUserApplications = async (page = 1, limit = 20) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      const url = `${getBackendUrl(APPLICANT_ENDPOINTS.GET_APPLICATIONS)}?${params.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    handleApiError
  );
};

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