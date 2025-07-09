import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import * as AiIcons from "react-icons/ai";
import Header from "../components/Header";

function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <Header />
      <section className="flex margin6">
        <Outlet />
      </section>
    </>
  );
}

export default DashboardLayout;
