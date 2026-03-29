import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";
import { check_token } from "../UserService/tokens";


// Получение откликов текущего пользователя
export const getUserApplications = async (page = 1, limit = 20) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      const url = `${getBackendUrl(APPLICANT_ENDPOINTS.GET_APPLICATIONS)}?${params.toString()}`;
      await check_token() //обновляем токен
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
      const url = getBackendUrl(APPLICANT_ENDPOINTS.APPLY);
      await check_token() //обновляем токен
      const response = await apiClient.post(url, {
        opportunityId: opportunityId,
        coverLetter: coverLetter
    });
      return response.data;
    },
    handleApiError
  );
};


// Отозвать отклик на возможность
export const revokeOpportunity = async (applicationId) => {
  return await apiRequest(
    async () => {
      await check_token() //обновляем токен
      const url = getBackendUrl(APPLICANT_ENDPOINTS.DELETE_APPLY.replace(':id', applicationId));
      const response = await apiClient.delete(url);
      return response.data;
    },
    handleApiError
  );
};