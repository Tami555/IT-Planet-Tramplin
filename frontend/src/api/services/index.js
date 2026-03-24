// Единая точка входа для всех сервисов

// Users
export { login, registration, logout } from "./UserService/auth";

// Opportunities
export { getOpportunities, getOpportunityById } from "./OpportunityService/opportunity";


// Applicant
export { getUserApplications, getCurrentApplicant } from "./ApplicantService/applicant";
export { addToFavorites, removeFromFavorites, getUserFavorites } from "./ApplicantService/favorites";
export { applyToOpportunity } from "./ApplicantService/applications";

// Tags
export { getTags } from "./TagService/tag";