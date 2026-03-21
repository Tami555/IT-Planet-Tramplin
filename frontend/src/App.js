import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { common_routes, authorized_routes, no_authorized_routes } from './routes';
import './styles/app.css';

function AppContent() {
  const { IsAuth } = useAuth();
  const routes_path = common_routes.concat(IsAuth ? authorized_routes : no_authorized_routes);
  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {routes_path.map(r => (
            <Route key={r.path} path={r.path} element={<r.element />} />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;