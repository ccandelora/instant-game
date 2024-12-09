import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Game from './Game';
import AsteroidDodger from './AsteroidDodger';
import OrbitalRacer from './OrbitalRacer';
import TowerTumble from './TowerTumble';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/asteroid-dodger" element={<AsteroidDodger />} />
        <Route path="/orbital-racer" element={<OrbitalRacer />} />
        <Route path="/tower-tumble" element={<TowerTumble />} />
      </Routes>
    </Router>
  );
}

export default App;
