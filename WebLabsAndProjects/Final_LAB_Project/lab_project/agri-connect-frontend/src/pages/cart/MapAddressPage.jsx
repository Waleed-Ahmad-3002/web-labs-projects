// src/pages/cart/MapAddressPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MapAddressPage = () => {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [orderDetails, setOrderDetails] = useState(null);

    // Helper function to get auth token - consistent with other pages
    const getAuthToken = () => localStorage.getItem('authToken');

    // Get order details from location state and check authentication
    useEffect(() => {
        // Check if user is logged in
        const token = getAuthToken();
        if (!token) {
            setError('You must be logged in to use this feature. Please log in first.');
        }

        if (location.state && location.state.orderDetails) {
            setOrderDetails(location.state.orderDetails);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!latitude || !longitude) {
            setError('Please provide both latitude and longitude');
            return;
        }

        // Validate latitude and longitude format
        const latValue = parseFloat(latitude);
        const longValue = parseFloat(longitude);

        if (isNaN(latValue) || latValue < -90 || latValue > 90) {
            setError('Latitude must be a number between -90 and 90');
            return;
        }

        if (isNaN(longValue) || longValue < -180 || longValue > 180) {
            setError('Longitude must be a number between -180 and 180');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get token using our helper function
            const token = getAuthToken();
            if (!token) {
                setError('You must be logged in to save map address');
                setLoading(false);
                return;
            }

            console.log('Using token:', token);

            // Save map address to backend
            const response = await fetch(`${API_BASE_URL}/mapaddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include', // Include cookies for additional auth if needed
                body: JSON.stringify({ latitude: latValue, longitude: longValue })
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || `Failed to save map address (Status: ${response.status})`);
            }

            // Order confirmed successfully
            setSuccess(true);
            clearCart(); // Clear the cart after order confirmation

            // Automatically redirect to marketplace after 3 seconds
            setTimeout(() => {
                navigate('/marketplace');
            }, 3000);
        } catch (error) {
            setError(error.message || 'An error occurred while saving map address');
        } finally {
            setLoading(false);
        }
    };

    // If order is confirmed, show success message
    if (success) {
        return (
            <Container className="mt-4">
                <Alert variant="success" className="text-center p-4">
                    <i className="bi bi-check-circle-fill fs-1 d-block mb-3 text-success"></i>
                    <h2>Order Confirmed!</h2>
                    <p className="lead">Thank you for your purchase!</p>
                    <p>Your order has been confirmed with map address:</p>
                    <p><strong>Latitude:</strong> {latitude}, <strong>Longitude:</strong> {longitude}</p>
                    {orderDetails && (
                        <>
                            <p>Your order total was <strong>PKR {orderDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (Cash on Delivery).</p>
                            <p>It will be delivered to:<br/>
                                {orderDetails.deliveryInfo.address}, {orderDetails.deliveryInfo.city} {orderDetails.deliveryInfo.postalCode || ''}<br/>
                                Contact: {orderDetails.deliveryInfo.contactNumber}
                            </p>
                        </>
                    )}
                    <p className="mb-0">Your order will be delivered within <strong>5 working days</strong>.</p>
                    <hr />
                    <p>Redirecting to marketplace...</p>
                </Alert>
            </Container>
        );
    }

    // Check if user is logged in
    const isLoggedIn = !!getAuthToken();

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header as="h4" className="text-center">Add Map Address</Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger">
                                    {error}
                                    {!isLoggedIn && (
                                        <div className="mt-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate('/login')}
                                            >
                                                Go to Login
                                            </Button>
                                        </div>
                                    )}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit} className={!isLoggedIn ? 'opacity-50' : ''}>
                                <Form.Group className="mb-3" controlId="latitude">
                                    <Form.Label>Latitude</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter latitude (e.g., 33.6844)"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Latitude must be between -90 and 90
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="longitude">
                                    <Form.Label>Longitude</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter longitude (e.g., 73.0479)"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Longitude must be between -180 and 180
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading || !isLoggedIn}
                                        title={!isLoggedIn ? "Please log in first" : ""}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Order'}
                                    </Button>
                                    <Button variant="outline-secondary" onClick={() => navigate('/cart')}>
                                        Back to Cart
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MapAddressPage;
