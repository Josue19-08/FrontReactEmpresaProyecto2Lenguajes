import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inicio from './components/Inicio/Inicio';
import EmpresaPerfil from './components/EmpresaPerfil/EmpresaPerfil';
import Login from './components/Login/Login';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/perfil" element={<EmpresaPerfil />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
