import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CurvaRendimiento = ({ datos }) => {
  const [maxMeses, setMaxMeses] = useState(null);
  const opcionesAnios = [1, 2, 3, 4, 5, 6];

  const dataProcesada = useMemo(() => {
    if (!datos || !Array.isArray(datos)) return [];
    
    // Si hay filtro por año, lo convertimos a meses para la lógica interna
    const limiteMeses = maxMeses ? maxMeses : Infinity;

    return datos.map((obj, index) => {
      if (!obj || typeof obj !== 'object') return null;
      const nombreEmpresa = Object.keys(obj)[0];
      const listaOriginal = obj[nombreEmpresa];

      const puntosValidos = listaOriginal
        .filter(on => 
          on && 
          typeof on.vencimiento === 'number' && 
          typeof on.tir === 'number' &&
          on.tir > 0
        )
        .map(on => ({
          ...on,
          // Convertimos días a meses (30.42 es el promedio mensual exacto)
          mesesVencimiento: parseFloat((on.vencimiento / 30.42).toFixed(1))
        }))
        .filter(on => on.mesesVencimiento <= limiteMeses) // Aplicamos filtro en meses
        .sort((a, b) => a.mesesVencimiento - b.mesesVencimiento);

      return {
        nombre: nombreEmpresa,
        puntos: puntosValidos,
        color: `hsl(${(index * 137) % 360}, 70%, 50%)`
      };
    }).filter(empresa => empresa !== null && empresa.puntos.length > 0);
  }, [datos, maxMeses]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#333' }}>
            Tiker: {data.tiker}
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>
            Vencimiento: {data.mesesVencimiento} meses
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>
            TIR: <strong>{data.tir}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
      
      {/* Botonera de Filtros */}
      <div style={{ marginBottom: '25px' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Plazo máximo:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {opcionesAnios.map(anio => (
            <button 
              key={anio}
              onClick={() => setMaxMeses(anio * 12)} // Convertimos años a meses para el estado
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #007bff',
                backgroundColor: maxMeses === (anio * 12) ? '#007bff' : '#fff',
                color: maxMeses === (anio * 12) ? '#fff' : '#007bff',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {anio} {anio === 1 ? 'Año' : 'Años'}
            </button>
          ))}
          <button 
            onClick={() => setMaxMeses(null)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #6c757d',
              backgroundColor: maxMeses === null ? '#6c757d' : '#fff',
              color: maxMeses === null ? '#fff' : '#6c757d',
              cursor: 'pointer'
            }}
          >
            Ver Todo
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        {dataProcesada.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999', border: '1px dashed #ccc' }}>
            Sin datos en este rango.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="mesesVencimiento" 
                name="Plazo" 
                unit=" m" 
                domain={[0, 'dataMax']}
                label={{ value: 'Meses al vencimiento', position: 'bottom', offset: 20 }}
              />
              <YAxis 
                type="number" 
                dataKey="tir" 
                name="TIR" 
                unit="%" 
                domain={[0, 'auto']} 
                label={{ value: 'TIR %', angle: -90, position: 'insideLeft' }}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" height={50} />
              
              {dataProcesada.map((empresa) => (
                <Scatter
                  key={empresa.nombre}
                  name={empresa.nombre}
                  data={empresa.puntos}
                  fill={empresa.color}
                  line={{ stroke: empresa.color, strokeWidth: 2 }}
                  shape="circle"
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CurvaRendimiento;