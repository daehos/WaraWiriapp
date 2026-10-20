import Landing from './pages/Landing'
import Admin from './pages/Admin'

function App() {
  return window.location.pathname.startsWith('/admin') ? <Admin /> : <Landing />
}

export default App
