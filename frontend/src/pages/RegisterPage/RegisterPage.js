import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { useFetch } from '../../hooks/useFetch';
import { RegistrationSchema } from '../../utils/validators/schemas/auth';
import { useAuth } from '../../contexts/AuthContext';
import './RegisterPage.css';
import { registration } from '../../api/services';


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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErrors();
  };

  const [registration_func, loading, serverError] = useFetch(
    async () => {
      const res = await registration(formData.email, formData.displayName, formData.password, role);
      SetIsAuth(true);
      SetUser(res);
    }
  )

  const handleRegister = async () => {
    const isValid = validate(formData, RegistrationSchema);
    if (!isValid) return;
    registration_func();
  };

  return (
    <div className="register-page">
      <Header />
      
      <FormContainer title="Регистрация" onSubmit={handleRegister}>
        {/* Переключатель ролей */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${role === 'APPLICANT' ? 'active' : ''}`}
            onClick={() => {
              setRole('APPLICANT');
              clearErrors();
            }}
          >
            <User size={18} />
            Студент / Выпускник
          </button>
          <button
            type="button"
            className={`role-option ${role === 'EMPLOYER' ? 'active' : ''}`}
            onClick={() => {
              setRole('EMPLOYER');
              clearErrors();
            }}
          >
            <Briefcase size={18} />
            Работодатель
          </button>
        </div>

        <InputBlock
          label="Имя пользователя"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
          placeholder="повторите пароль"
          icon={<Lock size={18} />}
          error={fieldErrors.confirmPassword}
          required
        />

        {localError && <p className="errors">{localError}</p>}
        {serverError && <p className="errors">{serverError}</p>}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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