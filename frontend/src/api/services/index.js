// Единая точка входа для всех сервисов

// Users
export { login, registration, logout } from "./UserService/auth";

// Opportunities
export { getOpportunities, getOpportunityById } from "./OpportunityService/opportunity";


// Applicant
export { getUserApplications, getCurrentApplicant, updateApplicantProfile,
     updatePrivacySettings, uploadAvatar, uploadResume } from "./ApplicantService/applicant";
export { addToFavorites, removeFromFavorites, getUserFavorites } from "./ApplicantService/favorites";
export { applyToOpportunity } from "./ApplicantService/applications";

// Contacts
export {
  getContacts,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteContact,
  getApplicantById
} from "./ApplicantService/contacts";

// Tags
export { getTags } from "./TagService/tag";