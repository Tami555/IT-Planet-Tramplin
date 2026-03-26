import { getBackendUrl, CURATOR_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";


// Получить список пользователей
export const getUsers = async (params = {}) => {
  return await apiRequest(async () => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(CURATOR_ENDPOINTS.USERS)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};

// Получить детальную информацию о пользователе
export const getUserDetails = async (userId) => {
  return await apiRequest(async () => {
    const response = await apiClient.get(getBackendUrl(CURATOR_ENDPOINTS.USER_DETAILS.replace(':id', userId)));
    return response.data;
  });
};

// Заблокировать/активировать пользователя
export const updateUserStatus = async (userId, isActive) => {
  return await apiRequest(async () => {
    const response = await apiClient.patch(
      getBackendUrl(CURATOR_ENDPOINTS.USER_STATUS.replace(':id', userId)),
      { isActive }
    );
    return response.data;
  });
};