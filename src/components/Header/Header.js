import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1>Cuponia</h1>
      <nav>
      <a href="/inicio">Inicio </a>  | <a href="/perfil">Mi Perfil de Empresa </a> | <a href="/">Cerrar sesión</a>
      </nav>
    </header>
  );
}

export default Header;
