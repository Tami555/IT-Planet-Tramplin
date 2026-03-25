import { getBackendUrl, EMPLOYER_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";


// Получить мои возможности
export const getMyOpportunities = async (params = {}) => {
  return await apiRequest(async () => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(EMPLOYER_ENDPOINTS.MY_OPPORTUNITIES)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};