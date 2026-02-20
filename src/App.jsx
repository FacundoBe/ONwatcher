
import { useEffect, useState } from 'react'
import { getBymaData } from './services/onData'
import { calculaRendimientoOnPuente } from './services/calculadoraOnPuente'
import { onsAAA, resultsOn } from './JSONS/OnsAAA'
import CurvaRendimiento from './CurvaRendimiento'
import './App.css'

function App() {

  const [tir, setTir] = useState(0)
  const [rendimientoOns, setRendimientoOns] = useState({})



  async function obtenerDatosDeByma() {

    const bymaData = await getBymaData()

    if (bymaData.length > 0) console.log(" Datos obtenidos  de BYMA ...", bymaData)
    else console.log("No se pudo obtener los datos de precios y volumenes de BYMA")

    return bymaData
  }


  function obtenerPrecioYDurationDelaOn(bymaOnsData, on) {
    // on es un String con el tiker de la obligacion negociable de la ON que se desea obtener los precios 
    const onData = bymaOnsData.filter(papel => papel?.symbol === on)[0]
    if (onData?.trade != undefined) {
      //console.log(onData)
      return { ultimoPrecio: onData.trade, precioCompra: onData.bidPrice, precioVenta: onData.offerPrice, vencimiento: onData.daysToMaturity }
    }
    else console.log(`No se puedo obtener el precio de ${on} de BYMA revisa el tiker`)
    return null
  }



  async function getPriceTirDuration(bymaOnsData, on, divisa, tipoCambio) {
    // divisa: (string) `las opciones validas son ARS o DOLAR 
    const resultado = obtenerPrecioYDurationDelaOn(bymaOnsData, on)
    if (!resultado) return // early return if the the on info is not found 
    const { ultimoPrecio, precioVenta, vencimiento } = resultado
    //console.log("Ultimo Precio", ultimoPrecio)

  
    if (ultimoPrecio != null) {   // if it is null there was no data avaliable from byma for this tiker
      if (ultimoPrecio === 0 && precioVenta === 0) return  // early return for prize zero and precioVenta = 0, on puente calculator API sends 500 error o
      const priceFormated = (ultimoPrecio ? ultimoPrecio : precioVenta).toString().replaceAll(".", ","); // if ultimoPrecio = 0 usa precioVenta para el precio
      const tir = await calculaRendimientoOnPuente(on, priceFormated, divisa, tipoCambio)
      return { ultimoPrecio: (ultimoPrecio ? ultimoPrecio : precioVenta), vencimiento: vencimiento, tir: tir } // si ultimoprecio es 0 usa el precio de compra
    }
    else console.log(`No se pudo obtener la tir de ${on}por que no se accedio al precio revisa el tiker`)
  }

  async function esperar(ms) { // demora la ejecucion del codigo los ms indicados
    new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getOnListTirDolares() {

    const bymaOnsData = await obtenerDatosDeByma() // obtiene los precios y vencimientos de todas las ONs de la pagina de BymaData
    if (bymaOnsData.length > 0) {
      const listaRendimientosOn = []
      for (const empresa of onsAAA) {
        const onPorEmpresa = []
        for (const on of empresa.ons_hard_dollar) {
          const dolarTiker = on.slice(0, -1) + "D" // paso los tiker a dolar
          const onResults = await getPriceTirDuration(bymaOnsData, dolarTiker, "DOLAR", 1)
          onPorEmpresa.push({ tiker: dolarTiker, ...onResults })
          await esperar(500)
        }
        listaRendimientosOn.push({ [empresa.empresa]: onPorEmpresa })
      }
      setRendimientoOns(listaRendimientosOn)
    }
    else console.log("No se pudo obtener los datos de mercado de las ON de BYMA")
  }
  console.log(rendimientoOns)

  async function test() {
    const res = await calculaRendimientoOnPuente('YFCMO', "101", 'DOLAR', 1) //getPriceTirDuration('YFCMD', 'DOLAR', 1)
    console.log("prueba: ", res)
  }

  return (
    <>

      <p>
        Rendimientos ON empresas triple calificación AAA
      </p>
      <button type='button' className="manage-history-buttons" onClick={() => getOnListTirDolares()} > Calculate Tir ON en dolares </button>
      <CurvaRendimiento datos={rendimientoOns} />

    </>
  )
}

export default App
