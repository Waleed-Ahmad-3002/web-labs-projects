import React from 'react';
import axios from 'axios';
import { useAuth, useFormData, usePanelToggle } from '../../hooks/useAuth';
import '../../assets/css/LoginSignup.css';

const LoginSignup = () => {
  // Set default base URL for axios
  axios.defaults.baseURL = 'http://localhost:3000';

  // Use custom hooks
  const { user, loginError, signupError, login, signup, logout } = useAuth();
  const { 
    formData: signupData, 
    handleChange: handleSignupChange, 
    resetForm: resetSignupForm 
  } = useFormData({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    country: '',
    role: 'student'
  });

  const { 
    formData: loginData, 
    handleChange: handleLoginChange, 
    resetForm: resetLoginForm 
  } = useFormData({
    email: '',
    password: ''
  });

  const { 
    isRightPanelActive, 
    handleSignUpClick, 
    handleSignInClick 
  } = usePanelToggle();

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const signupSuccess = await signup(signupData);
    if (signupSuccess) {
      resetSignupForm();
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const loginSuccess = await login(loginData);
    if (loginSuccess) {
      resetLoginForm();
    }
  };

  // If user is logged in, redirect or handle login state
  if (user) {
    // You might want to redirect to the appropriate dashboard based on user role
    // This could be done using React Router's useNavigate hook
    return null;
  }

  return (
    <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      {/* Signup Form */}
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignupSubmit}>
          <h1>Create Account</h1>
          
          {signupError && <div className="error-message">{signupError}</div>}
          
          <input 
            type="text" 
            name="username"
            placeholder="Username *" 
            value={signupData.username}
            onChange={handleSignupChange}
            required 
          />
          
          <input 
            type="email" 
            name="email"
            placeholder="Email *" 
            value={signupData.email}
            onChange={handleSignupChange}
            required 
          />
          
          <input 
            type="password" 
            name="password"
            placeholder="Password *" 
            value={signupData.password}
            onChange={handleSignupChange}
            required 
          />
          
          <input 
            type="tel" 
            name="phoneNumber"
            placeholder="Phone Number" 
            value={signupData.phoneNumber}
            onChange={handleSignupChange}
          />
          
          <input 
            type="text" 
            name="city"
            placeholder="City" 
            value={signupData.city}
            onChange={handleSignupChange}
          />
          
          <input 
            type="text" 
            name="country"
            placeholder="Country" 
            value={signupData.country}
            onChange={handleSignupChange}
          />
          
          <select 
            name="role"
            value={signupData.role}
            onChange={handleSignupChange}
            required
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
          
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Login Form */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleLoginSubmit}>
          <h1>Sign in</h1>
          
          {loginError && <div className="error-message">{loginError}</div>}
          
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={loginData.email}
            onChange={handleLoginChange}
            required 
          />
          
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={loginData.password}
            onChange={handleLoginChange}
            required 
          />
          
          <a href="#">Forgot your password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>
      
      {/* Overlay Container */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1 style={{color:"white"}}>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1 style={{color:"white"}}>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;