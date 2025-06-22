import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import SetPasswordForm from "./pages/SetPasswordForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/set-password" element={<SetPasswordForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
