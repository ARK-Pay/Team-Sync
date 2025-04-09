import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Contact from './components/Contact';
import About from './components/About';
import SignIn from './components/SignIn';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Router>
      <div className="App">
        <main>
          <div className={`menu-bg ${menuOpen ? 'open' : ''}`}></div>
          <Navigation menuOpen={menuOpen} toggleMenu={toggleMenu} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
