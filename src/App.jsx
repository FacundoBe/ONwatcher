
import { useEffect, useState } from 'react'
import { getBymaData } from './services/onData'
import { calculaRendimientoOnPuente } from './services/calculadoraOnPuente'
import './App.css'

function App() {

  const [tir, setTir] = useState(0)
 const [price, setPrice] = useState(0)

  useEffect(() => {
    const videos = getBymaData()
      .then(bymaData => {console.log(bymaData.filter( papel => papel.symbol ===  "IRCFD" ))
                                                      setPrice( bymaData.filter( papel => papel.symbol ===  "IRCFD" )[0].trade)}

    )

  }, [])

  const priceFormated = price.toString().replaceAll(".", ","); 
  console.log(priceFormated)

  async function getTir() {
    const tir = await calculaRendimientoOnPuente("IRCFO", priceFormated)
    console.log(tir)
    if (tir)setTir(tir)
  }

  return (
    <>

      <p className="read-the-docs">
        {`Tir  ${tir}%    ${price}`  } 
      </p>

      <button type='button' className="manage-history-buttons" onClick={() => getTir() } > Calculate Tir </button>

    </>
  )
}

export default App
