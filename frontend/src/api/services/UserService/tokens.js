// проверка и обновление jwt токенов
import { getCookie, setCookie, deleteCookie } from "../../utils/auth/cookies"
import axios from "axios";
import { getBackendUrl, USER_ENDPOINTS } from "../../config/endpoints"
import { apiClient } from "../../config/apiClient";


export const check_token = async () => {
    // проверка действия токена
    const res = await apiClient.get(getBackendUrl(USER_ENDPOINTS.VERIFY));
    console.log(res.data.valid, "ООТвет")
    if(!res.data.valid){
        try {
            const refresh_token = getCookie('refresh_token');
            // Обновляем токен
            const refreshRes = await axios.post(getBackendUrl(USER_ENDPOINTS.REFRESH), {
                refreshToken: refresh_token
            });
            const data = refreshRes.data
            setCookie('access_token', data.accessToken);
            setCookie('refresh_token', data.refreshToken);
            return true;
        } catch (refreshError) {
            console.log("ПОЙМАЛ")
            // Удаляем невалидные cookies
            deleteCookie('access_token');
            deleteCookie('refresh_token');
            sessionStorage.removeItem('user');
            return false;
        } 
    }
    return res.data.valid
}