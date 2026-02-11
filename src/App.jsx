
import { useEffect, useState } from 'react'
import { getBymaData } from './services/onData'
import { calculaRendimientoOnPuente } from './services/calculadoraOnPuente'
import { onsAAA } from './JSONS/OnsAAA'
import './App.css'

function App() {

  const [tir, setTir] = useState(0)
  const [bymaOnsData, setBymaOnsData] = useState([])
  const [rendimientoOns, setRendimientoOns] = useState({})



  async function obtenerDatosDeByma() {
    getBymaData()
      .then(bymaData => {
        console.log("logueando", bymaData)
        if (bymaData.length > 0) setBymaOnsData(bymaData)
        else console.log("No se pudo obtener los datos de precios y volumenes de BYMA")
      }
      )
  }


  function obtenerPrecioYDurationDelaOn(on) {
    // on es un String con el tiker de la obligacion negociable de la ON que se desea obtener los precios 
    const onData = bymaOnsData.filter(papel => papel?.symbol === on)[0]
    if (onData?.trade != undefined) {
      //console.log(onData)
      return { ultimoPrecio: onData.trade, precioCompra: onData.bidPrice, precioVenta: onData.offerPrice, vencimiento: onData.daysToMaturity }
    }
    else console.log(`No se puedo obtener el precio de ${on} de BYMA revisa el tiker`)
    return null
  }



  async function getPriceTirDuration(on, divisa, tipoCambio) {
    // divisa: (string) `las opciones validas son ARS o DOLAR 
    const { ultimoPrecio, vencimiento } = await obtenerPrecioYDurationDelaOn(on)
    //console.log("Ultimo Precio", ultimoPrecio)

    if (ultimoPrecio != null) {
      const priceFormated = ultimoPrecio.toString().replaceAll(".", ",");
      const tir = await calculaRendimientoOnPuente(on, priceFormated, divisa, tipoCambio)
      console.log(on, { ultimoPrecio: ultimoPrecio, vencimiento: vencimiento, tir: tir })
      return { ultimoPrecio: ultimoPrecio, vencimiento: vencimiento, tir: tir }
    }
    else console.log(`No se pudo obtener la tir de ${on}por que no se accedio al precio revisa el tiker`)
  }

  async function esperar(ms) { // demora la ejecucion del codigo los ms indicados
    new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getOnListTirDolares() {

 
    for (const on of onsAAA[0].ons_hard_dollar) {
      const dolarTiker = on.slice(0, -1) + "D" // paso los tiker a dolar
      const onResults = await getPriceTirDuration(dolarTiker, "DOLAR", 1)
      setRendimientoOns(prev => ({...prev, tiker:{...onResults} }))
      await esperar(500)
    }

    // const ListData = onsAAA[0].ons_hard_dollar.map(async (on) => {
    //   const dolarTiker = on.slice(0, -1) + "D" // paso los tiker a dolar   
    //   const onResults = await getPriceTirDuration(dolarTiker, "DOLAR", 1)
    //   const a = await esperar(1000)
    //   return { tiker: on, ...onResults }
    // })
    // setTir(ListData)
  }

  console.log(rendimientoOns)


  return (
    <>

      <p className="read-the-docs">
        {`Tir  %    `}
      </p>
      <button type='button' className="manage-history-buttons" onClick={() => obtenerDatosDeByma()} >Obtener Datos Ons de BYMA </button>
      <br />
      <button type='button' className="manage-history-buttons" onClick={() => getOnListTirDolares()} > Calculate Tir </button>

    </>
  )
}

export default App
