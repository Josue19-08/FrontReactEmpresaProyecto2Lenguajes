import React, { useEffect, useState, useCallback } from 'react';
import Header from '../Header/Header';
import './Inicio.css';
import sinImagen from '../../img/sinImagen.png';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const API_CUPON_URL = 'http://localhost/PlataformaCupones/PlataformaCuponesPHP/Backend%20PHP/Presentacion/CuponController.php';
const API_CATEGORIA_URL = 'http://localhost/PlataformaCupones/PlataformaCuponesPHP/Backend%20PHP/Presentacion/CategoriaController.php';
const API_PROMOCION_URL = 'http://localhost/PlataformaCupones/PlataformaCuponesPHP/Backend%20PHP/Presentacion/PromocionController.php';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh', // Ajustamos el tamaño máximo del modal
  overflowY: 'auto', // Permitimos el scroll vertical
};

function ChildModal({ open, handleClose, cuponId, fetchPromociones, selectedCupon }) {
  const [nuevaPromocion, setNuevaPromocion] = useState({
    cupon_id: cuponId,
    descripcion: '',
    fecha_inicio: '',
    fecha_vencimiento: '',
    descuento: 0,
    estado: 'Activo'
  });

  useEffect(() => {
    if (cuponId) {
      setNuevaPromocion(prevState => ({ ...prevState, cupon_id: cuponId }));
    }
  }, [cuponId]);

  const handleNuevaPromocionChange = (field, value) => {
    setNuevaPromocion({ ...nuevaPromocion, [field]: value });
  };

  const validarPromocion = (promocion) => {
    const { descripcion, fecha_inicio, fecha_vencimiento, descuento } = promocion;
    if (!descripcion) {
      alert('La descripción no debe estar vacía');
      return false;
    }
    if (!fecha_inicio || new Date(fecha_inicio) < new Date(selectedCupon.fecha_inicio) || new Date(fecha_inicio) > new Date(selectedCupon.fecha_vencimiento)) {
      alert('La fecha de inicio debe estar dentro del rango del cupón');
      return false;
    }
    if (!fecha_vencimiento || new Date(fecha_vencimiento) <= new Date(fecha_inicio) || new Date(fecha_vencimiento) > new Date(selectedCupon.fecha_vencimiento)) {
      alert('La fecha de vencimiento debe ser mayor a la fecha de inicio y dentro del rango del cupón');
      return false;
    }
    if (descuento <= 0) {
      alert('El descuento debe ser mayor a cero');
      return false;
    }
    return true;
  };

  const crearPromocion = async () => {
    if (!validarPromocion(nuevaPromocion)) {
      return;
    }

    const dataToSend = {
      METHOD: 'POST',
      ...nuevaPromocion
    };

    console.log('Datos que se envían:', JSON.stringify(dataToSend, null, 2)); // Mostrar los datos en la consola

    try {
      const response = await fetch(API_PROMOCION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
      fetchPromociones(cuponId);
      handleClose();
    } catch (error) {
      console.error('Error creando la promoción:', error);
      alert('Hubo un error al crear la promoción');
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ ...style, width: 400 }}>
        <Typography variant="h6" component="h2">
          Crear Promoción
        </Typography> 
        <Typography variant="h6" component="h4">
          Descripción
        </Typography> 
        <input
          type="text"
          placeholder="Descripción"
          value={nuevaPromocion.descripcion}
          onChange={(e) => handleNuevaPromocionChange('descripcion', e.target.value)}
        />
        <Typography variant="h6" component="h4">
          Fecha inicio promoción
        </Typography>
        <input
          type="date"
          value={nuevaPromocion.fecha_inicio}
          onChange={(e) => handleNuevaPromocionChange('fecha_inicio', e.target.value)}
        />
        <Typography variant="h6" component="h4">
          Fecha vencimiento promoción
        </Typography>
        <input
          type="date"
          value={nuevaPromocion.fecha_vencimiento}
          onChange={(e) => handleNuevaPromocionChange('fecha_vencimiento', e.target.value)}
        />
        <Typography variant="h6" component="h4">
          Porcentaje de descuento %
        </Typography>
        <input
          type="number"
          placeholder="Descuento"
          value={nuevaPromocion.descuento}
          onChange={(e) => handleNuevaPromocionChange('descuento', e.target.value)}
        />
        <Button onClick={crearPromocion}>Crear Promoción</Button>
      </Box>
    </Modal>
  );
}

function Inicio() {
  const [categorias, setCategorias] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [nuevoCupon, setNuevoCupon] = useState({
    id: null,
    codigo: '',
    nombre: '',
    precio: 0,
    empresa_id: localStorage.getItem('empresa_id'),
    estado: 'Activo',
    imagen: '',
    categoria_id: '',
    fecha_inicio: '',
    fecha_vencimiento: '',
    fecha_creacion: new Date().toISOString().split('T')[0]
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [selectedCupon, setSelectedCupon] = useState(null);

  const empresaId = localStorage.getItem('empresa_id');

  const fetchCupones = useCallback(async () => {
    try {
      const response = await fetch(`${API_CUPON_URL}?empresa_id=${empresaId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCupones(data);
    } catch (error) {
      console.error('Error fetching cupones:', error);
    }
  }, [empresaId]);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch(API_CATEGORIA_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  }, []);

  const fetchPromociones = useCallback(async (cuponId) => {
    try {
      const response = await fetch(`${API_PROMOCION_URL}?cupon_id=${cuponId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPromociones(data);
    } catch (error) {
      console.error('Error fetching promociones:', error);
    }
  }, []);

  useEffect(() => {
    fetchCupones();
    fetchCategorias();
  }, [fetchCupones, fetchCategorias]);

  const handleInputChange = (id, field, value) => {
    setCupones(cupones.map(cupon =>
      cupon.id === id ? { ...cupon, [field]: value } : cupon
    ));
  };

  const handleNuevoCuponChange = (field, value) => {
    setNuevoCupon({ ...nuevoCupon, [field]: value });
  };

  const validarCupon = (cupon) => {
    if (!cupon.codigo) {
      alert('El código no debe estar vacío');
      return false;
    }
    if (!cupon.nombre) {
      alert('El nombre no debe estar vacío');
      return false;
    }
    if (cupon.precio <= 0) {
      alert('El precio debe ser mayor a cero');
      return false;
    }
    if (!cupon.categoria_id || isNaN(cupon.categoria_id)) {
      alert('Debe seleccionar una categoría válida');
      return false;
    }
    if (!cupon.fecha_inicio || cupon.fecha_inicio < cupon.fecha_creacion) {
      alert('La fecha de inicio debe ser igual o mayor a la fecha de creación');
      return false;
    }
    if (!cupon.fecha_vencimiento || cupon.fecha_vencimiento <= cupon.fecha_inicio) {
      alert('La fecha de vencimiento debe ser mayor a la fecha de inicio');
      return false;
    }
    if (!cupon.imagen) {
      alert('La imagen no debe estar vacía');
      return false;
    }
    return true;
  };

  const actualizarCupon = async (cupon) => {
    if (!validarCupon(cupon)) {
      return;
    }

    const dataToSend = {
      METHOD: 'PUT',
      cupon: cupon
    };

    console.log('Datos que se envían:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await fetch(API_CUPON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
      fetchCupones();
    } catch (error) {
      console.error('Error actualizando el cupón:', error);
      alert('Hubo un error al actualizar el cupón');
    }
  };

  const crearCupon = async () => {
    if (!validarCupon(nuevoCupon)) {
      return;
    }

    const dataToSend = {
      METHOD: 'POST',
      ...nuevoCupon,
      precio: Number(nuevoCupon.precio)
    };

    console.log('Datos que se envían:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await fetch(API_CUPON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
      fetchCupones();
      setNuevoCupon({
        id: null,
        codigo: '',
        nombre: '',
        precio: 0,
        empresa_id: localStorage.getItem('empresa_id'),
        estado: 'Activo',
        imagen: '',
        categoria_id: '',
        fecha_inicio: '',
        fecha_vencimiento: '',
        fecha_creacion: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creando el cupón:', error);
      alert('Hubo un error al crear el cupón');
    }
  };

  const eliminarCupon = async (id) => {
    const dataToSend = {
      METHOD: 'DELETE',
      id: id
    };

    console.log('Datos que se envían para eliminar:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await fetch(API_CUPON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
      fetchCupones();
    } catch (error) {
      console.error('Error eliminando el cupón:', error);
      alert('Hubo un error al eliminar el cupón');
    }
  };

  const eliminarPromocion = async (id) => {
    const dataToSend = {
      METHOD: 'DELETE',
      id: id
    };

    console.log('Datos que se envían para eliminar promoción:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await fetch(API_PROMOCION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
      fetchPromociones(selectedCupon.id);
    } catch (error) {
      console.error('Error eliminando la promoción:', error);
      alert('Hubo un error al eliminar la promoción');
    }

  };

  const actualizarEstadoPromocion = async (promocionId, nuevoEstado) => {
    // Encuentra la promoción que necesitas actualizar
    const promocion = promociones.find(promo => promo.id === promocionId);

    // Si no se encuentra la promoción, muestra un error
    if (!promocion) {
        alert('Promoción no encontrada');
        return;
    }

    // Actualiza el estado de la promoción
    const dataToSend = {
        METHOD: 'PUT',
        id: promocion.id,
        cupon_id: promocion.cupon_id,
        descripcion: promocion.descripcion,
        fecha_inicio: promocion.fecha_inicio,
        fecha_vencimiento: promocion.fecha_vencimiento,
        descuento: promocion.descuento,
        estado: nuevoEstado
    };

    console.log('Datos que se envían:', JSON.stringify(dataToSend));

    try {
        const response = await fetch(API_PROMOCION_URL, {
            method: 'POST', // Utilizando POST para enviar una solicitud PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        console.log('Estado de la respuesta:', response.status);
        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        alert(result.message);
        fetchPromociones(selectedCupon.id);
    } catch (error) {
        console.error('Error actualizando el estado de la promoción:', error);
        alert('Hubo un error al actualizar el estado de la promoción');
    }
};




  

  const openModal = (cupon) => {
    setSelectedCupon(cupon);
    fetchPromociones(cupon.id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setPromociones([]);
  };

  const openChildModal = () => {
    setChildModalOpen(true);
  };

  const closeChildModal = () => {
    setChildModalOpen(false);
  };

  return (
    <div className="inicio">
      <Header />
      <h1>Nuestros Cupones</h1>
      <div className="cupones-list">
        {cupones.map(cupon => (
          <div key={cupon.id} className="cupon">
            {cupon.imagen && <img src={cupon.imagen} alt={cupon.nombre} className="cupon-imagen" />}
            <h2>{cupon.nombre}</h2>
            <label>Código:</label>
            <input
              type="text"
              value={cupon.codigo}
              onChange={(e) => handleInputChange(cupon.id, 'codigo', e.target.value)}
            />
            <label>Precio:</label>
            <input
              type="number"
              value={cupon.precio}
              onChange={(e) => handleInputChange(cupon.id, 'precio', e.target.value)}
            />
            <label>Estado:</label>
            <select
              value={cupon.estado}
              onChange={(e) => handleInputChange(cupon.id, 'estado', e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <label>Categoría:</label>
            <select
              value={cupon.categoria_id}
              onChange={(e) => handleInputChange(cupon.id, 'categoria_id', e.target.value)}
            >
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={cupon.fecha_inicio}
              onChange={(e) => handleInputChange(cupon.id, 'fecha_inicio', e.target.value)}
            />
            <label>Fecha Vencimiento:</label>
            <input
              type="date"
              value={cupon.fecha_vencimiento}
              onChange={(e) => handleInputChange(cupon.id, 'fecha_vencimiento', e.target.value)}
            />
            <label>Fecha Creación:</label>
            <input
              type="date"
              value={cupon.fecha_creacion}
              readOnly
            />
            <label>Imagen:</label>
            <input
              type="text"
              value={cupon.imagen}
              onChange={(e) => handleInputChange(cupon.id, 'imagen', e.target.value)}
            />
            <button onClick={() => actualizarCupon(cupon)}>Actualizar</button>
            <button onClick={() => eliminarCupon(cupon.id)}>Eliminar</button>
            <button onClick={() => openModal(cupon)}>Aplicar promoción</button>
          </div>
        ))}

        <div className="cupon">
          <img src={sinImagen} alt="Sin Imagen" className="cupon-imagen" />
          <h2>Nuevo Cupón</h2>
          <label>Código:</label>
          <input
            type="text"
            value={nuevoCupon.codigo}
            onChange={(e) => handleNuevoCuponChange('codigo', e.target.value)}
          />
          <label>Nombre:</label>
          <input
            type="text"
            value={nuevoCupon.nombre}
            onChange={(e) => handleNuevoCuponChange('nombre', e.target.value)}
          />
          <label>Precio:</label>
          <input
            type="number"
            value={nuevoCupon.precio}
            onChange={(e) => handleNuevoCuponChange('precio', e.target.value)}
          />
          <label>Estado:</label>
          <select
            value={nuevoCupon.estado}
            onChange={(e) => handleNuevoCuponChange('estado', e.target.value)}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <label>Categoría:</label>
          <select
            value={nuevoCupon.categoria_id}
            onChange={(e) => handleNuevoCuponChange('categoria_id', e.target.value)}
          >
            <option value="">Seleccione Categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={nuevoCupon.fecha_inicio}
            onChange={(e) => handleNuevoCuponChange('fecha_inicio', e.target.value)}
          />
          <label>Fecha Vencimiento:</label>
          <input
            type="date"
            value={nuevoCupon.fecha_vencimiento}
            onChange={(e) => handleNuevoCuponChange('fecha_vencimiento', e.target.value)}
          />
          <label>Fecha Creación:</label>
          <input
            type="date"
            value={nuevoCupon.fecha_creacion}
            readOnly
          />
          <label>Imagen:</label>
          <input
            type="text"
            value={nuevoCupon.imagen}
            onChange={(e) => handleNuevoCuponChange('imagen', e.target.value)}
          />
          <button onClick={crearCupon}>Crear Cupón</button>
        </div>
      </div>

      <Modal
  open={modalIsOpen}
  onClose={closeModal}
  aria-labelledby="parent-modal-title"
  aria-describedby="parent-modal-description"
  className="modal-overlay"
>
  <Box sx={{ ...style, width: 600 }} className="modal">
    <ul>
      <Typography variant="h6" component="h2" id="parent-modal-title" style={{ color: 'white' }}>
        Promociones para {selectedCupon && selectedCupon.nombre}
      </Typography>
      <Button onClick={openChildModal} sx={{ width: '100%', marginBottom: '20px' }} className="modal-button">Crear Promoción</Button>
      {promociones.map((promocion, index) => (
        <li key={promocion.id || index} style={{ marginBottom: '20px' }}>
          <Box sx={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#fff' }}>
            <Typography variant="body1"><strong>Descripción:</strong> {promocion.descripcion}</Typography>
            <Typography variant="body2"><strong>Fecha Inicio:</strong> {promocion.fecha_inicio}</Typography>
            <Typography variant="body2"><strong>Fecha Vencimiento:</strong> {promocion.fecha_vencimiento}</Typography>
            <Typography variant="body2"><strong>Descuento:</strong> {promocion.descuento}%</Typography>
            <Typography variant="body2"><strong>Estado:</strong> {promocion.estado}</Typography>
            <Button onClick={() => eliminarPromocion(promocion.id)} sx={{ width: '100%', marginTop: '10px' }} className="modal-button">Eliminar Promoción</Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button onClick={() => actualizarEstadoPromocion(promocion.id, 'Activo')} sx={{ flex: '0 1 auto', fontSize: '10px', padding: '2px 5px', minWidth: 'auto', minHeight: 'auto' }} className="modal-button">Habilitar</Button>
              <Button onClick={() => actualizarEstadoPromocion(promocion.id, 'Inactivo')} sx={{ flex: '0 1 auto', fontSize: '10px', padding: '2px 5px', minWidth: 'auto', minHeight: 'auto' }} className="modal-button">Desactivar</Button>
            </Box>
          </Box>
        </li>
      ))}
    </ul>
  </Box>
</Modal>






      <ChildModal
        open={childModalOpen}
        handleClose={closeChildModal}
        cuponId={selectedCupon ? selectedCupon.id : null}
        fetchPromociones={fetchPromociones}
        selectedCupon={selectedCupon}
      />
    </div>
  );
}

export default Inicio;
