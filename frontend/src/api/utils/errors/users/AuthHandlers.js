import { handleApiError } from "../errorHandlers";


// обработка при входе
export const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    throw new Error("Неверно введены email или пароль");
  }
  return handleApiError(error, "Ошибка авторизации");
};


// обработка при регистрации
export const handleCreateUpdateUserError = (error) => {
  if (error.response?.status === 409) {
    throw new Error(error.response?.data?.message);
  }
  return handleApiError(error, "Ошибка при регистрации");
};  