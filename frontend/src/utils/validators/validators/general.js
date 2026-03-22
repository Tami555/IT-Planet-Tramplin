// Проверка на пустые поля
export const checkRequired = (value, fieldName = 'Поле') => {
  if (!value?.toString().trim()) return `${fieldName} обязательно для заполнения`;
  return null;
};

// Проверка минимальной длины
export const checkMinLength = (value, min, fieldName = 'Поле') => {
  if (value?.length < min) return `${fieldName} должен содержать минимум ${min} символов`;
  return null;
};

// Проверка максимальной длины
export const checkMaxLength = (value, max, fieldName = 'Поле') => {
  if (value?.length > max) return `${fieldName} не должен превышать ${max} символов`;
  return null;
};

// Проверка email
export const checkEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Введите корректный email';
  return null;
};

// Проверка телефона
export const checkPhone = (phone) => {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  if (phone && !phoneRegex.test(phone)) return 'Введите корректный номер телефона';
  return null;
};

// Проверка ИНН (10 или 12 цифр)
export const checkINN = (inn) => {
  const innRegex = /^\d{10}$|^\d{12}$/;
  if (inn && !innRegex.test(inn)) return 'ИНН должен содержать 10 или 12 цифр';
  return null;
};

// Проверка пароля (минимум 8 символов, цифра, буква)
export const checkPassword = (password) => {
  if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
  if (!/[A-Za-z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву';
  if (!/[0-9]/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  return null;
};

// Проверка совпадения паролей
export const checkPasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return 'Пароли не совпадают';
  return null;
};

// Проверка URL
export const checkUrl = (url) => {
  if (!url) return null;
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (!urlRegex.test(url)) return 'Введите корректный URL';
  return null;
};

// Проверка года (для курса/выпуска)
export const checkYear = (year) => {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) return 'Введите корректный год';
  if (yearNum < 2000) return 'Год не может быть раньше 2000';
  if (yearNum > currentYear + 5) return 'Год не может быть позже ' + (currentYear + 5);
  return null;
};

// Проверка курса
export const checkCourse = (course) => {
  const courseNum = parseInt(course);
  if (isNaN(courseNum)) return 'Введите корректный курс';
  if (courseNum < 1) return 'Курс не может быть меньше 1';
  if (courseNum > 6) return 'Курс не может быть больше 6';
  return null;
};

// Проверка города (из списка разрешенных)
export const checkCity = (city, allowedCities) => {
  if (!city) return null;
  if (!allowedCities.includes(city)) return `Город должен быть из списка: ${allowedCities.join(', ')}`;
  return null;
};