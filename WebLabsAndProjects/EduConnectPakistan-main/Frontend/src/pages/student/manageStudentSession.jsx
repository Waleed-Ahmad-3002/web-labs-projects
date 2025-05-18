import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Calendar, Clock, User, Book, MapPin, DollarSign, Filter,
  AlertTriangle, ChevronDown, ChevronUp, Video, 
  Map, Info, RotateCcw, List, Plus,
  ChevronLeft, ChevronRight, XCircle
} from 'lucide-react';
import '../../assets/css/ManageSession.css';

const ManageStudentSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user === null || user === undefined) return;
    
    if (user && user.role === 'student' && user.profileId) {
      fetchSessions();
    } else if (user) {
      setError('You must be logged in as a student to view sessions');
      setLoading(false);
    }
  }, [user, filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      let queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const response = await api.get(`/api/sessions/student/${user.profileId}?${queryParams.toString()}`);
      
      let sessionsData;
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        sessionsData = response.data;
      } else {
        sessionsData = [];
        console.error('Unexpected API response format:', response);
      }
      
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setCancelDialogOpen(false);
  };

  const handleAddSession = () => {
    navigate('/student/find-tutor');
  };

  const handleCancelSession = async () => {
    if (!selectedSession || !cancellationReason.trim()) return;
    
    try {
      setActionLoading(true);
      
      const response = await api.patch(`/api/sessions/${selectedSession._id}/status`, {
        status: 'cancelled_by_student',
        cancellationReason: cancellationReason.trim()
      });
      
      if (response.data && response.data.status === 'success') {
        // Update the session in the list
        setSessions(prev => 
          prev.map(session => 
            session._id === selectedSession._id 
              ? { ...session, status: 'cancelled_by_student', cancellationReason: cancellationReason } 
              : session
          )
        );
        setSelectedSession({ 
          ...selectedSession, 
          status: 'cancelled_by_student', 
          cancellationReason: cancellationReason 
        });
        setCancelDialogOpen(false);
        setCancellationReason('');
        alert('Session cancelled successfully!');
      }
    } catch (err) {
      console.error('Error cancelling session:', err);
      alert(`Failed to cancel session: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'requested': return 'status-badge-requested';
      case 'confirmed': return 'status-badge-confirmed';
      case 'cancelled_by_student': return 'status-badge-cancelled';
      case 'cancelled_by_tutor': return 'status-badge-cancelled';
      case 'completed': return 'status-badge-completed';
      case 'no_show': return 'status-badge-no-show';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'requested': return 'Requested';
      case 'confirmed': return 'Confirmed';
      case 'cancelled_by_student': return 'Cancelled by You';
      case 'cancelled_by_tutor': return 'Cancelled by Tutor';
      case 'completed': return 'Completed';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonthDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonthDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentMonthDate(new Date());
  };

  // Calendar helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Group sessions by date for calendar view
  const getSessionsByDate = () => {
    const sessionsByDate = {};
    
    sessions.forEach(session => {
      const dateObj = new Date(session.date);
      const dateKey = dateObj.toISOString().split('T')[0];
      
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      
      sessionsByDate[dateKey].push(session);
    });
    
    return sessionsByDate;
  };

  // Render sessions in list view
  const renderSessionsList = () => {
    if (sessions.length === 0) {
      return (
        <div className="no-sessions-message">
          <AlertTriangle size={24} />
          <p>No sessions found matching your filters.</p>
          <button className="reset-filter-btn" onClick={resetFilters}>
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>
      );
    }

    return (
      <div className="sessions-list">
        {sessions.map((session) => (
          <div 
            key={session._id} 
            className={`session-card ${selectedSession && selectedSession._id === session._id ? 'selected' : ''}`}
            onClick={() => handleSelectSession(session)}
          >
            <div className="session-card-header">
              <div className="session-date">
                <Calendar size={16} />
                <span>{formatDate(session.date)}</span>
              </div>
              <div className="session-time">
                <Clock size={16} />
                <span>{session.startTime} - {session.endTime}</span>
              </div>
              <div className={`session-status ${getStatusBadgeClass(session.status)}`}>
                {getStatusLabel(session.status)}
              </div>
            </div>
            
            <div className="session-card-body">
              <div className="student-info">
                <User size={16} />
                <span>Tutor: {session.tutorId?.userId?.username || 'Unknown'}</span>
              </div>
              <div className="subject-info">
                <Book size={16} />
                <span>Subject: {session.subject}</span>
              </div>
              <div className="session-type">
                {session.sessionType === 'Online' ? <Video size={16} /> : <Map size={16} />}
                <span>{session.sessionType} Session</span>
              </div>
              <div className="session-price">
                <DollarSign size={16} />
                <span>${session.price}/hour</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const lastMonth = new Date(year, month, 0);
    const daysInLastMonth = lastMonth.getDate();
    
    const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });
    const sessionsByDate = getSessionsByDate();
    
    // Create calendar days array
    const calendarDays = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInLastMonth - i;
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      
      calendarDays.push({
        day,
        date,
        dateKey,
        isCurrentMonth: false,
        sessions: sessionsByDate[dateKey] || []
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      
      calendarDays.push({
        day,
        date,
        dateKey,
        isCurrentMonth: true,
        isToday: isToday(date),
        sessions: sessionsByDate[dateKey] || []
      });
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = date.toISOString().split('T')[0];
      
      calendarDays.push({
        day,
        date,
        dateKey,
        isCurrentMonth: false,
        sessions: sessionsByDate[dateKey] || []
      });
    }
    
    function isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    }
    
    if (sessions.length === 0) {
      return (
        <div className="calendar-view">
          <div className="calendar-header">
            <div className="month-navigation">
              <button onClick={goToPreviousMonth} className="nav-btn">
                <ChevronLeft size={18} />
              </button>
              <h2>{monthName} {year}</h2>
              <button onClick={goToNextMonth} className="nav-btn">
                <ChevronRight size={18} />
              </button>
            </div>
            <button onClick={goToCurrentMonth} className="today-btn">
              Today
            </button>
          </div>
          
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((day, index) => (
                <div 
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{day.day}</div>
                  <div className="day-content">
                    <div className="no-sessions-indicator">No sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="no-sessions-message calendar-empty">
            <AlertTriangle size={24} />
            <p>No sessions found matching your filters.</p>
            <button className="reset-filter-btn" onClick={resetFilters}>
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <div className="month-navigation">
            <button onClick={goToPreviousMonth} className="nav-btn">
              <ChevronLeft size={18} />
            </button>
            <h2>{monthName} {year}</h2>
            <button onClick={goToNextMonth} className="nav-btn">
              <ChevronRight size={18} />
            </button>
          </div>
          <button onClick={goToCurrentMonth} className="today-btn">
            Today
          </button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="calendar-days">
            {calendarDays.map((day, index) => (
              <div 
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-number">{day.day}</div>
                <div className="day-content">
                  {day.sessions.length > 0 ? (
                    <div className="sessions-container">
                      {day.sessions.slice(0, 3).map(session => (
                        <div 
                          key={session._id}
                          className={`calendar-session ${getStatusBadgeClass(session.status)}`}
                          onClick={() => handleSelectSession(session)}
                        >
                          <span className="session-time">{session.startTime}</span>
                          <span className="session-subject">{session.subject}</span>
                        </div>
                      ))}
                      {day.sessions.length > 3 && (
                        <div className="more-sessions">
                          +{day.sessions.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-sessions"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render session details
  const renderSessionDetails = () => {
    if (!selectedSession) {
      return (
        <div className="no-selection-message">
          <Info size={24} />
          <p>Select a session to view details</p>
        </div>
      );
    }
  
    const handleUpdateClick = async () => {
      const tutorId = selectedSession.tutorId?._id || selectedSession.tutorId;
      
      try {
        // Only delete if status is requested or confirmed
        if (['requested', 'confirmed'].includes(selectedSession.status)) {
          await api.delete(`/api/sessions/${selectedSession._id}`);
          // Refresh the sessions list after deletion
          await fetchSessions();
        }
        
        // Navigate to tutor availability (same as original behavior)
        if (tutorId) {
          navigate(`/tutor/${tutorId}/availability`);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(`Failed to ${selectedSession.status === 'completed' ? 'navigate' : 'update'} session`);
      }
    };
  
    return (
      <div className="session-details">
        <h2>Session Details</h2>
        
        <div className="detail-section">
          <h3>Date & Time</h3>
          <div className="detail-item">
            <Calendar size={16} />
            <span>{formatDate(selectedSession.date)}</span>
          </div>
          <div className="detail-item">
            <Clock size={16} />
            <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Duration:</span>
            <span>{selectedSession.duration} minutes</span>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Session Information</h3>
          <div className="detail-item">
            <User size={16} />
            <span>Tutor: {selectedSession.tutorId?.userId?.username || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <Book size={16} />
            <span>Subject: {selectedSession.subject}</span>
          </div>
          {selectedSession.topicDescription && (
            <div className="detail-item">
              <span className="detail-label">Topic:</span>
              <span>{selectedSession.topicDescription}</span>
            </div>
          )}
          <div className="detail-item">
            {selectedSession.sessionType === 'Online' ? <Video size={16} /> : <Map size={16} />}
            <span>{selectedSession.sessionType} Session</span>
          </div>
          {selectedSession.sessionType === 'In-person' && selectedSession.location && (
            <div className="detail-item">
              <MapPin size={16} />
              <span>Location: {selectedSession.location}</span>
            </div>
          )}
          {selectedSession.sessionType === 'Online' && selectedSession.meetingLink && (
            <div className="detail-item">
              <span className="detail-label">Meeting Link:</span>
              <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer">
                {selectedSession.meetingLink}
              </a>
            </div>
          )}
        </div>
        
        <div className="detail-section">
          <h3>Payment Information</h3>
          <div className="detail-item">
            <DollarSign size={16} />
            <span>Rate: ${selectedSession.price}/hour</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`payment-status ${selectedSession.paymentStatus}`}>
              {selectedSession.paymentStatus.charAt(0).toUpperCase() + selectedSession.paymentStatus.slice(1)}
            </span>
          </div>
        </div>
        
        {(selectedSession.status === 'cancelled_by_tutor' || selectedSession.status === 'cancelled_by_student') && 
          selectedSession.cancellationReason && (
          <div className="detail-section">
            <h3>Cancellation Information</h3>
            <div className="detail-item">
              <span className="detail-label">Reason:</span>
              <span>{selectedSession.cancellationReason}</span>
            </div>
          </div>
        )}
        
        <div className="session-actions">
          {['requested', 'confirmed'].includes(selectedSession.status) && (
            <>
              <button 
                className={`update-session-btn ${selectedSession.status}`}
                onClick={handleUpdateClick}
              >
                Update Session
              </button>
              <button 
                className="cancel-session-btn"
                onClick={() => setCancelDialogOpen(true)}
                disabled={actionLoading}
              >
                <XCircle size={18} />
                Cancel Session
              </button>
            </>
          )}
          {selectedSession.status === 'completed' && (
            <button 
              className="book-another-btn"
              onClick={handleUpdateClick}
            >
              Book Another Session
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render cancellation dialog
  const renderCancelDialog = () => {
    if (!cancelDialogOpen || !selectedSession) return null;
    
    return (
      <div className="dialog-overlay">
        <div className="dialog-content">
          <h3>Cancel Session</h3>
          <p>Are you sure you want to cancel this session with {selectedSession.tutorId?.userId?.username || 'the tutor'} on {formatDate(selectedSession.date)} at {selectedSession.startTime}?</p>
          
          <div className="cancellation-reason">
            <label htmlFor="cancellationReason">Reason for cancellation (required):</label>
            <textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              rows={3}
            />
          </div>
          
          <div className="dialog-actions">
            <button 
              className="dialog-cancel-btn"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              Go Back
            </button>
            <button 
              className="dialog-confirm-btn cancel-action"
              onClick={handleCancelSession}
              disabled={actionLoading || !cancellationReason.trim()}
            >
              {actionLoading ? 'Processing...' : 'Cancel Session'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="filters-container">
        <div className="filters-header" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <div className="filters-title">
            <Filter size={18} />
            <h3>Filter Sessions</h3>
          </div>
          {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {isFilterOpen && (
          <div className="filters-body">
            <div className="filter-group">
              <label htmlFor="status">Status</label>
              <select 
                id="status" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
              >
                <option value="">All Sessions</option>
                <option value="requested">Pending Requests</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled_by_student">Cancelled by You</option>
                <option value="cancelled_by_tutor">Cancelled by Tutor</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateFrom">From Date</label>
              <input 
                type="date" 
                id="dateFrom" 
                name="dateFrom" 
                value={filters.dateFrom} 
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateTo">To Date</label>
              <input 
                type="date" 
                id="dateTo" 
                name="dateTo" 
                value={filters.dateTo} 
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-actions">
              <button className="reset-filters-btn" onClick={resetFilters}>
                <RotateCcw size={16} />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="sessions-loading">
        <div className="loader"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sessions-error">
        <AlertTriangle size={24} />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="manage-sessions-container">
      <div className="sessions-header">
        <h1>My Sessions</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
              List View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar size={18} />
              Calendar View
            </button>
          </div>
          <button className="add-session-btn" onClick={handleAddSession}>
            <Plus size={18} />
            Add Session
          </button>
        </div>
      </div>
      
      {renderFilters()}
      
      <div className="sessions-content">
        <div className="sessions-main-container">
          {viewMode === 'list' ? renderSessionsList() : renderCalendarView()}
        </div>
        
        <div className="session-details-container">
          {renderSessionDetails()}
        </div>
      </div>
      
      {renderCancelDialog()}
    </div>
  );
};

export default ManageStudentSession;