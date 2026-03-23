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

export const OPPORTUNITY_ENDPOINTS = {
  GET_ALL: '/opportunities',
  GET_BY_ID: '/opportunities/:id',
  CREATE: '/opportunities',
  UPDATE: '/opportunities/:id',
  DELETE: '/opportunities/:id',

  APPLY: '/applicants/me/applications',
  DELETE_APPLY: '/applicants/me/applications/:id',
  FAVORITE: '/applicants/me/favorites',
  DELETE_FAVORITE: '/applicants/me/favorites/:id'
};

export const APPLICANT_ENDPOINTS = {
  GET_ME: '/applicants/me',
  GET_APPLICATIONS: '/applicants/me/applications',
  UPDATE_PROFILE: '/applicants/me'
};

export const TAG_ENDPOINTS = {
  GET_ALL: '/tags',
  CREATE: '/tags',
  DELETE: '/tags/:id'
};