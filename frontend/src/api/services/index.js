// Единая точка входа для всех сервисов

// Users
export { login, registration, logout } from "./UserService/auth";

// Opportunities
export { getOpportunities, getOpportunityById, createOpportunity, updateOpportunity, uploadOpportunityMedia, deleteOpportunity } from "./OpportunityService/opportunity";


// Applicant
export { getCurrentApplicant, updateApplicantProfile,
     updatePrivacySettings, uploadAvatar, uploadResume } from "./ApplicantService/applicant";
export { addToFavorites, removeFromFavorites, getUserFavorites } from "./ApplicantService/favorites";
export { getUserApplications, applyToOpportunity, revokeOpportunity } from "./ApplicantService/applications";

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

//Employer
export {getCurrentEmployer, updateEmployerProfile,
   uploadEmployerLogo, uploadOfficePhotos, submitVerification} from "./EmployerService/employer";
export {getMyOpportunities } from "./EmployerService/opportunity";
export {getMyApplications, updateApplicationStatus} from "./EmployerService/applications";