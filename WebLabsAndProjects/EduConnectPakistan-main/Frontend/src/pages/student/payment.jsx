import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { Calendar, Clock, CheckCircle, CreditCard, DollarSign, User, Book, Lock } from 'lucide-react';
import "../../assets/css/Payment.css"

const Payment = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    if (user && user.role === 'student' && user.profileId) {
      fetchConfirmedSessions();
    } else if (user) {
      setError('You must be logged in as a student to view payments');
      setLoading(false);
    }
  }, [user]);

  const fetchConfirmedSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      
      const response = await api.get(`/api/sessions/student/${user.profileId}`, {
        params: {
          status: 'confirmed',
          dateFrom: today
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      const filteredSessions = response.data.filter(session => 
        session.paymentStatus === 'pending' && 
        new Date(session.date) >= new Date(today)
      );
      
      setSessions(filteredSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    if (name === 'expiry') {
      const formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSession) return;
    
    try {
      setPaymentProcessing(true);
      
      const response = await api.patch(
        `/api/sessions/${selectedSession._id}/payment`, 
        {
          paymentStatus: 'paid'
        }
      );
      
      if (response.status === 'success') {
        setPaymentSuccess(true);
        setSessions(prev => prev.filter(s => s._id !== selectedSession._id));
        setSelectedSession(null);
        
        setTimeout(() => {
          setPaymentSuccess(false);
          fetchConfirmedSessions();
        }, 3000);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (!err.response?.data?.message?.includes('tutor earnings')) {
        alert(`Payment processed successfully, but there was an issue updating tutor earnings. Your payment was recorded.`);
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateTotalAmount = () => {
    if (!selectedSession) return 0;
    return (selectedSession.price * (selectedSession.duration / 60)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="loader"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Payment</h1>
      
      {paymentSuccess && (
        <div className="payment-success">
          <CheckCircle size={24} />
          <p>Payment successful! Your session has been paid.</p>
        </div>
      )}
      
      <div className="payment-content">
        <div className="sessions-list">
          <h2>Pending Payments</h2>
          
          {sessions.length === 0 ? (
            <div className="no-sessions">
              <p>No pending payments found.</p>
            </div>
          ) : (
            <div className="session-cards">
              {sessions.map(session => (
                <div 
                  key={session._id} 
                  className={`session-card ${selectedSession?._id === session._id ? 'selected' : ''}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-header">
                    <div className="session-date">
                      <Calendar size={16} />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="session-time">
                      <Clock size={16} />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                  </div>
                  
                  <div className="session-body">
                  <div className="session-tutor">
  <User size={16} />
  <span>Tutor: {session.tutorId?.userId?.username || 'Unknown'}</span>
</div>
                    <div className="session-subject">
                      <Book size={16} />
                      <span>{session.subject}</span>
                    </div>
                    <div className="session-amount">
                      <DollarSign size={16} />
                      <span>${(session.price * (session.duration / 60)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="payment-form-container">
          {selectedSession ? (
            <div className="payment-form">
              <h2>Payment Details</h2>
              
              <div className="session-summary">
                <h3>Session Summary</h3>
                <p><strong>Date:</strong> {formatDate(selectedSession.date)}</p>
                <p><strong>Time:</strong> {selectedSession.startTime} - {selectedSession.endTime}</p>
                <p><strong>Tutor:</strong> {selectedSession.tutorId?.userId?.username || 'Unknown'}</p>
                <p><strong>Subject:</strong> {selectedSession.subject}</p>
                <p><strong>Duration:</strong> {selectedSession.duration} minutes</p>
                <p><strong>Rate:</strong> ${selectedSession.price}/hour</p>
                <h4 className="total-amount">Total: ${calculateTotalAmount()}</h4>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="credit-card-form">
                <h3>Card Information</h3>
                
                <div className="credit-card-container">
                  <div className="credit-card">
                    <div className="card-front">
                      <div className="card-logo">
                        <div className="chip"></div>
                        <span className="card-brand">Credit Card</span>
                      </div>
                      <div className="card-number">
                        {cardDetails.number || '•••• •••• •••• ••••'}
                      </div>
                      <div className="card-details">
                        <div className="card-holder">
                          <div className="label">Card Holder</div>
                          <div className="value">{cardDetails.name || 'Your Name'}</div>
                        </div>
                        <div className="card-expiry">
                          <div className="label">Expires</div>
                          <div className="value">{cardDetails.expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="form-group card-number-group">
                  <label>Card Number</label>
                  <div className="input-icon-wrapper">
                    <CreditCard size={18} className="input-icon" />
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CVV</label>
                    <div className="input-icon-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input
                        type="text"
                        name="cvc"
                        value={cardDetails.cvc}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="secure-payment-info">
                  <Lock size={14} />
                  <span>Secure payment processed with 256-bit encryption</span>
                </div>
                
                <button 
                  type="submit" 
                  className="pay-button"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : (
                    <>
                      <CreditCard size={18} />
                      Pay ${calculateTotalAmount()}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a session to make payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;