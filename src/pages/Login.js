import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBackendUrl } from "../utils/backend";
import logo from "../tracker.png";

export default function Login() {
  const navigate = useNavigate();
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/method/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          usr,
          pwd
        })
      });

      const data = await res.json();

      if (data.message === "Logged In") {
        setMessage("Login Success");
        setTimeout(() => {
          navigate("/home"); 
        }, 1500);
      } else {
        setMessage("Login Failed, please try again");
      }

    } catch (err) {
      setMessage("Login Failed ,pls try again");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-side">
        <img src={logo} alt="Login" className="login-image" />
      </div>
      <div className="login-form-side">
        <div className="login-form-container">
          <h2 className="login-title">Login</h2>

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={usr}
              onChange={(e) => setUsr(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="login-input"
            />
          </div>

          <button 
            onClick={handleLogin}
            className="login-button"
            disabled={!usr || !pwd}
          >
            Login
          </button>
          
          {message && <p className={`login-message ${message.includes("Success") ? "success" : ""}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}