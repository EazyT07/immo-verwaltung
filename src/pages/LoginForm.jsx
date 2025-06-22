import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Navigate } from "react-router-dom";

function getAuthFlowType() {
  const hashParams = new URLSearchParams(
    window.location.hash.replace("#", "?")
  );
  return hashParams.get("type");
}

function LoginForm() {
  const [session, setSession] = useState(undefined);
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

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

  if (isRecovery) {
    return <Navigate to="/set-password" />;
  }

  if (!session) {
    return (
      <main
        className="form-signin w-100 m-auto"
        style={{ maxWidth: "330px", paddingTop: "100px" }}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <h1 className="h3 mb-3 fw-normal text-center">Please sign in</h1>

          <div className="form-floating">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingInput">Email address</label>
          </div>
          <div className="form-floating mt-2">
            <input
              type="password"
              className="form-control"
              id="floatingPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="floatingPassword">Password</label>
          </div>

          {errorMsg && <p className="text-danger mt-2">{errorMsg}</p>}

          <button
            className="w-100 btn btn-lg btn-primary mt-3"
            onClick={handleLogin}
          >
            Sign in
          </button>

          <p className="mt-3 mb-3 text-center">
            <a href="/reset-password">Forgot your password?</a>
          </p>
        </form>
      </main>
    );
  }

  return (
    <div>
      <h2>Welcome, {session.user.email}</h2>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}

export default LoginForm;
