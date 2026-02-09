
import { useEffect, useState } from 'react'
import { getBymaData } from './services/onData'
import { calculaRendimientoOnPuente } from './services/calculadoraOnPuente'
import { onsAAA } from './JSONS/OnsAAA'
import './App.css'

function App() {

  const [tir, setTir] = useState(0)
  const [price, setPrice] = useState(0)
  const [bymaOnsData, setBymaOnsData] = useState([])

  function obtenerDatosDeByma() {
    getBymaData()
      .then(bymaData => {
        console.log("logueando", bymaData)
        if (bymaData.length > 0) setBymaOnsData(bymaData)
        else console.log("No se pudo obtener los datos de precios y volumenes de BYMA")
      }
      )
  }

  function obtenerPreciosDelaOn(on) {
    // on es un String con el tiker de la obligacion negociable de la que se desea obtener los precios 
    const onData = bymaData.filter(papel => papel?.symbol === on)[0]
    return { ultimoPrecio: onData.price, precioCompra: onData.bidPrice, precioVenta: onData.offerPrice}
  }




  const priceFormated = price.toString().replaceAll(".", ",");
  console.log(priceFormated)

  async function getTir() {
    const tir = await calculaRendimientoOnPuente("IRCFO", priceFormated)
    console.log(tir)
    if (tir) setTir(tir)
  }

  return (
    <>

      <p className="read-the-docs">
        {`Tir  ${tir}%    ${price}`}
      </p>
      <button type='button' className="manage-history-buttons" onClick={() => obtenerDatosDeByma()} >Obtener precios On de BYMA </button>
      <br />
      <button type='button' className="manage-history-buttons" onClick={() => getTir()} > Calculate Tir </button>

    </>
  )
}

export default App
