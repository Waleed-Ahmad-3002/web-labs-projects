import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Calendar as CalendarIcon, User, Video, Map, Book, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import '../../assets/css/CheckAvailability.css';

const CheckAvailability = () => {
    const { tutorId } = useParams();
    const { user } = useAuth();
    const [availabilities, setAvailabilities] = useState([]);
    const [tutorData, setTutorData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'dayView', 'timeSlot'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedSessionType, setSelectedSessionType] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    // New state for hourly rate
    const [hourlyRate, setHourlyRate] = useState('');
    const [hourlyRateError, setHourlyRateError] = useState('');

  // Get tutor data and availabilities on component mount
  useEffect(() => {
    if (tutorId) {
      fetchTutorData();
      fetchAvailabilities();
    } else {
      setError('Tutor ID is missing');
      setLoading(false);
    }
  }, [tutorId]);

  // When month/year changes, update the calendar
  useEffect(() => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  }, [currentMonth, currentYear]);

  const fetchUserData = async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      console.log('User data from API:', response.data || response);
      setUserData(response.data || response);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Don't set error state here as we still want to show tutor data
    }
  };
  const fetchTutorData = async () => {
    try {
      const response = await api.get(`/api/tutor/${tutorId}`);
      console.log('Tutor data from API:', response.data || response);
      
      // Store tutor data
      const tutorData = response.data || response;
      setTutorData(tutorData);
      
      // Check if userId exists and fetch user data if needed
      if (tutorData.userId) {
        if (typeof tutorData.userId === 'string') {
          // If userId is a string, we need to fetch the user data
          await fetchUserData(tutorData.userId);
        } else {
          // If userId is already an object with user data
          setUserData(tutorData.userId);
        }
      }
    } catch (err) {
      console.error('Error fetching tutor data:', err);
      setError('Failed to load tutor information.');
    } finally {
      setLoading(false);
    }
  };
  const fetchBookedSessions = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/api/sessions/tutor/${tutorId}/date/${formattedDate}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching booked sessions:', error);
      return [];
    }
  };
  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/availability/${tutorId}`);
      const availabilityData = response.data?.data || response.data || [];
      setAvailabilities(availabilityData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching availabilities:', err);
      setError('Failed to load availability data.');
      setLoading(false);
    }
  };

  // Helper function to get the proper profile image URL
  const getProfileImageUrl = () => {
    // First try to get profile picture from userData if it exists
    if (userData && userData.profilePicture) {
      return userData.profilePicture.startsWith('http') 
        ? userData.profilePicture
        : `http://localhost:3000${userData.profilePicture}`;
    }
    
    // Fallback to tutorData if userData doesn't have it
    if (tutorData && tutorData.profilePicture) {
      return tutorData.profilePicture.startsWith('http') 
        ? tutorData.profilePicture
        : `http://localhost:3000${tutorData.profilePicture}`;
    }
    
    return null;
  };

  // Helper function to get tutor name
  const getTutorName = () => {
    if (userData && userData.username) {
      return userData.username;
    }
    if (tutorData && tutorData.username) {
      return tutorData.username;
    }
    return 'Tutor';
  };

  // Helper function to get tutor city - FIXED
  const getTutorCity = () => {
    // First check in userData which may have more complete info
    if (userData && userData.city) {
      return userData.city;
    }
    // Then check in tutorData
    if (tutorData && tutorData.city) {
      return tutorData.city;
    }
    // Check if userId contains city as an object
    if (tutorData && tutorData.userId && typeof tutorData.userId === 'object' && tutorData.userId.city) {
      return tutorData.userId.city;
    }
    return null;
  };

  // Helper function to get tutor country - Added for complete location info
  const getTutorCountry = () => {
    if (userData && userData.country) {
      return userData.country;
    }
    if (tutorData && tutorData.country) {
      return tutorData.country;
    }
    if (tutorData && tutorData.userId && typeof tutorData.userId === 'object' && tutorData.userId.country) {
      return tutorData.userId.country;
    }
    return null;
  };

  // Helper function to get hourly rate range
  const getHourlyRateRange = () => {
    if (tutorData && tutorData.hourlyRate) {
      return {
        min: tutorData.hourlyRate.min || 0,
        max: tutorData.hourlyRate.max || 0
      };
    }
    return { min: 0, max: 0 };
  };

  // Handle hourly rate input change
  const handleHourlyRateChange = (e) => {
    const value = e.target.value;
    setHourlyRate(value);
    
    // Clear error when user starts typing
    if (hourlyRateError) {
      setHourlyRateError('');
    }
  };

  // Validate hourly rate
  const validateHourlyRate = () => {
    const rate = parseFloat(hourlyRate);
    const { min, max } = getHourlyRateRange();
    
    if (isNaN(rate)) {
      setHourlyRateError('Please enter a valid number');
      return false;
    }
    
    if (rate < min || rate > max) {
      setHourlyRateError(`Rate must be between $${min} and $${max}`);
      return false;
    }
    
    setHourlyRateError('');
    return true;
  };

  // Calendar navigation handlers
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days for the current month view
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date has availability
  const hasAvailabilityOnDate = (date) => {
    const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday
    
    // Check for recurring availability on this day of week
    const recurringAvailability = availabilities.find(a => 
      a.dayOfWeek === dayOfWeek && a.isRecurring === true
    );
    
    // Check for specific date availability
    const specificDateAvailability = availabilities.find(a => {
      if (!a.specificDate) return false;
      const availDate = new Date(a.specificDate);
      return (
        availDate.getDate() === date.getDate() &&
        availDate.getMonth() === date.getMonth() &&
        availDate.getFullYear() === date.getFullYear()
      );
    });
    
    return recurringAvailability || specificDateAvailability;
  };

  // Generate time slots for the selected date
  const generateTimeSlots = async (date) => {
    const dayOfWeek = date.getDay();
    
    // Get all availabilities for this day
    const dayAvailabilities = availabilities.filter(a => 
      (a.dayOfWeek === dayOfWeek && a.isRecurring === true) || 
      (a.specificDate && new Date(a.specificDate).toDateString() === date.toDateString())
    );
  
    // Fetch already booked sessions for this date and tutor
    const bookedSessions = await fetchBookedSessions(date);
    
    let timeSlots = [];
    
    dayAvailabilities.forEach(availability => {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);
      
      // Calculate start and end in minutes for easier comparison
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;
      
      // Generate 1-hour slots
      for (let timeInMinutes = startInMinutes; timeInMinutes < endInMinutes; timeInMinutes += 60) {
        if (timeInMinutes + 60 <= endInMinutes) {
          const hour = Math.floor(timeInMinutes / 60);
          const minute = timeInMinutes % 60;
          
          const slotStartTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotEndHour = Math.floor((timeInMinutes + 60) / 60);
          const slotEndMinute = (timeInMinutes + 60) % 60;
          const slotEndTime = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
          
          // Check if this time slot is already booked
          const isSlotBooked = bookedSessions.some(session => {
            return (
              (slotStartTime >= session.startTime && slotStartTime < session.endTime) ||
              (slotEndTime > session.startTime && slotEndTime <= session.endTime) ||
              (slotStartTime <= session.startTime && slotEndTime >= session.endTime)
            );
          });
          
          // Only add available (not booked) slots
          if (!isSlotBooked) {
            timeSlots.push({
              startTime: slotStartTime,
              endTime: slotEndTime,
              availabilityId: availability._id
            });
          }
        }
      }
    });
    
    // Sort by start time
    timeSlots.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    return timeSlots;
  };

  // Handle date selection
// Update the handleDateSelect function
const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setLoading(true); // Add loading state while fetching slots
    try {
      const slots = await generateTimeSlots(date);
      setAvailableTimeSlots(slots);
      setCurrentView('dayView');
    } catch (error) {
      console.error('Error generating time slots:', error);
      alert('Failed to load available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentView('timeSlot');
  };

  // Handle session type selection
  const handleSessionTypeSelect = (type) => {
    setSelectedSessionType(type);
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  // Handle booking confirmation
  // Update the handleBookingConfirm function in your CheckAvailability.js file

const handleBookingConfirm = async () => {
    // Validate hourly rate before proceeding
    if (!validateHourlyRate()) {
      return;
    }
    
    if (selectedSessionType && selectedSubject) {
      try {
        // Get the student ID (profileId) from the auth context
        if (!user) {
          alert('You must be logged in to book a session');
          return;
        }
        
        // Extract the student ID
        const studentId = user.profileId || user.id;
        console.log("studentId:", studentId);
        
        if (!studentId) {
          alert('Student profile not found. Please contact support.');
          return;
        }
  
        // Prepare booking data
        const bookingData = {
          tutorId: tutorId,
          studentId: studentId,
          subject: selectedSubject.name,
          sessionType: selectedSessionType === 'online' ? 'Online' : 'In-person',
          date: selectedDate.toISOString().split('T')[0],
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          location: getTutorCity(),
          hourlyRate: parseFloat(hourlyRate) // Add hourly rate to booking data
        };
  
        console.log("Booking data being sent:", bookingData);
  
        // Make API call to book session
        const response = await api.post('/api/sessions', bookingData);
        
        // Deep debugging of response
        console.log("Full API response:", response);
        console.log("Response data:", response.data);
        console.log("Response status value:", response.data.status);
        console.log("Response message value:", response.data.message);
        console.log("Response data type:", typeof response.data);
        
        // Try a less strict condition
        if (response && response.data) {
          alert(`Booking successful! Your session has been requested for ${selectedDate.toDateString()} at ${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime} with a rate of $${hourlyRate}/hour`);
          
          // Navigate to sessions or dashboard page
          window.location.href = '/student';
        } else {
          throw new Error('Empty response received from server');
        }
      } catch (error) {
        console.error('Error during booking:', error);
        
        // Check if the error is due to double-booking
        if (error.response && error.response.status === 409) {
          // Show a specific error message for double-booking
          alert(`This time slot is already booked. Please select another time.`);
          
          // Return to day view to select another time slot
          setCurrentView('dayView');
          setSelectedTimeSlot(null);
          setSelectedSessionType(null);
          setSelectedSubject(null);
          setHourlyRate('');
          setHourlyRateError('');
          
          // Refresh available time slots to get the latest availability
          const slots = generateTimeSlots(selectedDate);
          setAvailableTimeSlots(slots);
        } else {
          // General error message for other errors
          alert(`Booking failed: ${error.response?.data?.message || error.message || 'Please try again later'}`);
        }
      }
    } else {
      alert('Please select both a session type and subject before confirming.');
    }
  };

  // Handle back button navigation
  const handleBackButton = () => {
    if (currentView === 'dayView') {
      setCurrentView('calendar');
      setSelectedDate(null);
    } else if (currentView === 'timeSlot') {
      setCurrentView('dayView');
      setSelectedTimeSlot(null);
      setSelectedSessionType(null);
      setSelectedSubject(null);
      setHourlyRate('');
      setHourlyRateError('');
    }
  };

  // Render calendar view
  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const hasAvailability = hasAvailabilityOnDate(date);
      const isPastDate = date < new Date(today.setHours(0, 0, 0, 0));

      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday ? 'today' : ''} ${hasAvailability ? 'has-availability' : ''} ${isPastDate ? 'past-date' : ''}`}
          onClick={() => hasAvailability && !isPastDate ? handleDateSelect(date) : null}
        >
          <span className="day-number">{day}</span>
          {hasAvailability && !isPastDate && <div className="availability-indicator"></div>}
        </div>
      );
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={goToPreviousMonth} className="month-nav-btn">
            <ChevronLeft size={20} />
          </button>
          <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={goToNextMonth} className="month-nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="calendar-days">
          {days}
        </div>
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="availability-indicator"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="today-indicator"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };

  // Render day view with time slots
  const renderDayView = () => {
    return (
      <div className="day-view-container">
        <button onClick={handleBackButton} className="back-button">
          <ArrowLeft size={16} />
          Back to Calendar
        </button>
        <h2>
          <Calendar size={20} />
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
        
        {availableTimeSlots.length > 0 ? (
          <div className="time-slots-container">
            <h3>Available Time Slots</h3>
            <div className="time-slots-grid">
              {availableTimeSlots.map((slot, index) => (
                <div 
                  key={index} 
                  className="time-slot"
                  onClick={() => handleTimeSlotSelect(slot)}
                >
                  <Clock size={16} />
                  <span>{slot.startTime} - {slot.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-slots-message">
            <p>No specific time slots available for this day.</p>
          </div>
        )}
      </div>
    );
  };

  // Render time slot view with session type and subject selection
  const renderTimeSlotView = () => {
    const tutorName = getTutorName();
    const tutorCity = getTutorCity();
    const tutorCountry = getTutorCountry();
    const hourlyRateRange = getHourlyRateRange();
    
    return (
      <div className="time-slot-view-container">
        <button onClick={handleBackButton} className="back-button">
          <ArrowLeft size={16} />
          Back to Time Slots
        </button>
        
        <h2 className="booking-heading">Complete Your Booking</h2>
        
        <div className="booking-details">
          {/* Left Side - Booking Information */}
          <div className="booking-info">
            <div className="selected-details">
              <div className="detail-item">
                <CalendarIcon size={16} />
                <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} />
                <span>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
              </div>
              <div className="detail-item">
                <User size={16} />
                <span>Tutor: {tutorName}</span>
              </div>
              {/* Location info with both city and country if available */}
              {(tutorCity || tutorCountry) && (
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>Location: {[tutorCity, tutorCountry].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {/* Display hourly rate range */}
              <div className="detail-item">
                <DollarSign size={16} />
                <span>Rate Range: ${hourlyRateRange.min} - ${hourlyRateRange.max}/hour</span>
              </div>
            </div>
          </div>
          
          {/* Right Side - Session Type and Subject Selection */}
          <div className="session-type-selection">
            <h3 className="session-type-heading">Select Session Type</h3>
            <div className="session-types">
              <div
                className={`session-type ${selectedSessionType === 'online' ? 'selected' : ''}`}
                onClick={() => handleSessionTypeSelect('online')}
              >
                <Video size={24} />
                <h4>Online Session</h4>
                <p>Meet via video call</p>
              </div>
              
              <div
                className={`session-type ${selectedSessionType === 'in-person' ? 'selected' : ''}`}
                onClick={() => handleSessionTypeSelect('in-person')}
              >
                <Map size={24} />
                <h4>In-Person Session</h4>
                <p>Meet at agreed location</p>
              </div>
            </div>

            {/* Subject Selection */}
            <h3 className="subject-heading">Select Subject</h3>
            {tutorData && tutorData.subjects && tutorData.subjects.length > 0 ? (
              <div className="subject-selection">
                {tutorData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className={`subject-item ${selectedSubject === subject ? 'selected' : ''}`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <Book size={20} />
                    <span>{subject.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-subjects-message">
                <p>No subjects available for this tutor.</p>
              </div>
            )}

            {/* Hourly Rate Input */}
            <div className="hourly-rate-container">
              <h3 className="hourly-rate-heading">
                <DollarSign size={20} />
                Enter Hourly Rate
              </h3>
              <div className="rate-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={handleHourlyRateChange}
                  onBlur={validateHourlyRate}
                  className={`hourly-rate-input ${hourlyRateError ? 'has-error' : ''}`}
                  placeholder={`${hourlyRateRange.min} - ${hourlyRateRange.max}`}
                />
                <span className="per-hour">/hour</span>
              </div>
              {hourlyRateError && (
                <div className="rate-error-message">
                  <AlertCircle size={14} />
                  <span>{hourlyRateError}</span>
                </div>
              )}
              <div className="rate-hint">
                <span>Must be between ${hourlyRateRange.min} and ${hourlyRateRange.max}</span>
              </div>
            </div>

            {/* Booking Confirmation Button */}
            <button 
              className={`booking-confirm-btn ${selectedSessionType && selectedSubject && hourlyRate && !hourlyRateError ? 'active' : 'disabled'}`}
              onClick={handleBookingConfirm}
              disabled={!selectedSessionType || !selectedSubject || !hourlyRate || hourlyRateError}
            >
              <CheckCircle size={20} />
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="availability-loading">
        <div className="loader"></div>
        <p>Loading availability data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="availability-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="check-availability-container">
      <div className="availability-header">
        <h1>
          <Clock size={24} />
          Tutor Availability
        </h1>
        {(tutorData || userData) && (
          <div className="tutor-info-mini">
            {getProfileImageUrl() ? (
              <img 
                src={getProfileImageUrl()} 
                alt={`${getTutorName()}'s profile`} 
                className="mini-profile-picture" 
              />
            ) : (
              <div className="mini-profile-placeholder">
                <User size={24} />
              </div>
            )}
            <div className="tutor-mini-details">
              <h2>{getTutorName()}</h2>
              {/* Show city and country in header if available */}
              {(getTutorCity() || getTutorCountry()) && (
                <p className="tutor-location">
                  <MapPin size={14} /> 
                  {[getTutorCity(), getTutorCountry()].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="availability-content">
        {currentView === 'calendar' && renderCalendarView()}
        {currentView === 'dayView' && renderDayView()}
        {currentView === 'timeSlot' && renderTimeSlotView()}
      </div>
    </div>
  );
};

export default CheckAvailability;