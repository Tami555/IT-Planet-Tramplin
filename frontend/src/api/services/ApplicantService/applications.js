import { getBackendUrl, APPLICANT_ENDPOINTS } from "../../config/endpoints";
import { apiClient } from "../../config/apiClient";
import { handleApiError } from "../../utils/errors/errorHandlers";
import { apiRequest } from "../../utils/apiRequest";


// Отклик на возможность
export const applyToOpportunity = async (opportunityId, coverLetter = '') => {
  return await apiRequest(
    async () => {
      const url = getBackendUrl(APPLICANT_ENDPOINTS.APPLY);
      const response = await apiClient.post(url, {
        opportunityId: opportunityId,
        coverLetter: coverLetter
    });
      return response.data;
    },
    handleApiError
  );
};