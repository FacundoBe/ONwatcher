import React from 'react';
import './PriceToggle.css';

const PriceToggle = ({ precio, setPrecio }) => {
    const isVenta = precio === 'precio venta';

    const toggleSwitch = () => {
        const nuevoEstado = isVenta ? 'ultimo precio' : 'precio venta';
        setPrecio(nuevoEstado);
    };

    return (
        <div className="switch-container">
            <span className={`label-text ${isVenta ? 'active' : ''}`}>
                Último Precio
            </span>


            <div
                className={`switch-path ${isVenta ? 'active' : ''}`}
                onClick={toggleSwitch}
            >
                <div className="switch-handle" />
            </div>

            <span className={`label-text ${!isVenta ? 'active' : ''}`}>
                Precio Venta
            </span>
        </div>
    );
};

export default PriceToggle;