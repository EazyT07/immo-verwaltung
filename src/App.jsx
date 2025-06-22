import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

function getAuthFlowType() {
  const hashParams = new URLSearchParams(
    window.location.hash.replace("#", "?")
  );
  return hashParams.get("type");
}

function App() {
  const [session, setSession] = useState(undefined);
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErrorMsg(error.message);
  };

  useEffect(() => {
    const type = getAuthFlowType();

    if (type === "recovery" || type === "invite") {
      setIsRecovery(true);
    } else if (type === "signup") {
      console.log("Type: ", type);
    }

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
      <div
        className="container"
        style={{ maxWidth: "400px", paddingTop: "100px" }}
      >
        <h3>Login</h3>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleLogin}>
          Log In
        </button>
        {errorMsg && <p className="text-danger mt-2">{errorMsg}</p>}
      </div>
    );
  }

  return isRecovery ? (
    <div style={{ marginTop: "2rem" }}>
      <h3>Set a new password</h3>
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ padding: "0.5rem", width: "100%" }}
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
            setIsRecovery(false);
          }
        }}
        style={{ marginTop: "1rem" }}
      >
        Update Password
      </button>
    </div>
  ) : (
    <div>
      <h2>Welcome, {session.user.email}</h2>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}

export default App;
