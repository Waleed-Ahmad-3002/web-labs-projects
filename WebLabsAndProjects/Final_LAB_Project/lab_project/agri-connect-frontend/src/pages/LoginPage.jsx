// LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // For general success messages
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for messages passed via location.state (e.g., from password reset)
    if (location.state?.message && !successMessage) { // Check !successMessage to show only once
      setSuccessMessage(location.state.message);
      // Clean the state from location history to prevent re-showing on back/forward
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Handle messages from URL query params (e.g., signup success, Google login errors)
    const params = new URLSearchParams(location.search);
    const signupStatus = params.get('signup');
    const loginError = params.get('error');

    if (signupStatus === 'success' && !successMessage) {
      setSuccessMessage('Signup successful! Please log in.');
      navigate('/login', { replace: true, state: {} }); // Clear query params
    }

    if (loginError) {
      let errorMessage = 'Login failed. Please try again.';
      if (loginError === 'google_auth_failed') {
        errorMessage = 'Google authentication failed. Please try again or use standard login.';
      } else if (loginError === 'google_email_missing') {
        errorMessage = 'Could not retrieve email from Google. Please ensure your Google account has an email and permissions are granted.';
      } else if (loginError === 'jwt_signing_error' || loginError === 'user_not_found_after_auth') {
        errorMessage = 'Login failed due to a server error. Please try again later.';
      }
      setError(errorMessage);
      navigate('/login', { replace: true, state: {} }); // Clear query params
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate]); // location.state might not trigger if only state changes, so include full location

  const handleSubmit = async (e) => {
    // ... (your existing handleSubmit logic)
    e.preventDefault();
    setError(''); 
    setSuccessMessage(''); // Clear success message on new attempt
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      console.log('Standard login successful:', data);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        userType: data.userType,
      }));

      setLoading(false);

      switch (data.userType) {
        case 'Farmer':
          navigate('/dashboard');
          break;
        case 'Buyer':
          navigate('/marketplace');
          break;
        case 'Admin':
          navigate('/admin/marketplace-management');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
       console.error('Standard login failed:', err);
       setError(err.message || 'Login failed. Please check your credentials.');
       setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // ... (your existing handleGoogleLogin logic)
    setError('');
    setSuccessMessage('');
    console.log('Redirecting to Google Login via backend...');
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <Container className="mt-5 py-5"> {/* Added py-5 for vertical consistency */}
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                 <i className="bi bi-box-arrow-in-right" style={{ fontSize: '3rem', color: 'var(--agri-primary-green)' }}></i>
                <h3 className="mt-3" style={{ color: 'var(--agri-dark-green)'}}>Log In to AgriConnect</h3>
                <p className="text-muted">Access your dashboard and the marketplace.</p>
              </div>

              {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                 <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                 <div className="d-flex justify-content-end mb-4">
                    <Link to="/forgot-password" style={{ fontSize: '0.9em', color: 'var(--agri-dark-green)' }}>Forgot Password?</Link>
                 </div>

                <Button
                    variant="success"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                    style={{ backgroundColor: 'var(--agri-primary-green)', borderColor: 'var(--agri-primary-green)' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-2">Logging In...</span>
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>

                 <Button
                    variant="outline-secondary"
                    type="button"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleLogin}
                >
                   <i className="bi bi-google me-2"></i> Login with Google
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Don't have an account? <Link to="/signup" style={{ color: 'var(--agri-dark-green)'}}>Sign Up</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;