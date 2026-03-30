import { Outlet } from "react-router-dom";
import AssistantWidget from "../components/AssistantWidget";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <AssistantWidget />
      <Footer />
    </div>
  );
}

export default MainLayout;
