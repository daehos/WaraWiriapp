import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Ticket from './pages/Ticket'
import { USE_EMULATOR } from './lib/env'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  const page =
    path === '/tiket' ? <Ticket /> : path.startsWith('/admin') ? <Admin /> : <Landing />
  return (
    <>
      {page}
      {USE_EMULATOR && (
        <div className="fixed bottom-3 left-3 z-50 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-sand-50 shadow-lg">
          MODE LOKAL · data uji (emulator)
        </div>
      )}
    </>
  )
}

export default App
