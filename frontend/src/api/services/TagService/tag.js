import { getBackendUrl, TAG_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";
import axios from "axios";
import { check_token } from "../UserService/tokens";


// Получение списка тегов с фильтрацией
export const getTags = async (filters = {}) => {
  return await apiRequest(
    async () => {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const url = `${getBackendUrl(TAG_ENDPOINTS.GET_ALL)}?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    },
    handleApiError
  );
};

// Создать тег
export const createTag = async (name, category) => {
  return await apiRequest(async () => {
    await check_token() //обновляем токен

    const response = await apiClient.post(getBackendUrl(TAG_ENDPOINTS.CREATE), {
      name,
      category
    });
    return response.data;
  });
};

// Удалить тег
export const deleteTag = async (tagId) => {
  await check_token() //обновляем токен
  
  return await apiRequest(async () => {
    const response = await apiClient.delete(getBackendUrl(TAG_ENDPOINTS.DELETE.replace(':id', tagId)));
    return response.data;
  });
};