import { 
  checkRequired, 
  checkEmail, 
  checkMinLength, 
  checkPassword,
  checkPhone,
  checkINN,
  checkUrl,
  checkCity,
  checkYear,
  checkCourse
} from '../validators/general';


export const loginSchema = {
  email: (value) => checkRequired(value, 'Email') || checkEmail(value),
  password: (value) => checkRequired(value, 'Пароль') || checkMinLength(value, 8, 'Пароль')
};

// Базовая схема регистрации
export const RegistrationSchema = {
  displayName: (value) => checkRequired(value, 'Username') || checkMinLength(value, 3, 'Username'),
  email: (value) => checkRequired(value, 'Email') || checkEmail(value),
  password: (value) => checkRequired(value, 'Пароль') || checkMinLength(value, 8, 'Пароль'),
  confirmPassword: (value, fields) => {
    if (value !== fields.password) return 'Пароли не совпадают';
    return null;
  }
};

// Схема для регистрации соискателя (добавляем firstName, lastName)
export const ApplicantRegistrationSchema = {
  ...RegistrationSchema,
  firstName: (value) => checkRequired(value, 'Имя') || checkMinLength(value, 2, 'Имя'),
  lastName: (value) => checkRequired(value, 'Фамилия') || checkMinLength(value, 2, 'Фамилия')
};

// Схема для регистрации работодателя (добавляем companyName)
export const EmployerRegistrationSchema = {
  ...RegistrationSchema,
  companyName: (value) => checkRequired(value, 'Название компании') || checkMinLength(value, 2, 'Название компании')
};