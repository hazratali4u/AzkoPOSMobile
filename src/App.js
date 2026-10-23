import { useEffect, useState } from 'react';
import './App.css';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import UserContext from './UserContext';

const USER_STORAGE_KEY = 'azkopos.user';

function getStoredUser() {
  const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    if (
      user
      && Number.isFinite(user.userID)
      && typeof user.employeeName === 'string'
      && user.employeeName.trim()
      && Number.isFinite(user.roleID)
      && typeof user.connString === 'string'
      && user.connString.trim()
    ) {
      return user;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  sessionStorage.removeItem(USER_STORAGE_KEY);
  return null;
}

function App() {
  const [pathname, setPathname] = useState(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/login');
      return '/login';
    }

    return window.location.pathname;
  });
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  };

  return (
    <UserContext.Provider value={user}>
      {pathname !== '/login'
        ? (
          <HomePage
            pathname={pathname}
            onNavigate={navigate}
            onLogout={() => {
              sessionStorage.removeItem(USER_STORAGE_KEY);
              setUser(null);
              navigate('/login');
            }}
          />
        )
        : (
          <LoginPage onLogin={(authenticatedUser) => {
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
            setUser(authenticatedUser);
            navigate('/dashboard');
          }} />
        )}
    </UserContext.Provider>
  );
}

export default App;
