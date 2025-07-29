import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineBars } from "react-icons/ai";
import { LuHouse } from "react-icons/lu";
import { AiOutlineApartment } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { HiOutlineDatabase } from "react-icons/hi";

function Header() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header>
      <h5>Immo Verwaltung</h5>
      <Link to="#" className="ham">
        <AiOutlineBars onClick={() => setSidebarOpen(!isSidebarOpen)} />
      </Link>
      <nav className={isSidebarOpen ? "show" : ""}>
        <Link to="/dashboard/buildings">
          <LuHouse />
          <span>Gebäude</span>
        </Link>
        <Link to="/dashboard/housing-units">
          <AiOutlineApartment />
          <span>Wohnungen</span>
        </Link>
        <Link to="/dashboard/renters">
          <IoPersonOutline />
          <span>Mieter</span>
        </Link>
        <Link to="/dashboard/overview">
          <HiOutlineDatabase />
          <span>Übersicht</span>
        </Link>
        <Link to="/dashboard/extra-costs">
          <HiOutlineDatabase />
          <span>Nebenkosten</span>
        </Link>
        <Link to="/dashboard/result">
          <HiOutlineDatabase />
          <span>Abrechnung</span>
        </Link>
        <button onClick={handleLogout}>Log out</button>
      </nav>
    </header>
  );
}

export default Header;
