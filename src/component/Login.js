import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./Login.css";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate("/recordadmin/admin"); // Redirect to RecordAdmin after login
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="form login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
      <label className="form-label">Password:</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={showPassword ? "text" : "password"}
          className="form-input password-width"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          style={{
            position: "absolute",
            right: "10px",
            cursor: "pointer",
            color: "#999",
          }}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
    </div>
        {error && <p className="text-danger error-message">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
