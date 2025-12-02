import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import NewsList from './components/NewsList';
import FilterManagement from './components/FilterManagement';
import AlertManagement from './components/AlertManagement';
import AlertHistory from './components/AlertHistory';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <h1>News Alert System</h1>
          <div className="nav-links">
            <Link to="/">News</Link>
            <Link to="/filters">Filters</Link>
            <Link to="/alerts">Alerts</Link>
            <Link to="/history">History</Link>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route path="/filters" element={<FilterManagement />} />
          <Route path="/alerts" element={<AlertManagement />} />
          <Route path="/history" element={<AlertHistory />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

