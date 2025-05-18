import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { 
  DollarSign, Calendar, Clock, CheckCircle, XCircle, 
  Filter, ChevronDown, ChevronUp, RefreshCw, BarChart2,
  CreditCard, AlertCircle, Loader2
} from 'lucide-react';
import '../../assets/css/TutorIncome.css';

const TutorIncome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [filteredSessions, setFilteredSessions] = useState([]);

  useEffect(() => {
    if (user && user.role === 'tutor' && user.profileId) {
      fetchIncomeData();
    } else if (user) {
      setError('You must be logged in as a tutor to view income data');
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    if (incomeData && incomeData.sessions) {
      applyFilters();
    }
  }, [paymentStatusFilter, incomeData]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/sessions/tutor/${user.profileId}/income?period=${period}`);
      setIncomeData(response.data);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Failed to load income data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!incomeData || !incomeData.sessions) return;

    let sessions = [...incomeData.sessions];
    
    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      sessions = sessions.filter(session => session.paymentStatus === paymentStatusFilter);
    }

    setFilteredSessions(sessions);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid': return 'badge-paid';
      case 'pending': return 'badge-pending';
      case 'failed': return 'badge-failed';
      default: return '';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const calculateSessionEarnings = (session) => {
    return (session.price * (session.duration / 60)).toFixed(2);
  };

  if (loading && !incomeData) {
    return (
      <div className="income-loading">
        <Loader2 className="animate-spin" size={24} />
        <p>Loading income data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="income-error">
        <AlertCircle size={24} />
        <p>{error}</p>
        <button onClick={fetchIncomeData} className="retry-btn">
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (incomeData && (!incomeData.sessions || incomeData.sessions.length === 0)) {
    return (
      <div className="no-sessions-message">
        <BarChart2 size={32} />
        <h3>No income data found</h3>
        <p>You don't have any completed sessions for the selected period.</p>
        <button onClick={() => setPeriod('all')} className="view-all-btn">
          View All Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="tutor-income-container">
      <div className="income-header">
        <h1>My Earnings</h1>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={fetchIncomeData}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          
          <div className="period-filter">
            <button 
              className={`period-btn ${period === 'week' ? 'active' : ''}`}
              onClick={() => setPeriod('week')}
            >
              Weekly
            </button>
            <button 
              className={`period-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              Monthly
            </button>
            <button 
              className={`period-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {incomeData && (
        <>
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <h3>Total Earnings</h3>
                <p>{formatCurrency(incomeData.summary.totalEarnings)}</p>
                <small>{incomeData.summary.totalSessions} sessions</small>
              </div>
            </div>
            
            <div className="summary-card paid">
              <div className="card-icon">
                <CheckCircle size={24} />
              </div>
              <div className="card-content">
                <h3>Paid</h3>
                <p>{formatCurrency(incomeData.summary.paidAmount)}</p>
                <small>{incomeData.summary.paidSessions} sessions</small>
              </div>
            </div>
            
            <div className="summary-card pending">
              <div className="card-icon">
                <Clock size={24} />
              </div>
              <div className="card-content">
                <h3>Pending</h3>
                <p>{formatCurrency(incomeData.summary.pendingAmount)}</p>
                <small>{incomeData.summary.pendingSessions} sessions</small>
              </div>
            </div>
          </div>

          <div className="income-details">
            <div className="details-header">
              <h2>Session Details</h2>
              <button 
                className="filter-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={16} />
                Filters
                {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {isFilterOpen && (
              <div className="filter-options">
                <div className="filter-group">
                  <label>Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            )}

            <div className="sessions-table">
              <div className="table-header">
                <div className="header-cell">Date</div>
                <div className="header-cell">Student</div>
                <div className="header-cell">Subject</div>
                <div className="header-cell">Duration</div>
                <div className="header-cell">Rate</div>
                <div className="header-cell">Earnings</div>
                <div className="header-cell">Status</div>
              </div>

              <div className="table-body">
                {filteredSessions.map((session) => (
                  <div 
                    key={session._id} 
                    className={`table-row ${selectedSession?._id === session._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="table-cell">
                      <Calendar size={14} />
                      {formatDate(session.date)}
                    </div>
                    <div className="table-cell">
                      {session.studentId?.userId?.username || 'Unknown'}
                    </div>
                    <div className="table-cell">
                      {session.subject}
                    </div>
                    <div className="table-cell">
                      <Clock size={14} />
                      {session.duration} mins
                    </div>
                    <div className="table-cell">
                      {formatCurrency(session.price)}/hr
                    </div>
                    <div className="table-cell earnings">
                      {formatCurrency(calculateSessionEarnings(session))}
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getPaymentStatusBadge(session.paymentStatus)}`}>
                        {getPaymentStatusLabel(session.paymentStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedSession && (
            <div className="session-details-panel">
              <h3>Session Details</h3>
              
              <div className="detail-group">
                <h4>Date & Time</h4>
                <p>
                  <Calendar size={16} />
                  {formatDate(selectedSession.date)} at {selectedSession.startTime}
                </p>
                <p>
                  <Clock size={16} />
                  Duration: {selectedSession.duration} minutes
                </p>
              </div>
              
              <div className="detail-group">
                <h4>Student</h4>
                <p>{selectedSession.studentId?.userId?.username || 'Unknown'}</p>
              </div>
              
              <div className="detail-group">
                <h4>Subject</h4>
                <p>{selectedSession.subject}</p>
                {selectedSession.topicDescription && (
                  <p>Topic: {selectedSession.topicDescription}</p>
                )}
              </div>
              
              <div className="detail-group">
                <h4>Payment</h4>
                <p>Rate: {formatCurrency(selectedSession.price)}/hour</p>
                <p>Earnings: {formatCurrency(calculateSessionEarnings(selectedSession))}</p>
                <p>
                  Status: <span className={`status-badge ${getPaymentStatusBadge(selectedSession.paymentStatus)}`}>
                    {getPaymentStatusLabel(selectedSession.paymentStatus)}
                  </span>
                </p>
              </div>
              
              {selectedSession.paymentStatus === 'pending' && (
                <button className="request-payment-btn">
                  <CreditCard size={16} />
                  Request Payment
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TutorIncome;