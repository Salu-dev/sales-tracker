import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import logo from './tracker.png';
import './App.css';
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CustomerList from "./pages/CustomerList";
import VisitingHistory from "./pages/VisitingHistory";
import CreateVisit from "./pages/CreateVisit";
import ScheduledVisit from "./pages/ScheduledVisit";
import VisitDetails from "./pages/VisitDetails";
import BackendUrlModal from "./components/BackendUrlModal";
import { getBackendUrl, setBackendUrl } from "./utils/backend";

function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p> */}
        {/* <a
          className="App-link"
          href="https://th.bing.com/th/id/OIP.R6sct7abgLy33blszx7bMgHaHa?w=188&h=187&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
          target="_blank"
          rel="noopener noreferrer"
        > */}
         Time Tracking System 
        {/* </a> */}
        <br />
        <button 
          onClick={() => navigate('/login')}
          style={{ marginTop: '20px', padding: '10px 20px' ,backgroundColor: '#c5a713', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Go to Login
        </button>
      </header>
    </div>
  );
}

function App() {
  const [backendUrl, setBackendUrlState] = useState(getBackendUrl());

  const handleBackendUrlSave = (url) => {
    setBackendUrl(url);
    setBackendUrlState(url);
  };

  return (
    <Router>
      <BackendUrlModal onSave={handleBackendUrlSave} initialUrl={backendUrl} />
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/home" element={<HomePage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/customer-list" element={<Layout><CustomerList /></Layout>} />
        <Route path="/visit-history" element={<Layout><VisitingHistory /></Layout>} />
        <Route path="/visit-history/:customerName" element={<Layout><VisitingHistory /></Layout>} />
        <Route path="/create-visit" element={<Layout><CreateVisit /></Layout>} />
        <Route path="/scheduled-visit" element={<Layout><ScheduledVisit /></Layout>} />
        <Route path="/visit/:visitId" element={<Layout><VisitDetails /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
