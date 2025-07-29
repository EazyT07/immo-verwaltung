import { Outlet } from "react-router-dom";
import Header from "../components/Header";

function DashboardLayout() {
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
