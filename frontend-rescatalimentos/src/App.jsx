import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import ProblemSection from './components/ProblemSection.jsx'
import HowWeHelp from './components/HowWeHelp.jsx'
import ImpactSection from './components/ImpactSection.jsx'
import ProcessSection from './components/ProcessSection.jsx'
import ParticipateSection from './components/ParticipateSection.jsx'
import FaqSection from './components/FaqSection.jsx'
import InstagramSection from './components/InstagramSection.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import {
  LoginPage,
  RegistrationPage,
  RegistrationSelectionPage,
} from './components/PublicAccessPages.jsx'
import PublicarLotePage from './components/PublicarLotePage.jsx'
import ComedorDashboardPage from './components/ComedorDashboardPage.jsx'
import LogisticaDashboardPage from './components/LogisticaDashboardPage.jsx'
import AdminDashboardPage from './components/AdminDashboardPage.jsx'
import { LotesProvider } from './context/LotesContext.jsx'
import './styles/site.css'
import './styles/access.css'
import './styles/landing.css'
import './styles/auth-dialog.css'
import './styles/prototype.css'
import './styles/responsive.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main>
      <HeroSection onJoin={() => navigate('/registro')} />
      <ProblemSection />
      <HowWeHelp onJoin={() => navigate('/registro')} />
      <ProcessSection />
      <ImpactSection />
      <ParticipateSection />
      <FaqSection />
      <InstagramSection />
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="access-page section-padding">
      <section className="login-panel">
        <p className="eyebrow">Página no encontrada</p>
        <h1>Esta ruta aún no está disponible</h1>
        <p>Vuelve al inicio para conocer RescatAlimentos.</p>
        <Link className="button button-primary" to="/">
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const [sesionDemo, setSesionDemo] = useState(null)

  function iniciarSesionDemo(cuenta) {
    setSesionDemo(cuenta.identidad)
  }

  function cerrarSesionDemo() {
    setSesionDemo(null)
    navigate('/', { replace: true })
  }

  return (
    <>
      <Header
        sesionActiva={Boolean(sesionDemo)}
        onAuth={(mode) => navigate(mode === 'login' ? '/login' : '/registro')}
        onLogout={cerrarSesionDemo}
      />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route
          element={<LoginPage onLogin={iniciarSesionDemo} />}
          path="/login"
        />
        <Route element={<RegistrationSelectionPage />} path="/registro" />
        <Route element={<RegistrationPage />} path="/registro/:role" />
        <Route element={<PublicarLotePage />} path="/donante/publicar-lote" />
        <Route element={<ComedorDashboardPage />} path="/comedor/dashboard" />
        <Route element={<ComedorDashboardPage />} path="/comedor/lote/:id" />
        <Route element={<LogisticaDashboardPage />} path="/logistica/dashboard" />
        <Route element={<AdminDashboardPage />} path="/admin/usuarios" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
      <SiteFooter onJoin={() => navigate('/registro')} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LotesProvider>
        <AppLayout />
      </LotesProvider>
    </BrowserRouter>
  )
}

export default App
