// Базовый обработчик ошибок API
export const handleApiError = (error, defaultMessage = "Произошла непредвиденная ошибка") => {
  console.error('API Error:', error);
  
  // Network errors
  if (error.code === 'ERR_NETWORK') {
    throw new Error("Сервер временно недоступен. Попробуйте позже.");
  }
  
  if (error.code === 'ECONNABORTED') {
    throw new Error("Превышено время ожидания ответа от сервера.");
  }
  
  // HTTP errors
  if (error.response?.data) {    
    //  Статус-специфичные ошибки

    if (error.response.status === 400) {
      const msg = error.response?.data?.message || "Неправильные данные"
      throw new Error(msg);
    }

    if (error.response.status === 401) {
      const msg = error.response?.data?.message || "Неавторизованный доступ. Пожалуйста, войдите снова."
      throw new Error(msg);
    }
    
    if (error.response.status === 403) {
      const msg = error.response?.data?.message || "Доступ запрещен."
      throw new Error(msg);
    }
    
    if (error.response.status === 404) {
      const msg = error.response?.data?.message || "Ресурс не найден."
      throw new Error(msg);
    }

    if (error.response.status === 409) {
      const msg = error.response?.data?.message || "Конфликт состояния на сервере"
      throw new Error(msg);
    }

    if (error.response.status === 422) {
      const msg = error.response?.data?.message || "Не корректные данные"
      throw new Error(msg);
    }
    
    if (error.response.status >= 500) {
      throw new Error("Внутренняя ошибка сервера. Попробуйте позже.");
    }
  }

  throw new Error(defaultMessage);
};