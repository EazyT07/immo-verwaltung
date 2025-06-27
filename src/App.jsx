import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import SetPasswordForm from "./pages/SetPasswordForm";
import DashboardLayout from "./layouts/DashboardLayout";
import RenterDashboard from "./pages/RenterDashboard";
import BuildingDashboard from "./pages/BuildingDashboard";
import HousingUnitDashboard from "./pages/HousingUnitDashboard";
import OverviewDashboard from "./pages/OverviewDashboard";
import SettingDashboard from "./pages/SettingDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/set-password" element={<SetPasswordForm />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="buildings" element={<BuildingDashboard />} />
          <Route path="housing-units" element={<HousingUnitDashboard />} />
          <Route path="renters" element={<RenterDashboard />} />
          <Route path="overview" element={<OverviewDashboard />} />
          <Route path="settings" element={<SettingDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
