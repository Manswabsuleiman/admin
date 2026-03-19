import React from 'react';
import Home from './pages/Home';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      {/* If <Home /> contains the landing page content, 
          it MUST be moved inside <Routes>.
      */}
      <Routes>
        {/* Route for the Login Page */}
        <Route path="/login" element={<Auth />} />
        
        {/* Route for the Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Route for the Home Page */}
        <Route path="/home" element={<Home />} />

        {/* Default: If the user goes to "/", send them to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;