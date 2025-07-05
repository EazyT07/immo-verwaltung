import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import * as AiIcons from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { LuHouse } from "react-icons/lu";
import { IoPersonOutline } from "react-icons/io5";
import { HiOutlineDatabase } from "react-icons/hi";
import { SlSettings } from "react-icons/sl";
import { GrLogout } from "react-icons/gr";

function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <header className="navbar">
        <Link to="#" className="menu-bars">
          <AiIcons.AiOutlineBars
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          />
        </Link>
        <div className="navbar-logout">
          <GrLogout onClick={handleLogout} />
        </div>
      </header>
      <nav className={`nav-menu ${isSidebarOpen ? "active" : ""}`}>
        <ul
          className="nav-menu-items"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <IoMdCloseCircleOutline />
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/buildings">
              <LuHouse />
              <span>Gebäude</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/housing-units">
              <AiIcons.AiOutlineApartment />
              <span>Wohnungen</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/renters">
              <IoPersonOutline />
              <span>Mieter</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/overview">
              <HiOutlineDatabase />
              <span>Stammdaten</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/extra-costs">
              <HiOutlineDatabase />
              <span>Nebenkosten</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/settings">
              <SlSettings />
              <span>Einstellungen</span>
            </Link>
          </li>
        </ul>
      </nav>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
