// Базовый url
const BACKEND_URL = "http://localhost:3000/api/"
const API_VERSION = "v1"

export const getApiBase = BACKEND_URL + API_VERSION;
export const getBackendUrl = (endpoint) => getApiBase + endpoint;


export const USER_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTRATION: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout'
};
