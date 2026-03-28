import { getBackendUrl, CURATOR_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";
import { check_token } from "../UserService/tokens";


// Получить список работодателей на верификации
export const getPendingVerifications = async (params = {}) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(CURATOR_ENDPOINTS.PENDING_VERIFICATION)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};

// Принять/отклонить верификацию
export const reviewVerification = async (employerId, status, note = '') => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.patch(
      getBackendUrl(CURATOR_ENDPOINTS.REVIEW_VERIFICATION.replace(':id', employerId)),
      { status: status,
        note: note
      }
    );
    return response.data;
  });
};

// Получить возможности на модерации
export const getModerationOpportunities = async (params = {}) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(CURATOR_ENDPOINTS.MODERATION_OPPORTUNITIES)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};

// Промодерировать возможность
export const moderateOpportunity = async (opportunityId, status, moderationNote = '') => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    
    const response = await apiClient.patch(
      getBackendUrl(CURATOR_ENDPOINTS.MODERATE_OPPORTUNITY.replace(':id', opportunityId)),
      { status, moderationNote }
    );
    return response.data;
  });
};