import { useState } from 'react';
import './App.css';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    return <HomePage onLogout={() => setLoggedIn(false)} />;
  }

  return <LoginPage onLogin={() => setLoggedIn(true)} />;
}

export default App;
