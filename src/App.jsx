import React, { useEffect } from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import Home from './Home';
    import Game from './Game';

    function App() {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </Router>
      );
    }

    export default App;
