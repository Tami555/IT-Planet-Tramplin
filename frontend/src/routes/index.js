import MainPage from '../pages/MainPage/MainPage';
import OpportunityDetailPage from '../pages/OpportunityDetailPage/OpportunityDetailPage';
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage';
import CompaniesPage from '../pages/CompaniesPage/CompaniesPage';
// import LoginPage from '../pages/LoginPage/LoginPage';
// import RegisterPage from '../pages/RegisterPage/RegisterPage';

export const common_routes = [
    { path: '/', element: MainPage },
    { path: '/opportunity/:id', element: OpportunityDetailPage },
    { path: '/favorites', element: FavoritesPage },
    { path: '/companies', element: CompaniesPage },
];

export const no_authorized_routes = [
    // { path: '/login', element: LoginPage },
    // { path: '/register', element: RegisterPage },
    { path: '*', element: MainPage },
];

export const authorized_routes = [
    { path: '*', element: MainPage },
];