import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [IsAuth, SetIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [User, SetUser] = useState(null);

  const UpdateUserData = (data) => {
    SetUser(data);
    sessionStorage.setItem('user', JSON.stringify(data));
  };

  const DeleteUserData = () => {
    SetUser(null);
    sessionStorage.removeItem('user');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Проверяем sessionStorage
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          SetUser(userData);
          SetIsAuth(true);
        } else {
          SetIsAuth(false);
          SetUser(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        SetIsAuth(false);
        DeleteUserData();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const value = {
    IsAuth,
    isLoading,
    User,
    SetUser: UpdateUserData,
    ClearUser: DeleteUserData,
    SetIsAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};