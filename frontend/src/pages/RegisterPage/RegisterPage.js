import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Building2, MapPin, Phone, FileText } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { studentRegisterSchema, employerRegisterSchema } from '../../utils/validators/schemas/auth';
import { users, supportedCities } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import './RegisterPage.css';


const RegisterPage = () => {
  const navigate = useNavigate();
  const { SetIsAuth, SetUser } = useAuth();
  const [role, setRole] = useState('student'); // student, employer
  const [isLoading, setIsLoading] = useState(false);
  const { error, fieldErrors, validate, clearErrors } = useValidation();

  // Общие поля для всех ролей
  const [commonData, setCommonData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // Поля для студента
  const [studentData, setStudentData] = useState({
    fullName: '',
    university: '',
    course: '',
    graduationYear: '',
    resume: null
  });

  // Поля для работодателя
  const [employerData, setEmployerData] = useState({
    companyName: '',
    description: '',
    inn: '',
    city: '',
    website: '',
    logo: null
  });

  const handleCommonChange = (e) => {
    setCommonData({ ...commonData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const handleEmployerChange = (e) => {
    setEmployerData({ ...employerData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'resume') {
      setStudentData({ ...studentData, resume: file });
    } else if (type === 'logo') {
      setEmployerData({ ...employerData, logo: file });
    }
  };

  const handleRegister = async () => {
    let isValid = false;
    
    if (role === 'student') {
      const dataToValidate = {
        ...commonData,
        ...studentData
      };
      isValid = validate(dataToValidate, studentRegisterSchema);
    } else {
      const dataToValidate = {
        ...commonData,
        ...employerData
      };
      isValid = validate(dataToValidate, employerRegisterSchema);
    }
    
    if (!isValid) return;
    
    setIsLoading(true);
    
    // Имитация запроса к серверу
    setTimeout(() => {
      // Проверяем, не существует ли уже пользователь с таким email
      const existingStudent = users.students.find(u => u.email === commonData.email);
      const existingEmployer = users.employers.find(u => u.email === commonData.email);
      
      if (existingStudent || existingEmployer) {
        alert('Пользователь с таким email уже существует');
        setIsLoading(false);
        return;
      }
      
      let newUser = null;
      
      if (role === 'student') {
        newUser = {
          id: users.students.length + 1,
          email: commonData.email,
          password: commonData.password,
          role: 'student',
          fullName: studentData.fullName,
          university: studentData.university,
          course: parseInt(studentData.course),
          graduationYear: parseInt(studentData.graduationYear) || null,
          phone: commonData.phone,
          avatar: null,
          resume: studentData.resume ? studentData.resume.name : null,
          portfolio: null,
          skills: [],
          favorites: [],
          applied: []
        };
        users.students.push(newUser);
      } else {
        newUser = {
          id: users.employers.length + 1,
          name: employerData.companyName,
          email: commonData.email,
          password: commonData.password,
          role: 'employer',
          description: employerData.description,
          industry: 'IT',
          website: employerData.website,
          city: employerData.city,
          coordinates: [55.7558, 37.6176],
          verified: false,
          phone: commonData.phone,
          inn: employerData.inn,
          logo: employerData.logo ? URL.createObjectURL(employerData.logo) : null,
          activeOpportunities: 0
        };
        users.employers.push(newUser);
      }
      
      // Автоматический вход после регистрации
      SetUser(newUser);
      SetIsAuth(true);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      
      alert('Регистрация успешно завершена!');
      navigate('/');
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="register-page">
      <Header />
      
      <FormContainer title="Регистрация" onSubmit={handleRegister}>
        {/* Переключатель ролей */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${role === 'student' ? 'active' : ''}`}
            onClick={() => {
              setRole('student');
              clearErrors();
            }}
          >
            <User size={18} />
            Студент / Выпускник
          </button>
          <button
            type="button"
            className={`role-option ${role === 'employer' ? 'active' : ''}`}
            onClick={() => {
              setRole('employer');
              clearErrors();
            }}
          >
            <Briefcase size={18} />
            Работодатель
          </button>
        </div>

        {/* Общие поля */}
        <InputBlock
          label="Email"
          name="email"
          type="email"
          value={commonData.email}
          onChange={handleCommonChange}
          placeholder="your@email.com"
          icon={<Mail size={18} />}
          error={fieldErrors.email}
          required
        />

        <InputBlock
          label="Пароль"
          name="password"
          type="password"
          value={commonData.password}
          onChange={handleCommonChange}
          placeholder="минимум 8 символов, буквы и цифры"
          icon={<Lock size={18} />}
          error={fieldErrors.password}
          required
        />

        <InputBlock
          label="Подтверждение пароля"
          name="confirmPassword"
          type="password"
          value={commonData.confirmPassword}
          onChange={handleCommonChange}
          placeholder="повторите пароль"
          icon={<Lock size={18} />}
          error={fieldErrors.confirmPassword}
          required
        />

        <InputBlock
          label="Телефон"
          name="phone"
          type="tel"
          value={commonData.phone}
          onChange={handleCommonChange}
          placeholder="+7 (999) 123-45-67"
          icon={<Phone size={18} />}
          error={fieldErrors.phone}
        />

        {/* Поля для студента */}
        {role === 'student' && (
          <>
            <InputBlock
              label="ФИО"
              name="fullName"
              value={studentData.fullName}
              onChange={handleStudentChange}
              placeholder="Иванов Иван Иванович"
              icon={<User size={18} />}
              error={fieldErrors.fullName}
              required
            />

            <InputBlock
              label="Вуз"
              name="university"
              value={studentData.university}
              onChange={handleStudentChange}
              placeholder="МГТУ им. Н.Э. Баумана"
              icon={<Building2 size={18} />}
              error={fieldErrors.university}
              required
            />

            <div className="row-fields">
              <InputBlock
                label="Курс"
                name="course"
                type="number"
                value={studentData.course}
                onChange={handleStudentChange}
                placeholder="3"
                error={fieldErrors.course}
                required
              />
              <InputBlock
                label="Год выпуска"
                name="graduationYear"
                type="number"
                value={studentData.graduationYear}
                onChange={handleStudentChange}
                placeholder="2027"
                error={fieldErrors.graduationYear}
              />
            </div>

            <InputBlock
              label="Резюме"
              name="resume"
              type="file"
              onChange={(e) => handleFileChange(e, 'resume')}
              accept=".pdf,.doc,.docx"
              icon={<FileText size={18} />}
            />
          </>
        )}

        {/* Поля для работодателя */}
        {role === 'employer' && (
          <>
            <InputBlock
              label="Название компании"
              name="companyName"
              value={employerData.companyName}
              onChange={handleEmployerChange}
              placeholder="ООО 'Рога и Копыта'"
              icon={<Building2 size={18} />}
              error={fieldErrors.companyName}
              required
            />

            <InputBlock
              label="Описание компании"
              name="description"
              type="textarea"
              rows={3}
              value={employerData.description}
              onChange={handleEmployerChange}
              placeholder="Краткое описание деятельности компании..."
              error={fieldErrors.description}
              required
            />

            <InputBlock
              label="ИНН"
              name="inn"
              value={employerData.inn}
              onChange={handleEmployerChange}
              placeholder="123456789012"
              error={fieldErrors.inn}
              required
            />

            <InputBlock
              label="Город"
              name="city"
              value={employerData.city}
              onChange={handleEmployerChange}
              placeholder="Москва"
              error={fieldErrors.city}
              required
            />

            <InputBlock
              label="Сайт"
              name="website"
              value={employerData.website}
              onChange={handleEmployerChange}
              placeholder="https://example.com"
              error={fieldErrors.website}
            />

            <InputBlock
              label="Логотип компании"
              name="logo"
              type="file"
              onChange={(e) => handleFileChange(e, 'logo')}
              accept="image/*"
              icon={<FileText size={18} />}
            />
          </>
        )}

        {error && <p className="errors">{error}</p>}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>

        <div className="reverse-block">
          Уже есть аккаунт?
          <Link to="/login" className="link">
            Войти
          </Link>
        </div>
      </FormContainer>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;