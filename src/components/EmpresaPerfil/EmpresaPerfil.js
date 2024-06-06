import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import CryptoJS from 'crypto-js';
import './EmpresaPerfil.css';

const API_EMPRESA_URL = 'http://localhost/PlataformaCupones/PlataformaCuponesPHP/Backend%20PHP/Presentacion/EmpresaController.php';

function EmpresaPerfil() {
  const [empresa, setEmpresa] = useState({
    nombre: '',
    direccion: '',
    cedula: '',
    tipoCedula: 'fisica',
    fecha_creacion: '',
    correo: '',
    telefono: '',
    imagen: ''
  });
  const [contrasenna, setContrasenna] = useState('');
  const [confirmContrasenna, setConfirmContrasenna] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const empresaId = localStorage.getItem('empresa_id');
        const response = await fetch(`${API_EMPRESA_URL}?id=${empresaId}`);
        const data = await response.json();

        if (response.ok) {
          setEmpresa((prev) => ({
            ...prev,
            ...data,
            tipoCedula: data.cedula.length === 10 ? 'fisica' : 'juridica'
          }));
        } else {
          alert(data.message || 'Error al obtener la información de la empresa');
        }
      } catch (error) {
        console.error('Error al obtener la información de la empresa:', error);
        alert('Error al obtener la información de la empresa');
      }
    };

    fetchEmpresaData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  };

  const handleCedulaChange = (e) => {
    const { value } = e.target;
    let maskedValue = value.replace(/\D/g, ''); // Remove all non-numeric characters

    if (empresa.tipoCedula === 'fisica') {
      if (maskedValue.length > 2) maskedValue = maskedValue.slice(0, 2) + '-' + maskedValue.slice(2);
      if (maskedValue.length > 7) maskedValue = maskedValue.slice(0, 7) + '-' + maskedValue.slice(7);
      if (maskedValue.length > 12) maskedValue = maskedValue.slice(0, 12);
    } else {
      if (maskedValue.length > 2) maskedValue = maskedValue.slice(0, 2) + '-' + maskedValue.slice(2);
      if (maskedValue.length > 6) maskedValue = maskedValue.slice(0, 6) + '-' + maskedValue.slice(6);
      if (maskedValue.length > 13) maskedValue = maskedValue.slice(0, 13);
    }

    setEmpresa((prev) => ({ ...prev, cedula: maskedValue }));
  };

  const handleTelefonoChange = (e) => {
    const { value } = e.target;
    let maskedValue = value.replace(/\D/g, ''); // Remove all non-numeric characters

    if (maskedValue.length > 4) maskedValue = maskedValue.slice(0, 4) + '-' + maskedValue.slice(4);
    if (maskedValue.length > 9) maskedValue = maskedValue.slice(0, 9);

    setEmpresa((prev) => ({ ...prev, telefono: maskedValue }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contrasenna') {
      setContrasenna(value);
    } else if (name === 'confirmContrasenna') {
      setConfirmContrasenna(value);
    }

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=*!])(?=.{8,})/;
    if (!passwordPattern.test(value)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial.');
    } else {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!empresa.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!empresa.direccion) errors.direccion = 'La dirección es obligatoria';
    if (!empresa.cedula) errors.cedula = 'La cédula es obligatoria';
    if (empresa.tipoCedula === 'fisica' && empresa.cedula.length !== 12) {
      errors.cedula = 'La cédula física debe tener el formato 00-0000-0000';
    }
    if (empresa.tipoCedula === 'juridica' && empresa.cedula.length !== 13) {
      errors.cedula = 'La cédula jurídica debe tener el formato 00-000-000000';
    }
    if (!empresa.fecha_creacion) errors.fecha_creacion = 'La fecha de creación es obligatoria';
    if (!empresa.correo) errors.correo = 'El correo electrónico es obligatorio';
    if (!empresa.telefono) errors.telefono = 'El teléfono es obligatorio';
    if (empresa.telefono.length !== 9) {
      errors.telefono = 'El teléfono debe tener el formato 0000-0000';
    }
    if (!contrasenna) {
      errors.contrasenna = 'La contraseña es obligatoria, si desea cambiarla agregue una nueva, de lo contrario puede utilizar la actual.';
    } else if (contrasenna !== confirmContrasenna) {
      errors.contrasenna = 'Las contraseñas no coinciden';
    }
    if (passwordError) {
      errors.contrasenna = passwordError;
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const encryptedPassword = contrasenna ? CryptoJS.SHA256(contrasenna).toString() : null;

    const empresaData = {
      nombre: empresa.nombre,
      direccion: empresa.direccion,
      cedula: empresa.cedula,
      tipoCedula: empresa.tipoCedula,
      fecha_creacion: empresa.fecha_creacion,
      correo: empresa.correo,
      telefono: empresa.telefono,
      imagen: empresa.imagen,
      contrasenna: encryptedPassword,
      estado: empresa.estado,
      id: localStorage.getItem('empresa_id')
    };

    // Console log to display empresaData
    console.log('empresaData:', empresaData);

    try {
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

      const textResponse = await response.text(); // Get the raw response as text
      console.log('Raw response:', textResponse); // Log the raw response

      const data = JSON.parse(textResponse); // Parse the response as JSON

      if (response.ok) {
        alert('Información actualizada exitosamente');
        navigate('/inicio');
      } else {
        alert(data.message || 'Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error al actualizar la información:', error);
      alert('Error al actualizar la información');
    }
  };

  return (
    <div className="empresa-perfil">
      <Header />
      {empresa.imagen && <img src={empresa.imagen} alt="Empresa" className="empresa-imagen-grande" />}
      <h1>Perfil de Empresa</h1>
      <form onSubmit={handleSubmit}>
        <label>Nombre Empresa</label>
        <input
          type="text"
          name="nombre"
          value={empresa.nombre}
          onChange={handleChange}
          maxLength="200"
          required
          autoComplete="organization"
        />
        {formErrors.nombre && <p className="error">{formErrors.nombre}</p>}
        <label>Dirección Física</label>
        <input
          type="text"
          name="direccion"
          value={empresa.direccion}
          onChange={handleChange}
          maxLength="200"
          required
          autoComplete="street-address"
        />
        {formErrors.direccion && <p className="error">{formErrors.direccion}</p>}
        <label>Tipo de Cédula</label>
        <select name="tipoCedula" value={empresa.tipoCedula} onChange={handleChange} required>
          <option value="fisica">Física</option>
          <option value="juridica">Jurídica</option>
        </select>
        {formErrors.tipoCedula && <p className="error">{formErrors.tipoCedula}</p>}
        <label>Cédula</label>
        <input
          type="text"
          name="cedula"
          value={empresa.cedula}
          onChange={handleCedulaChange}
          required
          autoComplete="off"
        />
        {formErrors.cedula && <p className="error">{formErrors.cedula}</p>}
        <label>Fecha de Creación</label>
        <input
          type="date"
          name="fecha_creacion"
          value={empresa.fecha_creacion}
          onChange={handleChange}
          required
          autoComplete="bday"
        />
        {formErrors.fecha_creacion && <p className="error">{formErrors.fecha_creacion}</p>}
        <label>Correo Electrónico</label>
        <input
          type="email"
          name="correo"
          value={empresa.correo}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        {formErrors.correo && <p className="error">{formErrors.correo}</p>}
        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={empresa.telefono}
          onChange={handleTelefonoChange}
          required
          autoComplete="tel"
        />
        {formErrors.telefono && <p className="error">{formErrors.telefono}</p>}
        <label>Contraseña</label>
        <input
          type="password"
          name="contrasenna"
          value={contrasenna}
          onChange={handlePasswordChange}
          autoComplete="new-password"
        />
        {formErrors.contrasenna && <p className="error">{formErrors.contrasenna}</p>}
        <label>Confirmar Contraseña</label>
        <input
          type="password"
          name="confirmContrasenna"
          value={confirmContrasenna}
          onChange={handlePasswordChange}
          autoComplete="new-password"
        />
        {formErrors.confirmContrasenna && <p className="error">{formErrors.confirmContrasenna}</p>}
        {passwordError && <p className="error">{passwordError}</p>}
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default EmpresaPerfil;
