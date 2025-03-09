import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import Acceuil from '../src/pages/Acceuil'
import Dimension from "./pages/Dimension";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/dimension" element={<Dimension />} />
      </Routes>
    </Router>
  );
}

export default App;
