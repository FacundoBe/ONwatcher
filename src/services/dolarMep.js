export default async function obtenerDolarMep() {
  try {
    const respuesta = await fetch('https://dolarapi.com/v1/dolares/bolsa');
    const datos = await respuesta.json();
    
    console.log(`Compra: $${datos.compra}`);
    console.log(`Venta: $${datos.venta}`);
    console.log(`Última actualización: ${datos.fechaActualizacion}`);
    return datos.venta
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}
