import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('skillswap_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('skillswap_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    localStorage.setItem('skillswap_user', JSON.stringify(updatedData));
    setUser(updatedData);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <h1>SkillSwap</h1>
          {user && (
            <div className="nav-actions">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </div>
          )}
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup onSignup={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard user={user} onUpdateUser={updateUser} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
