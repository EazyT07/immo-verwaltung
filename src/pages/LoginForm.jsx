import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

function LoginForm() {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/dashboard/renters");
    }
  };

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

  return <Navigate to="/dashboard/buildings" />;
}

export default LoginForm;
