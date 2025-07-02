import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Immo Verwaltung</div>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          ☰
        </button>

        <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
          <li>
            <a href="/">Home</a>
          </li>
          <li className="navbar-dropdown">
            <span className="navbar-dropdown-toggle">Dashboard ▾</span>
            <ul className="navbar-dropdown-menu">
              <li>
                <a href="/dashboard/buildings">Buildings</a>
              </li>
              <li>
                <a href="/dashboard/housing-units">Housing Units</a>
              </li>
              <li>
                <a href="/dashboard/renters">Renters</a>
              </li>
              <li>
                <a href="/dashboard/settings">Settings</a>
              </li>
            </ul>
          </li>
          <li>
            <a href="/pricing">Pricing</a>
          </li>
          <li>
            <a href="/docs">Docs</a>
          </li>

          {session ? (
            <li>
              <button className="navbar-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <li>
              <a href="/login" className="navbar-button">
                Login
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
