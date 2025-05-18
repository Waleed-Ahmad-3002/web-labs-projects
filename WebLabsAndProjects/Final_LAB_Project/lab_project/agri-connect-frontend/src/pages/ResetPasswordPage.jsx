import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Ensure API_BASE_URL is correctly defined or imported if it's in a config file
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      // Optionally navigate away or disable form if desired
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }
      
      setMessage(data.message || 'Password reset successful! You can now log in.');
      setPassword('');
      setConfirmPassword('');
      // Optionally redirect to login after a delay
      setTimeout(() => {
        // Pass a state message to LoginPage to show a success alert there
        navigate('/login', { state: { message: 'Password reset successful! Please log in.' } });
      }, 3000);

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 py-5"> {/* Added py-5 for vertical spacing */}
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-key-fill" style={{ fontSize: '3rem', color: 'var(--agri-primary-green)' }}></i>
                <h3 className="mt-3" style={{ color: 'var(--agri-dark-green)'}}>Reset Your Password</h3>
                <p className="text-muted">Enter your new password below.</p>
              </div>

              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

              {token ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="resetPasswordNew">
                    <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || !!message} // Disable if message is shown (i.e., success)
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="resetPasswordConfirm">
                    <Form.Label>Confirm New Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading || !!message} // Disable if message is shown
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading || !!message} // Disable if successfully reset
                    style={{ backgroundColor: 'var(--agri-primary-green)', borderColor: 'var(--agri-primary-green)' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-2">Resetting...</span>
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Form>
              ) : (
                <Alert variant="warning" className="text-center">
                  Invalid or missing password reset token. <br />
                  Please <Link to="/forgot-password" style={{ color: 'var(--agri-dark-green)'}}>request a new reset link</Link>.
                </Alert>
              )}
               <div className="mt-4 text-center">
                <small className="text-muted">
                  Remembered it? <Link to="/login" style={{ color: 'var(--agri-dark-green)'}}>Log In</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;