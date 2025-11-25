
import { useEffect } from 'react'
import { getBymaData } from './services/onData'
import './App.css'

function App() {
  useEffect(() => {
    const videos = getBymaData()
    .then(videos => console.log(videos))

  }, [])


  return (
    <>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
