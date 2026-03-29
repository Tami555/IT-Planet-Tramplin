import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Shield  } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { useFetch } from '../../hooks/useFetch';
import { loginSchema } from '../../utils/validators/schemas/auth';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';
import { login } from '../../api/services';


const LoginPage = () => {
  const navigate = useNavigate();
  const { SetIsAuth, SetUser } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const { localError, fieldErrors, validate, clearErrors } = useValidation();

  const [login_func, loading, serverError] = useFetch(
    async() => {
      const res = await login(loginData.email, loginData.password)
      SetIsAuth(true);
      SetUser(res);
      navigate('/');
    }
  )

  const handleLogin = async () => {
    if (!validate(loginData, loginSchema)) return;
    login_func();
  };

  return (
    <div className="login-page">
      <Header />
      
      <FormContainer title="Вход" onSubmit={handleLogin}>
        {/* Информационная строка вместо переключателя ролей */}
        <div className="role-info">
          <span className="role-info-text">
            <User size={16} /> Соискатель
          </span>
          <span className="role-info-separator">\</span>
          <span className="role-info-text">
            <Briefcase size={16} /> Работодатель
          </span>
          <span className="role-info-separator">\</span>
          <span className="role-info-text">
            <Shield size={16} /> Администратор
          </span>
          <p className="role-info-hint">Войдите в свой профиль</p>
        </div>

        <InputBlock
          label="Email"
          name="email"
          type="email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          placeholder="your@email.com"
          icon={<Mail size={18} />}
          error={fieldErrors.email}
          required
        />

        <InputBlock
          label="Пароль"
          name="password"
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          placeholder="введите пароль"
          icon={<Lock size={18} />}
          error={fieldErrors.password}
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
          {loading ? 'Вход...' : 'Войти'}
        </Button>

        <div className="reverse-block">
          Нет профиля?
          <Link to="/register" className="link">
            Зарегистрироваться
          </Link>
        </div>
      </FormContainer>
      
      <Footer />
    </div>
  );
};

export default LoginPage;