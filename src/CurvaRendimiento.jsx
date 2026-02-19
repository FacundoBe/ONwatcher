import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CurvaRendimiento = ({ datos }) => {
  const [maxMeses, setMaxMeses] = useState(null);
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
  const [unidadPlazo, setUnidadPlazo] = useState('meses'); // Nuevo: 'meses' o 'años'

  const opcionesAnios = [1, 2, 3, 4, 5, 6];

  const todasLasEmpresas = useMemo(() => {
    if (!datos || !Array.isArray(datos)) return [];
    return datos.map(obj => Object.keys(obj)[0]);
  }, [datos]);

  const dataProcesada = useMemo(() => {
    if (!datos || !Array.isArray(datos)) return [];
    const limiteMeses = maxMeses ? maxMeses : Infinity;

    return datos.map((obj, index) => {
      const nombreEmpresa = Object.keys(obj)[0];
      if (empresasSeleccionadas.length > 0 && !empresasSeleccionadas.includes(nombreEmpresa)) return null;

      const listaOriginal = obj[nombreEmpresa];
      const puntosValidos = listaOriginal
        .filter(on => on && typeof on.vencimiento === 'number' && typeof on.tir === 'number' && on.tir > 0)
        .map(on => {
          const meses = on.vencimiento / 30.42;
          return {
            ...on,
            // Guardamos el valor calculado según la unidad seleccionada
            plazoEje: unidadPlazo === 'meses'
              ? parseFloat(meses.toFixed(1))
              : parseFloat((meses / 12).toFixed(2)),
            mesesOriginal: meses
          };
        })
        .filter(on => on.mesesOriginal <= limiteMeses)
        .sort((a, b) => a.plazoEje - b.plazoEje);

      return {
        nombre: nombreEmpresa,
        puntos: puntosValidos,
        color: `hsl(${(index * 137) % 360}, 70%, 50%)`
      };
    }).filter(empresa => empresa !== null && empresa.puntos.length > 0);
  }, [datos, maxMeses, empresasSeleccionadas, unidadPlazo]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#333' }}>{data.tiker}</p>
          <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>
            Vencimiento: {data.plazoEje} {unidadPlazo}
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>TIR: <strong>{data.tir}%</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '12px', fontFamily: 'sans-serif' }}>

      {/* Panel de Controles */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Selector de Unidad (Meses/Años) */}
        <div style={{ minWidth: '150px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Ver eje X en:</p>
          <div style={{ display: 'flex', background: '#eee', borderRadius: '8px', padding: '3px', width: 'fit-content' }}>
            <button
              onClick={() => setUnidadPlazo('meses')}
              style={{ padding: '5px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', color: unidadPlazo === 'meses' ? '#2e2d2c' : '#929290', backgroundColor: unidadPlazo === 'meses' ? '#fff' : 'transparent', fontWeight: unidadPlazo === 'meses' ? 'bold' : 'normal', boxShadow: unidadPlazo === 'meses' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
            >Meses</button>
            <button
              onClick={() => setUnidadPlazo('años')}
              style={{ padding: '5px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', color: unidadPlazo === 'años' ? '#2e2d2c' : '#929290', backgroundColor: unidadPlazo === 'años' ? '#fff' : 'transparent', fontWeight: unidadPlazo === 'años' ? 'bold' : 'normal', boxShadow: unidadPlazo === 'años' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
            >Años</button>
          </div>
        </div>

        {/* Filtro de Tiempo Máximo */}
        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Plazo máximo:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {opcionesAnios.map(anio => (
              <button
                key={anio}
                onClick={() => setMaxMeses(anio * 12)}
                style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #007bff', backgroundColor: maxMeses === (anio * 12) ? '#007bff' : '#fff', color: maxMeses === (anio * 12) ? '#fff' : '#007bff', cursor: 'pointer', fontSize: '12px' }}
              >
                {anio} {anio === 1 ? 'Año' : 'Años'}
              </button>
            ))}
            <button onClick={() => setMaxMeses(null)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #6c757d', backgroundColor: maxMeses === null ? '#6c757d' : '#fff', color: maxMeses === null ? '#fff' : '#6c757d', cursor: 'pointer', fontSize: '12px' }}>Todos</button>
          </div>
        </div>

        {/* Filtro de Empresas */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Empresas:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {todasLasEmpresas.map(emp => (
              <button
                key={emp}
                onClick={() => setEmpresasSeleccionadas(prev => prev.includes(emp) ? prev.filter(e => e !== emp) : [...prev, emp])}
                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: empresasSeleccionadas.includes(emp) ? '#28a745' : '#fff', color: empresasSeleccionadas.includes(emp) ? '#fff' : '#444', cursor: 'pointer', fontSize: '11px' }}
              >
                {emp}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        {dataProcesada.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999', border: '1px dashed #ccc' }}>
            Sin datos seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                dataKey="plazoEje"
                name="Plazo"
                unit={unidadPlazo === 'meses' ? ' m' : ' a'}
                domain={[0, 'auto']}
                label={{
                  value: unidadPlazo === 'meses' ? 'Meses al vencimiento' : 'Años al vencimiento',
                  position: 'bottom',
                  offset: 20
                }}
              />
              <YAxis
                type="number"
                dataKey="tir"
                name="TIR"
                unit="%"
                domain={['auto', 'auto']}
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