import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/Availability.css';

// Icon components for better visual design
const ClockIcon = () => (
  <svg className="availability-detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg className="availability-detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const RepeatIcon = () => (
  <svg className="availability-detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </svg>
);

const CalendarEmptyIcon = () => (
  <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <circle cx="12" cy="16" r="2"></circle>
  </svg>
);

const AddAvailability = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);

  // Default new availability state
  const defaultAvailability = {
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    specificDate: ''
  };

  const [newAvailability, setNewAvailability] = useState(defaultAvailability);

  // Day mapping for better UX
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Fetch tutor's availabilities on component mount
  useEffect(() => {
    // First check if user data is actually loaded
    if (user === null || user === undefined) {
      // User data is still loading, don't do anything yet
      return;
    }
    
    // Now check if they're a tutor
    if (user && user.role === 'tutor') {
      fetchAvailabilities();
    } else {
      console.log("User is not a tutor:", user);
      // Redirect if not a tutor
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/availability');
      setAvailabilities(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      setMessage({ 
        text: 'Failed to load your availabilities. Please try again.', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox differently
    if (type === 'checkbox') {
      setNewAvailability({ 
        ...newAvailability, 
        [name]: checked,
        // Clear specificDate if recurring is checked
        ...(name === 'isRecurring' && checked ? { specificDate: '' } : {})
      });
    } else {
      setNewAvailability({ ...newAvailability, [name]: value });
    }
  };

  const validateAvailability = () => {
    // Check if start time is before end time
    if (newAvailability.startTime >= newAvailability.endTime) {
      setMessage({ 
        text: 'Start time must be before end time', 
        type: 'error' 
      });
      return false;
    }

    // Check if specific date is provided for non-recurring availabilities
    if (!newAvailability.isRecurring && !newAvailability.specificDate) {
      setMessage({ 
        text: 'Please select a specific date for non-recurring availability', 
        type: 'error' 
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAvailability()) return;

    try {
      setLoading(true);
      
      // Format date for API if it's set
      const dataToSend = { ...newAvailability };
      if (dataToSend.specificDate) {
        const dateObj = new Date(dataToSend.specificDate);
        // Set time to 00:00:00 as we only care about the date
        dateObj.setHours(0, 0, 0, 0);
        dataToSend.specificDate = dateObj.toISOString();
      }

      const response = await api.post('/api/availability', dataToSend);
      
      // Reset form
      setNewAvailability(defaultAvailability);
      
      // Show success message
      setMessage({ text: 'Availability added successfully!', type: 'success' });
      
      // Refresh availabilities list
      fetchAvailabilities();
      
      setLoading(false);
    } catch (error) {
      console.error('Error adding availability:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to add availability. Please try again.', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  const handleDelete = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/availability/${availabilityId}`);
      
      // Remove from local state
      setAvailabilities(availabilities.filter(item => item._id !== availabilityId));
      
      setMessage({ text: 'Availability deleted successfully!', type: 'success' });
      setLoading(false);
    } catch (error) {
      console.error('Error deleting availability:', error);
      setMessage({ 
        text: 'Failed to delete availability. Please try again.', 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  // Helper to format time for display
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Helper to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Recurring weekly';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="availability-page">
      <div className="availability-header">
        <h1>Manage Your Availability</h1>
      </div>
      
      <div className="availability-content">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="card">
          <div className="card-header">Add New Availability</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="availability-form">
              <div className="form-group">
                <label htmlFor="dayOfWeek">Day of Week</label>
                <select 
                  id="dayOfWeek"
                  className="form-control"
                  name="dayOfWeek" 
                  value={newAvailability.dayOfWeek} 
                  onChange={handleInputChange}
                  disabled={!newAvailability.isRecurring}
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input 
                    id="startTime"
                    className="form-control"
                    type="time" 
                    name="startTime" 
                    value={newAvailability.startTime} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input 
                    id="endTime"
                    className="form-control"
                    type="time" 
                    name="endTime" 
                    value={newAvailability.endTime} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="isRecurring" 
                    name="isRecurring" 
                    checked={newAvailability.isRecurring} 
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isRecurring">Recurring Weekly</label>
                </div>
              </div>
              
              {!newAvailability.isRecurring && (
                <div className="form-group">
                  <label htmlFor="specificDate">Specific Date</label>
                  <input 
                    id="specificDate"
                    className="form-control"
                    type="date" 
                    name="specificDate" 
                    value={newAvailability.specificDate} 
                    onChange={handleInputChange}
                    required={!newAvailability.isRecurring}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Availability'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">Your Current Availabilities</div>
          <div className="card-body availabilities-container">
            {loading && (
              <div className="loading">
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {!loading && availabilities.length === 0 && (
              <div className="empty-state">
                <CalendarEmptyIcon />
                <div className="empty-state-text">
                  You haven't set any availability times yet.
                </div>
              </div>
            )}
            
            {!loading && availabilities.length > 0 && (
              <div className="availabilities-list">
                {availabilities.map(slot => (
                  <div key={slot._id} className="availability-card">
                    <div className="availability-card-header">
                      <h3 className="availability-card-title">
                        {slot.isRecurring 
                          ? daysOfWeek.find(d => d.value === slot.dayOfWeek)?.label 
                          : new Date(slot.specificDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h3>
                      <span className="availability-card-badge">
                        {slot.isRecurring ? 'Weekly' : 'One-time'}
                      </span>
                    </div>
                    
                    <div className="availability-card-body">
                      <div className="availability-detail">
                        <ClockIcon />
                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                      </div>
                      
                      {slot.isRecurring ? (
                        <div className="availability-detail">
                          <RepeatIcon />
                          <span>Repeats every week</span>
                        </div>
                      ) : (
                        <div className="availability-detail">
                          <CalendarIcon />
                          <span>{new Date(slot.specificDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="availability-card-footer">
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(slot._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAvailability;