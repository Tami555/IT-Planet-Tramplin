import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { loginSchema } from '../../utils/validators/schemas/auth';
import { admin } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginAdminPage = () => {
  const navigate = useNavigate();
  const { SetIsAuth, SetUser } = useAuth();
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { error, fieldErrors, validate, clearErrors } = useValidation();

  const handleLogin = async () => {
    if (!validate(loginData, loginSchema)) return;
    
    setIsLoading(true);
    
    // Имитация запроса к серверу
    setTimeout(() => {
      // Проверка админа
      if (loginData.email === admin.email && loginData.password === admin.password) {
        const user = { ...admin, role: 'admin' };
        
        // Успешный вход
        SetUser(user);
        SetIsAuth(true);
        // Сохраняем в sessionStorage
        sessionStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        // Ошибка входа
        clearErrors();
        alert('Неверный email или пароль администратора');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <Header />
      
      <FormContainer title="Вход для Администратора" onSubmit={handleLogin}>
        <div className="admin-icon-wrapper">
          <Shield size={48} className="admin-icon" />
        </div>

        <InputBlock
          label="Email администратора"
          name="email"
          type="email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          placeholder="admin@tramplin.ru"
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

        {error && <p className="errors">{error}</p>}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти как администратор'}
        </Button>

        <div className="demo-credentials">
          <p>Демо-доступ администратора:</p>
          <code>admin@tramplin.ru / admin123</code>
        </div>
      </FormContainer>
      
      <Footer />
    </div>
  );
};

export default LoginAdminPage;