

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [client_id, setclient_id] = useState("");
  const [access_token, setaccess_token] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showaccess_token, setshowaccess_token] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    const response = await fetch("http://localhost:5000/api/user_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", client_id, access_token }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
      navigate("/Dashboard"); // Redirect to dashboard after successful login
    } else {
      setError(data.error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    const response = await fetch("http://localhost:5000/api/user_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", name, client_id, access_token }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
      setIsSignUp(false); // Switch back to login form after successful signup
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="flex screen bg-black-800 justify-center items-center">
      {/* Login Form Container */}
      <div className="bg-white p-10 shadow-lg rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4">{isSignUp ? "Sign Up" : "Log in"}</h1>
        <p className="text-gray-600 mb-6">Welcome !!! Please enter your details.</p>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}

        {isSignUp ? (
          // Sign Up Form
          <form onSubmit={handleSignUp} className="w-full">
            <label className="block mb-2 text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 mb-4 border rounded-lg text-black placeholder-gray-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="block mb-2 text-gray-700">Client_ID</label>
            <input
              type="client_id"
              placeholder="Enter your client_id"
              className="w-full p-3 mb-4 border rounded-lg text-black placeholder-gray-500"
              value={client_id}
              onChange={(e) => setclient_id(e.target.value)}
              required
            />

            <label className="block mb-2 text-gray-700">Access_Token</label>
            <div className="relative w-full">
              <input
                type={showaccess_token ? "text" : "access_token"}
                placeholder="Enter your access_token"
                className="w-full p-3 mb-4 border rounded-lg text-black placeholder-gray-500 pr-10"
                value={access_token}
                onChange={(e) => setaccess_token(e.target.value)}
                required
              />
              {/* Eye Icon for Toggle Password Visibility */}
              <span
                className="absolute top-4 right-4 cursor-pointer text-gray-600"
                onClick={() => setshowaccess_token(!showaccess_token)}
              >
                {showaccess_token ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
              </span>
            </div>
            <button type="submit" className="w-full p-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold">
              Sign Up
            </button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin} className="w-full">
            <label className="block mb-2 text-gray-700">Client_ID</label>
            <input
              type="client_id"
              placeholder="Enter your client_id"
              className="w-full p-3 mb-4 border rounded-lg text-black placeholder-gray-500"
              value={client_id}
              onChange={(e) => setclient_id(e.target.value)}
              required
            />

            <label className="block mb-2 text-gray-700">Access_Token</label>
            <div className="relative w-full">
              <input
                type={showaccess_token ? "text" : "access_token"}
                placeholder="Enter your access_token"
                className="w-full p-3 mb-4 border rounded-lg text-black placeholder-gray-500 pr-10"
                value={access_token}
                onChange={(e) => setaccess_token(e.target.value)}
                required
              />
              {/* Eye Icon for Toggle Password Visibility */}
              <span
                className="absolute top-4 right-4 cursor-pointer text-gray-600"
                onClick={() => setshowaccess_token(!showaccess_token)}
              >
                {showaccess_token ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
              </span>
            </div>
            <button type="submit" className="w-full p-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-semibold">
              Log in
            </button>
          </form>
        )}

        <p className="mt-4 text-gray-600">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <a href="#" className="text-blue-500" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log in" : "Sign up"}
          </a>
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full p-2 mt-3 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Login;

