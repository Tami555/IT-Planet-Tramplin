import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Building2, Users } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { 
  ApplicantRegistrationSchema, 
  EmployerRegistrationSchema 
} from '../../utils/validators/schemas/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { registrationApplicant, registrationEmployer } from '../../api/services';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { SetIsAuth, SetUser } = useAuth();
  const [role, setRole] = useState('APPLICANT'); // APPLICANT, EMPLOYER
  const { localError, fieldErrors, validate, clearErrors } = useValidation();

  // Общие поля для всех ролей
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Поля для соискателя
  const [applicantData, setApplicantData] = useState({
    firstName: '',
    lastName: ''
  });

  // Поля для работодателя
  const [employerData, setEmployerData] = useState({
    companyName: ''
  });

  const handleCommonChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const handleApplicantChange = (e) => {
    setApplicantData({ ...applicantData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const handleEmployerChange = (e) => {
    setEmployerData({ ...employerData, [e.target.name]: e.target.value });
    clearErrors();
  };

  // Регистрация соискателя
  const [registerApplicantFunc, loadingApplicant, serverErrorApplicant] = useFetch(
    async () => {
      const res = await registrationApplicant(
        formData.email,
        formData.displayName,
        formData.password,
        applicantData.firstName,
        applicantData.lastName
      );
      SetIsAuth(true);
      SetUser(res);
      navigate('/');
    }
  );

  // Регистрация работодателя
  const [registerEmployerFunc, loadingEmployer, serverErrorEmployer] = useFetch(
    async () => {
      const res = await registrationEmployer(
        formData.email,
        formData.displayName,
        formData.password,
        employerData.companyName
      );
      SetIsAuth(true);
      SetUser(res);
      navigate('/');
    }
  );

  const handleRegister = async () => {
    let isValid = false;
    
    if (role === 'APPLICANT') {
      // Валидация для соискателя
      const dataToValidate = {
        ...formData,
        ...applicantData
      };
      isValid = validate(dataToValidate, ApplicantRegistrationSchema);
    } else {
      // Валидация для работодателя
      const dataToValidate = {
        ...formData,
        ...employerData
      };
      isValid = validate(dataToValidate, EmployerRegistrationSchema);
    }
    
    if (!isValid) return;
    
    // Выполняем соответствующую регистрацию
    if (role === 'APPLICANT') {
      await registerApplicantFunc();
    } else {
      await registerEmployerFunc();
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    clearErrors();
  };

  const isLoading = role === 'APPLICANT' ? loadingApplicant : loadingEmployer;
  const serverError = role === 'APPLICANT' ? serverErrorApplicant : serverErrorEmployer;

  return (
    <div className="register-page">
      <Header />
      
      <FormContainer title="Регистрация" onSubmit={handleRegister}>
        {/* Переключатель ролей */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${role === 'APPLICANT' ? 'active' : ''}`}
            onClick={() => handleRoleChange('APPLICANT')}
          >
            <User size={18} />
            Студент / Выпускник
          </button>
          <button
            type="button"
            className={`role-option ${role === 'EMPLOYER' ? 'active' : ''}`}
            onClick={() => handleRoleChange('EMPLOYER')}
          >
            <Briefcase size={18} />
            Работодатель
          </button>
        </div>

        {/* Общие поля */}
        <InputBlock
          label="Имя пользователя"
          name="displayName"
          value={formData.displayName}
          onChange={handleCommonChange}
          placeholder="Иван Иванов"
          icon={<User size={18} />}
          error={fieldErrors.displayName}
          required
        />

        <InputBlock
          label="Email"
          name="email"
          type="email"
          value={formData.email}
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
          value={formData.password}
          onChange={handleCommonChange}
          placeholder="минимум 8 символов"
          icon={<Lock size={18} />}
          error={fieldErrors.password}
          required
        />

        <InputBlock
          label="Подтверждение пароля"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleCommonChange}
          placeholder="повторите пароль"
          icon={<Lock size={18} />}
          error={fieldErrors.confirmPassword}
          required
        />

        {/* Поля для соискателя */}
        {role === 'APPLICANT' && (
          <>
            <div className="row-fields">
              <InputBlock
                label="Имя"
                name="firstName"
                value={applicantData.firstName}
                onChange={handleApplicantChange}
                placeholder="Иван"
                icon={<User size={18} />}
                error={fieldErrors.firstName}
                required
              />
              <InputBlock
                label="Фамилия"
                name="lastName"
                value={applicantData.lastName}
                onChange={handleApplicantChange}
                placeholder="Иванов"
                icon={<Users size={18} />}
                error={fieldErrors.lastName}
                required
              />
            </div>
          </>
        )}

        {/* Поля для работодателя */}
        {role === 'EMPLOYER' && (
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
        )}

        {localError && <p className="errors">{localError}</p>}
        {serverError && <p className="errors">{serverError}</p>}

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