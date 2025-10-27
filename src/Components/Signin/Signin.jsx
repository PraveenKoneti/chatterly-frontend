import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import signupImg from "../../Images/signup.jpg";
import logo from "../../Images/chatterlyIcon.png";
import "./Signin.scss";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://backend-chatterly.onrender.com/users/saveUser", {
        name : name,
        email : email,
        password : password,
      });

      console.log("response = ",response);

      if (response.data.success) { 

        setName("");
        setEmail("");
        setPassword("");
        toast.success("Account Created Successfully")
        navigate("/login");
      } else {
        toast.error(response?.data?.detail || "Unable to create the account")
      }
    } catch (error) {
      console.error("Manual signup error:", error);
      toast.error(error.response.data.detail || "Unable to create the account")
    }
  };


  return (
    <div className="signup-container d-flex align-items-center justify-content-center">
      <div className="signup-card d-flex">
        {/* Left Side - Image */}
        <div className="image-section d-none d-md-block">
          <img src={signupImg} alt="Signup Illustration" className="rounded-start" />
        </div>

        {/* Right Side - Form */}
        <div className="form-section p-4">
          <h2 className="text-center fw-bold mb-3">
            <img src={logo} alt="Lo" className="mb-2 logo-img" /> Create Your Account
          </h2>

          <form onSubmit={signup}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label text-start w-100">Full Name</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label text-start w-100">Email Address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label text-start w-100">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Signup Button */}
            <button type="submit" className="btn btn-primary w-100 py-2">
              Sign Up
            </button>

            {/* Google Sign-In */}
            {/* <button
              type="button"
              className="btn btn-outline-dark w-100 py-2 mt-3 d-flex align-items-center justify-content-center"
              onClick={googleSignup}
            >
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                className="me-2"
                alt="Google Logo"
              />
              Sign Up with Google
            </button> */}

            <p className="text-center mt-3">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
