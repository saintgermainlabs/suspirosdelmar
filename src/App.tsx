import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { LanguageProvider } from "./LanguageContext"
import Nav from "./components/Nav"
import Home from "./pages/Home"
import Rooms from "./pages/Rooms"
import RoomDetail from "./pages/RoomDetail"
import Apartment from "./pages/Apartment"
import Experiences from "./pages/Experiences"
import Gallery from "./pages/Gallery"
import About from "./pages/About"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"
import WhatsAppButton from "./components/WhatsAppButton"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname])

  return null
}

function Shell() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
        <Route path="/apartment" element={<Apartment />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  )
}
