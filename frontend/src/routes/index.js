import MainPage from '../pages/MainPage/MainPage';
import OpportunityDetailPage from '../pages/OpportunityDetailPage/OpportunityDetailPage';
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage';
import CompaniesPage from '../pages/CompaniesPage/CompaniesPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import LoginAdminPage from '../pages/LoginPage/LoginAdminPage';
import ApplicantProfilePage from '../pages/ApplicantProfilePage/ApplicantProfilePage';
import ContactsPage from '../pages/ContactsPage/ContactsPage';
import ApplicantViewPage from '../pages/ApplicantViewPage/ApplicantViewPage';


export const common_routes = [
    { path: '/', element: MainPage },
    { path: '/opportunity/:id', element: OpportunityDetailPage },
    { path: '/favorites', element: FavoritesPage },
    { path: '/companies', element: CompaniesPage },
];

export const no_authorized_routes = [
    { path: '/admin/login', element: LoginAdminPage },
    { path: '/login', element: LoginPage },
    { path: '/register', element: RegisterPage },
    { path: '*', element: MainPage },
];

export const authorized_routes = [
    { path: '/login', element: MainPage },
    { path: '/register', element: MainPage },
    { path: '/profile', element: ApplicantProfilePage },
    { path: '/contacts', element: ContactsPage },
    { path: '/applicant/:id', element: ApplicantViewPage },
    { path: '*', element: MainPage },
];