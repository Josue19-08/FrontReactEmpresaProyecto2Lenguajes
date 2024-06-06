import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Login.css';
import logo from '../../img/logo.png';

const API_EMPRESA_URL = 'http://localhost/PlataformaCupones/PlataformaCuponesPHP/Backend%20PHP/Presentacion/EmpresaController.php';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoCedula, setTipoCedula] = useState('fisica');
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const navigate = useNavigate();

  const handleCedulaChange = (e) => {
    const { value } = e.target;
    let maskedValue = value.replace(/\D/g, ''); // Remove all non-numeric characters

    if (tipoCedula === 'fisica') {
      if (maskedValue.length > 2) maskedValue = maskedValue.slice(0, 2) + '-' + maskedValue.slice(2);
      if (maskedValue.length > 7) maskedValue = maskedValue.slice(0, 7) + '-' + maskedValue.slice(7);
      if (maskedValue.length > 12) maskedValue = maskedValue.slice(0, 12);
    } else {
      if (maskedValue.length > 2) maskedValue = maskedValue.slice(0, 2) + '-' + maskedValue.slice(2);
      if (maskedValue.length > 6) maskedValue = maskedValue.slice(0, 6) + '-' + maskedValue.slice(6);
      if (maskedValue.length > 13) maskedValue = maskedValue.slice(0, 13);
    }

    setUsername(maskedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const encryptedPassword = CryptoJS.SHA256(password).toString();
  
    try {
      const response = await fetch(API_EMPRESA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          METHOD: 'LOGIN',
          cedula: username,
          contrasenna: encryptedPassword
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        localStorage.setItem('empresa_id', data.empresa.id);
        localStorage.setItem('empresa_correo', data.empresa.correo);
        localStorage.setItem('empresa_cedula', data.empresa.cedula);
        localStorage.setItem('empresa_imagen', data.empresa.imagen);

        if (data.empresa.estado === 'Activo') {
          localStorage.setItem('empresa', JSON.stringify(data.empresa));
          navigate('/inicio');
        } else if (data.empresa.estado === 'Inactivo') {
          alert('Su cuenta se encuentra Inactiva. Por favor comuníquese con un administrador.');
        } else if (data.empresa.estado === 'Nuevo') {
          localStorage.setItem('empresa', JSON.stringify(data.empresa));
          setShowNewPasswordModal(true);
        }
      } else {
        alert(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
      alert('Error en la autenticación');
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      alert('La contraseña no cumple con los requisitos de seguridad');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    const encryptedNewPassword = CryptoJS.SHA256(newPassword).toString();
  
    try {
      const empresa = JSON.parse(localStorage.getItem('empresa'));
      if (!empresa || !empresa.id) {
        alert('No se encontraron los datos de la empresa en el almacenamiento local');
        return;
      }
      
      // Actualizamos todos los datos de la empresa, incluyendo la nueva contraseña
      const empresaData = {
        id: empresa.id,
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        cedula: empresa.cedula,
        fecha_creacion: empresa.fecha_creacion,
        correo: empresa.correo,
        telefono: empresa.telefono,
        imagen: empresa.imagen,
        contrasenna: encryptedNewPassword,
        estado: 'Activo' // Asumimos que al actualizar la contraseña, la cuenta se activa
      };

      const response = await fetch(API_EMPRESA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          METHOD: 'PUT',
          ...empresaData,
        }),
      });

      const data = await response.json();
  
      if (response.ok) {
        alert('Contraseña actualizada exitosamente');
        setShowNewPasswordModal(false);
        navigate('/inicio');
      } else {
        alert(data.message || 'Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error al actualizar la información:', error);
      alert('Error al actualizar la información');
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1>Inicio de Sesión Empresas</h1>
        <form onSubmit={handleSubmit}>
          <label>Tipo de Cédula</label>
          <select name="tipoCedula" value={tipoCedula} onChange={(e) => setTipoCedula(e.target.value)} required>
            <option value="fisica">Física</option>
            <option value="juridica">Jurídica</option>
          </select>
          <label>Cédula</label>
          <input
            type="text"
            value={username}
            onChange={handleCedulaChange}
            required
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
      </div>

      {showNewPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Actualizar Contraseña</h2>
            <form onSubmit={handleNewPasswordSubmit}>
              <label>Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit">Actualizar Contraseña</button>
            </form>
            <p className="password-requirements">
              La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial (por ejemplo, !, @, #, $, %, ^, &, *).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
