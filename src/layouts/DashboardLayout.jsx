// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh" }} className="d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light">
        <div className="d-md-none">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰ Menu
          </button>
        </div>
        <div className="ms-auto">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="d-flex flex-grow-1">
        <nav
          className={`bg-light p-3 ${
            isSidebarOpen ? "d-block" : "d-none"
          } d-md-block`}
          style={{ width: "200px" }}
        >
          <h4>Menu</h4>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/buildings">
                Gebäude
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/housing-units">
                Wohnungseinheit
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/renters">
                Mieter
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/overview">
                Übersicht
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/settings">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
