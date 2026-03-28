import { getBackendUrl, CURATOR_ENDPOINTS } from "../../config/endpoints";
import { apiRequest } from "../../utils/apiRequest";
import { apiClient } from "../../config/apiClient";
import { check_token } from "../UserService/tokens";


// Получить статистику платформы
export const getPlatformStats = async () => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.get(getBackendUrl(CURATOR_ENDPOINTS.STATS));
    return response.data;
  });
};

// Создать учетную запись куратора
export const createCurator = async (data) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.post(getBackendUrl(CURATOR_ENDPOINTS.ACCOUNTS), data);
    return response.data;
  });
};

// Получить список кураторов
export const getCurators = async () => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен
    
    const response = await apiClient.get(getBackendUrl(CURATOR_ENDPOINTS.ACCOUNTS));
    return response.data;
  });
};