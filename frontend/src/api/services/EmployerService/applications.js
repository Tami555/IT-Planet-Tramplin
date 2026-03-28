import { getBackendUrl, EMPLOYER_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";
import { check_token } from "../UserService/tokens";


// Получить отклики на мои вакансии
export const getMyApplications = async (params = {}) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const queryParams = new URLSearchParams();
    if (params.opportunityId) queryParams.append('opportunityId', params.opportunityId);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${getBackendUrl(EMPLOYER_ENDPOINTS.MY_APPLICATIONS)}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  });
};

// Изменить статус отклика
export const updateApplicationStatus = async (applicationId, status) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    
    const response = await apiClient.patch(
      getBackendUrl(EMPLOYER_ENDPOINTS.UPDATE_APPLICATION_STATUS.replace(':id', applicationId)),
      { status }
    );
    return response.data;
  });
};