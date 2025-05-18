import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Ensure API_BASE_URL is correctly defined or imported if it's in a config file
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link.');
      }
      
      setMessage(data.message || 'If an account with this email exists, a password reset link has been sent.');
      setEmail(''); // Clear email field on success
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
                <i className="bi bi-envelope-exclamation-fill" style={{ fontSize: '3rem', color: 'var(--agri-primary-green)' }}></i> {/* Changed icon slightly */}
                <h3 className="mt-3" style={{ color: 'var(--agri-dark-green)'}}>Forgot Password?</h3>
                <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="forgotPasswordEmail">
                  <Form.Label>Email address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

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
                      <span className="ms-2">Sending...</span>
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Remember your password? <Link to="/login" style={{ color: 'var(--agri-dark-green)'}}>Log In</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;