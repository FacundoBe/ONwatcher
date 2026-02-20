
const SkeletonCurva = () => {
  // Animación de pulso/brillo
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
    borderRadius: '8px'
  };

  const keyframes = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  return (
    <div style={{ width: '100%', backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '12px' }}>
      <style>{keyframes}</style>
      
      {/* Skeleton del Formulario de Carga */}
      <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f4f7f6', borderRadius: '8px', height: '100px', ...shimmerStyle }} />

      {/* Skeleton de los Controles (Eje X, Filtros, Empresas) */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '35px' }}>
        <div style={{ width: '150px', height: '60px', ...shimmerStyle }} />
        <div style={{ width: '250px', height: '60px', ...shimmerStyle }} />
        <div style={{ flex: 1, height: '60px', ...shimmerStyle }} />
      </div>

      {/* Skeleton del Gráfico */}
      <div style={{ 
        width: 'auto', 
        height: '450px', 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '20px', 
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '12px'
      }}>
        {/* Simulamos unas barras o puntos de carga en el área del gráfico */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              height: `${Math.random() * 60 + 20}%`, 
              opacity: 0.5,
              ...shimmerStyle 
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCurva;