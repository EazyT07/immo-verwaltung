import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function SetPasswordForm() {
  const [session, setSession] = useState(undefined);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>
          No session found. Please access the password reset link from your
          email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h3>Set a new password</h3>
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setNewPassword(e.target.value)}
        className="form-control mb-2"
      />
      <button
        onClick={async () => {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            alert("Error: " + error.message);
          } else {
            alert("Password updated!");
          }
        }}
        className="btn btn-primary"
      >
        Update Password
      </button>
    </div>
  );
}

export default SetPasswordForm;
