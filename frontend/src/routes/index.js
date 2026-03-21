import MainPage from '../pages/MainPage/MainPage';
import OpportunityDetailPage from '../pages/OpportunityDetailPage/OpportunityDetailPage';
// import LoginPage from '../pages/LoginPage/LoginPage';
// import RegisterPage from '../pages/RegisterPage/RegisterPage';

export const common_routes = [
    { path: '/', element: MainPage },
    { path: '/opportunity/:id', element: OpportunityDetailPage },
];

export const no_authorized_routes = [
    // { path: '/login', element: LoginPage },
    // { path: '/register', element: RegisterPage },
    { path: '*', element: MainPage },
];

export const authorized_routes = [
    // Добавим позже
    { path: '*', element: MainPage },
];