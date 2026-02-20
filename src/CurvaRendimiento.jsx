import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CurvaRendimiento = ({ datos }) => {
  const [maxMeses, setMaxMeses] = useState(null);
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
  const [unidadPlazo, setUnidadPlazo] = useState('meses');

  // --- Estados para la carga manual ---
  const [datosManuales, setDatosManuales] = useState([]);
  const [inputEmpresa, setInputEmpresa] = useState('');
  const [inputTicker, setInputTicker] = useState('');
  const [inputTir, setInputTir] = useState('');
  const [inputDias, setInputDias] = useState('');

  const opcionesAnios = [1, 2, 3, 4, 5, 6];

  const handleAgregarManual = () => {
    if (!inputEmpresa.trim() || !inputTicker.trim() || !inputTir || !inputDias) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const nuevaON = {
      id: Date.now(),
      empresa: inputEmpresa.trim(),
      data: {
        tiker: inputTicker.trim().toUpperCase(),
        tir: parseFloat(inputTir),
        vencimiento: parseInt(inputDias, 10),
      }
    };

    setDatosManuales(prev => [...prev, nuevaON]);
    setInputTicker('');
    setInputTir('');
    setInputDias('');
  };

  const handleEliminarManual = (id) => {
    setDatosManuales(prev => prev.filter(item => item.id !== id));
  };

  const datosCombinados = useMemo(() => {
    const base = (datos || []).map(d => {
      const emp = Object.keys(d)[0];
      return { [emp]: [...d[emp]] };
    });

    datosManuales.forEach(({ empresa, data }) => {
      const empresaExistente = base.find(d => Object.keys(d)[0] === empresa);
      if (empresaExistente) {
        empresaExistente[empresa].push(data);
      } else {
        base.push({ [empresa]: [data] });
      }
    });

    return base;
  }, [datos, datosManuales]);

  const todasLasEmpresas = useMemo(() => {
    if (!datosCombinados || !Array.isArray(datosCombinados)) return [];
    return datosCombinados.map(obj => Object.keys(obj)[0]);
  }, [datosCombinados]);

  const { dataProcesada, descartados } = useMemo(() => {
    if (!datosCombinados || !Array.isArray(datosCombinados)) return { dataProcesada: [], descartados: [] };
    
    const limiteMeses = maxMeses ? maxMeses : Infinity;
    const listaDescartados = [];

    const procesados = datosCombinados.map((obj, index) => {
      const nombreEmpresa = Object.keys(obj)[0];
      const listaOriginal = obj[nombreEmpresa];
      
      // Si la empresa no está seleccionada, no procesamos puntos pero SÍ podemos detectar descartados
      const estaFiltrada = empresasSeleccionadas.length > 0 && !empresasSeleccionadas.includes(nombreEmpresa);

      const puntosValidos = [];
      
      listaOriginal.forEach(on => {
        const esValido = on && typeof on.vencimiento === 'number' && typeof on.tir === 'number' && on.tir > 0;

        if (esValido) {
          if (!estaFiltrada) {
            const meses = on.vencimiento / 30.42;
            if (meses <= limiteMeses) {
              puntosValidos.push({
                ...on,
                plazoEje: unidadPlazo === 'meses' ? parseFloat(meses.toFixed(1)) : parseFloat((meses / 12).toFixed(2)),
                mesesOriginal: meses
              });
            }
          }
        } else {
          listaDescartados.push({
            ...on,
            empresa: nombreEmpresa,
            razon: !on?.vencimiento ? 'Sin vencimiento' : (on?.tir <= 0 ? 'TIR <= 0' : 'Datos incompletos')
          });
        }
      });

      if (estaFiltrada) return null;

      return {
        nombre: nombreEmpresa,
        puntos: puntosValidos.sort((a, b) => a.plazoEje - b.plazoEje),
        color: `hsl(${(index * 137) % 360}, 70%, 50%)`
      };
    }).filter(empresa => empresa !== null && empresa.puntos.length > 0);

    return { dataProcesada: procesados, descartados: listaDescartados };
  }, [datosCombinados, maxMeses, empresasSeleccionadas, unidadPlazo]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#333' }}>{data.tiker}</p>
          <p style={{ margin: '0', fontSize: '13px' }}>Vencimiento: {data.plazoEje} {unidadPlazo}</p>
          <p style={{ margin: '0', fontSize: '13px' }}>TIR: <strong>{data.tir}%</strong></p>
        </div>
      );
    }
    return null;
  };

  const inputStyle = { padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '130px', fontSize: '13px' };
  const labelStyle = { display: 'block', fontSize: '11px', color: '#555', marginBottom: '3px', fontWeight: 'bold' };

  return (
    <div style={{ width: '100%', backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      
      {/* Panel de Carga Manual */}
      <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f4f7f6', borderRadius: '8px', border: '1px solid #e1e5e8' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>➕ Agregar ON Manualmente</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '15px' }}>
          <div><label style={labelStyle}>Empresa</label><input style={inputStyle} value={inputEmpresa} onChange={e => setInputEmpresa(e.target.value)} placeholder="YPF" /></div>
          <div><label style={labelStyle}>Ticker</label><input style={inputStyle} value={inputTicker} onChange={e => setInputTicker(e.target.value)} placeholder="YCA6O" /></div>
          <div><label style={labelStyle}>TIR (%)</label><input style={inputStyle} type="number" value={inputTir} onChange={e => setInputTir(e.target.value)} placeholder="8.5" /></div>
          <div><label style={labelStyle}>Venc. (Días)</label><input style={inputStyle} type="number" value={inputDias} onChange={e => setInputDias(e.target.value)} placeholder="365" /></div>
          <button onClick={handleAgregarManual} style={{ padding: '7px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Agregar</button>
        </div>

        {datosManuales.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {datosManuales.map(on => (
              <div key={on.id} style={{ fontSize: '12px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{  color: 'black'}}><strong>{on.data.tiker}</strong> ({on.empresa})</span>
                <button onClick={() => handleEliminarManual(on.id)} style={{ border: 'none', background: '#ff4d4f', color: 'white', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de Controles */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Eje X en:</p>
          <div style={{ display: 'flex', background: '#eee', borderRadius: '8px', padding: '3px', color: '#222222' }}>
            <button onClick={() => setUnidadPlazo('meses')} style={{color:  unidadPlazo === 'meses' ? '#262626' : '#6b6a6a', padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: unidadPlazo === 'meses' ? '#fff' : 'transparent', fontWeight: unidadPlazo === 'meses' ? 'bold' : 'normal' }}>Meses</button>
            <button onClick={() => setUnidadPlazo('años')} style={{ color: unidadPlazo === 'meses' ? '#6b6a6a':'#262626'  , padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: unidadPlazo === 'años' ? '#fff' : 'transparent', fontWeight: unidadPlazo === 'años' ? 'bold' : 'normal' }}>Años</button>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Plazo máximo:</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {opcionesAnios.map(anio => (
              <button key={anio} onClick={() => setMaxMeses(anio * 12)} style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid #007bff', backgroundColor: maxMeses === (anio * 12) ? '#007bff' : '#fff', color: maxMeses === (anio * 12) ? '#fff' : '#007bff', cursor: 'pointer', fontSize: '11px' }}>{anio}A</button>
            ))}
            <button onClick={() => setMaxMeses(null)} style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid #6c757d', backgroundColor: maxMeses === null ? '#6c757d' : '#fff', color: maxMeses === null ? '#fff' : '#6c757d', cursor: 'pointer', fontSize: '11px' }}>Todos</button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Empresas:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {todasLasEmpresas.map(emp => (
              <button key={emp} onClick={() => setEmpresasSeleccionadas(prev => prev.includes(emp) ? prev.filter(e => e !== emp) : [...prev, emp])} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: empresasSeleccionadas.includes(emp) ? '#28a745' : '#fff', color: empresasSeleccionadas.includes(emp) ? '#fff' : '#444', cursor: 'pointer', fontSize: '11px' }}>{emp}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ width: '100%', height: '450px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" dataKey="plazoEje" name="Plazo" unit={unidadPlazo === 'meses' ? ' m' : ' a'} domain={[0, 'auto']} />
            <YAxis type="number" dataKey="tir" name="TIR" unit="%" domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend verticalAlign="top" height={50} />
            {dataProcesada.map((empresa) => (
              <Scatter key={empresa.nombre} name={empresa.nombre} data={empresa.puntos} fill={empresa.color} line={{ stroke: empresa.color, strokeWidth: 2 }} shape="circle" />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* --- SECCIÓN RESTAURADA: ONs Descartadas --- */}
      {descartados.length > 0 && (
        <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h4 style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>ONs no incluidas (TIR ≤ 0 o datos incompletos):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {descartados.map((on, i) => (
              <div 
                key={i} 
                title={on.razon}
                style={{ fontSize: '11px', backgroundColor: '#fdecea', color: '#d93025', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fad2cf' }}
              >
                <strong>{on.tiker || 'S/T'}</strong> ({on.empresa})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurvaRendimiento;