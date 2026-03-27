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
  UPLOAD_MEDIA: '/opportunities/:id/media'
};

export const APPLICANT_ENDPOINTS = {
  GET_ME: '/applicants/me',
  GET_APPLICATIONS: '/applicants/me/applications',
  UPDATE_PROFILE: '/applicants/me',
  SEARCH_APPLICANTS: '/applicants',

  APPLY: '/applicants/me/applications',
  DELETE_APPLY: '/applicants/me/applications/:id',
  
  FAVORITE: '/applicants/me/favorites',
  DELETE_FAVORITE: '/applicants/me/favorites/:id'
};


export const EMPLOYER_ENDPOINTS = {
  GET_ME: '/employers/me',
  GET_PUBLIC_PROFILE: '/employers/:id/public',
  UPDATE_PROFILE: '/employers/me',
  UPLOAD_LOGO: '/employers/me/logo',
  UPLOAD_PHOTOS: '/employers/me/office-photos',
  VERIFICATION: '/employers/me/verification',
  MY_OPPORTUNITIES: '/employers/me/opportunities',
  MY_APPLICATIONS: '/employers/me/applications',
  UPDATE_APPLICATION_STATUS: '/employers/me/applications/:id/status'
};

export const TAG_ENDPOINTS = {
  GET_ALL: '/tags',
  CREATE: '/tags',
  DELETE: '/tags/:id'
};

export const CURATOR_ENDPOINTS = {
  STATS: '/curators/stats',
  ACCOUNTS: '/curators/accounts',
  USERS: '/curators/users',
  USER_DETAILS: '/curators/users/:id',
  USER_STATUS: '/curators/users/:id/status',
  PENDING_VERIFICATION: '/curators/verification/pending',
  REVIEW_VERIFICATION: '/curators/verification/:id',
  MODERATION_OPPORTUNITIES: '/curators/moderation/opportunities',
  MODERATE_OPPORTUNITY: '/curators/moderation/opportunities/:id',
};