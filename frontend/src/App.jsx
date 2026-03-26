import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminContent from "./pages/admin/AdminContent";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import EventDetail from "./pages/EventDetail";
import Events from "./pages/Events";
import Home from "./pages/Home";
import HostEvent from "./pages/HostEvent";
import MyBook from "./pages/MyBook";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/mi-libro" element={<MyBook />} />
        <Route path="/host-an-event" element={<HostEvent />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
