import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Ticket from './pages/Ticket'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/tiket') return <Ticket />
  return path.startsWith('/admin') ? <Admin /> : <Landing />
}

export default App
