import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './auth/AuthGuard'
import { LoginPage } from './pages/LoginPage'
import { HomeRedirect } from './pages/HomeRedirect'
import { ClientPortal } from './pages/ClientPortal'
import { AdminPanel } from './pages/AdminPanel'
import { PersonnelView } from './pages/PersonnelView'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<AuthGuard roles={['client']} />}>
          <Route path="/client" element={<ClientPortal />} />
        </Route>

        <Route element={<AuthGuard roles={['admin']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route element={<AuthGuard roles={['personnel']} />}>
          <Route path="/personnel" element={<PersonnelView />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
