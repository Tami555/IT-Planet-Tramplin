import { getBackendUrl, EMPLOYER_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";
import { check_token } from "../UserService/tokens";


// Получить мои возможности
export const getMyOpportunities = async (params = {}) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(EMPLOYER_ENDPOINTS.MY_OPPORTUNITIES)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};