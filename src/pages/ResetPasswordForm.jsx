import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Password reset email sent. Check your inbox.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h3>Reset your password</h3>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-control mb-2"
      />
      <button
        onClick={handleReset}
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}

export default ResetPasswordForm;
