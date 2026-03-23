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

export const RegistrationSchema = {
  displayName: (value) => checkRequired(value, 'Username') || checkMinLength(value, 3, 'Username'),
  email: (value) => checkRequired(value, 'Email') || checkEmail(value),
  password: (value) => checkRequired(value, 'Пароль') || checkMinLength(value, 8, 'Пароль'),
  confirmPassword: (value, fields) => {
    if (value !== fields.password) return 'Пароли не совпадают';
    return null;
  }
};

// export const studentRegisterSchema = {
//   email: (value) => checkRequired(value, 'Email') || checkEmail(value),
//   password: (value) => checkRequired(value, 'Пароль') || checkPassword(value),
//   confirmPassword: (value, fields) => {
//     if (value !== fields.password) return 'Пароли не совпадают';
//     return null;
//   },
//   fullName: (value) => checkRequired(value, 'ФИО') || checkMinLength(value, 3, 'ФИО'),
//   university: (value) => checkRequired(value, 'Вуз'),
//   course: (value) => checkRequired(value, 'Курс') || checkCourse(value),
//   graduationYear: (value) => checkYear(value),
//   phone: (value) => checkPhone(value)
// };

// export const employerRegisterSchema = {
//   email: (value) => checkRequired(value, 'Email') || checkEmail(value),
//   password: (value) => checkRequired(value, 'Пароль') || checkPassword(value),
//   confirmPassword: (value, fields) => {
//     if (value !== fields.password) return 'Пароли не совпадают';
//     return null;
//   },
//   companyName: (value) => checkRequired(value, 'Название компании'),
//   description: (value) => checkRequired(value, 'Описание компании'),
//   inn: (value) => checkRequired(value, 'ИНН') || checkINN(value),
//   city: (value) => checkRequired(value, 'Город') || checkCity(value, supportedCities),
//   website: (value) => checkUrl(value),
//   phone: (value) => checkPhone(value)
// };