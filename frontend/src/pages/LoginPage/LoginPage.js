import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FormContainer from '../../components/UI/FormContainer/FormContainer';
import InputBlock from '../../components/UI/InputBlock/InputBlock';
import Button from '../../components/UI/Button/Button';
import { useValidation } from '../../hooks/useValidation';
import { loginSchema } from '../../utils/validators/schemas/auth';
import { users } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';


const LoginPage = () => {
  const navigate = useNavigate();
  const { SetIsAuth, SetUser } = useAuth();
  const [role, setRole] = useState('student'); // student, employer
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { error, fieldErrors, validate, clearErrors } = useValidation();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    clearErrors();
    setLoginData({ email: '', password: '' });
  };

  const handleLogin = async () => {
    if (!validate(loginData, loginSchema)) return;
    
    setIsLoading(true);
    
    // Имитация запроса к серверу
    setTimeout(() => {
      let user = null;
      
      if (role === 'student') {
        // Проверка студента
        user = users.students.find(
          u => u.email === loginData.email && u.password === loginData.password
        );
        if (user) {
          user = { ...user, role: 'student' };
        }
      } else if (role === 'employer') {
        // Проверка работодателя
        user = users.employers.find(
          u => u.email === loginData.email && u.password === loginData.password
        );
        if (user) {
          user = { ...user, role: 'employer' };
        }
      }
      
      if (user) {
        // Успешный вход
        SetUser(user);
        SetIsAuth(true);
        // Сохраняем в sessionStorage
        sessionStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        // Ошибка входа
        clearErrors();
        alert('Неверный email или пароль');
      }
      
      setIsLoading(false);
    }, 500);
  };

  const getRoleIcon = () => {
    switch(role) {
      case 'student':
        return <User size={18} />;
      case 'employer':
        return <Briefcase size={18} />;
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'student':
        return 'Соискателя';
      case 'employer':
        return 'Работодателя';
      default:
        return '';
    }
  };

  return (
    <div className="login-page">
      <Header />
      
      <FormContainer title={`Вход для ${getRoleTitle()}`} onSubmit={handleLogin}>
        {/* Переключатель ролей */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-option ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            <User size={18} />
            Студент
          </button>
          <button
            type="button"
            className={`role-option ${role === 'employer' ? 'active' : ''}`}
            onClick={() => handleRoleChange('employer')}
          >
            <Briefcase size={18} />
            Работодатель
          </button>
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

        {error && <p className="errors">{error}</p>}

        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>

        <div className="reverse-block">
          Нет профиля?
          <Link to="/register" className="link">
            Зарегистрироваться
          </Link>
        </div>

        {role === 'student' && (
          <div className="demo-credentials">
            <p>Демо-доступ:</p>
            <code>student@example.com / student123</code>
          </div>
        )}
        
        {role === 'employer' && (
          <div className="demo-credentials">
            <p>Демо-доступ:</p>
            <code>company1@example.com / company123</code>
          </div>
        )}
      </FormContainer>
      
      <Footer />
    </div>
  );
};

export default LoginPage;