// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import * as AiIcons from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";

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
              <IoMdCloseCircleOutline />
              <span>Gebäude</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/housing-units">
              <IoMdCloseCircleOutline />
              <span>Wohnungen</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/renters">
              <IoMdCloseCircleOutline />
              <span>Mieter</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/overview">
              <IoMdCloseCircleOutline />
              <span>Stammdaten</span>
            </Link>
          </li>
          <li className="nav-text">
            <Link to="/dashboard/settings">
              <IoMdCloseCircleOutline />
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
