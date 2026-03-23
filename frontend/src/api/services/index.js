// Единая точка входа для всех сервисов

// Users
export { login, registration, logout } from "./UserService/auth";

// Opportunities
export { 
  getOpportunities, 
  getOpportunityById,
  applyToOpportunity,
  addToFavorites,
  removeFromFavorites
} from "./OpportunityService/opportunity";


// Applicant
export {
  getUserApplications,
  getCurrentApplicant
} from "./ApplicantService/applicant";

// Tags
export {
  getTags
} from "./TagService/tag";