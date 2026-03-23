// вход, регистрация, выход
import { getBackendUrl, USER_ENDPOINTS } from "../../config/endpoints";
import axios from "axios";
import { handleAuthError, handleCreateUpdateUserError } from "../../utils/errors/users/AuthHandlers";
import { apiRequest } from "../../utils/apiRequest";
import { setCookie, deleteCookie, getCookie } from "../../utils/auth/cookies";
import { apiClient } from "../../config/apiClient";


export const login = async (email, password) => {
  return await apiRequest(
    async () => {
      const res = await axios.post(getBackendUrl(USER_ENDPOINTS.LOGIN), {
        "email": email,
        "password": password
      });
      const data = res.data;
      setCookie('access_token', data.accessToken);
      setCookie('refresh_token', data.refreshToken);
      return data.user;
    },
    handleAuthError
  );
};


export const registration = async (
  email,
  displayName,
  password,
  role
) => {
    return await apiRequest(
        async () => {
            const res = await axios.post(getBackendUrl(USER_ENDPOINTS.REGISTRATION), {
            email: email,
            displayName: displayName,
            role: role,
            password: password
        });
        const data = res.data;
        setCookie('access_token', data.accessToken);
        setCookie('refresh_token', data.refreshToken);
        return data.user;
        },
        handleCreateUpdateUserError
    )
}


export const logout = async () => {
    // Удаляем cookies и инфу о пользователе
    return await apiRequest(
      async () => {
        await apiClient.post(USER_ENDPOINTS.LOGOUT, {refreshToken: getCookie("refresh_token")});
        deleteCookie('access_token');
        deleteCookie('refresh_token');
      }
    )
}