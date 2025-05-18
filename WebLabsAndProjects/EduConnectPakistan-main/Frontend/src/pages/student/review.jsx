import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Calendar, Clock, User, DollarSign, Star, MessageSquare, ChevronLeft
} from 'lucide-react';
import api from '../../utils/api';
import "../../assets/css/Review.css";

const Review = () => {
  const { user } = useAuth();
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  useEffect(() => {
    if (!user || !user.profileId) return;
    
    const fetchCompletedSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sessions/student/${user.profileId}?status=completed`);
        
        let sessionsData;
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          sessionsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          sessionsData = response.data;
        } else {
          sessionsData = [];
        }
        
        // Filter out sessions that already have reviews
        // This requires backend endpoint to provide review status or fetch reviews separately
        setCompletedSessions(sessionsData);
      } catch (err) {
        console.error('Error fetching completed sessions:', err);
        setError('Failed to load completed sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompletedSessions();
  }, [user, submitSuccess]);
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleFeedbackClick = (session) => {
    setSelectedSession(session);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setRating(0);
    setReviewText('');
    setSubmitError(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !selectedSession || !user?.profileId) return;
  
    try {
      setSubmitting(true);
      setSubmitError(null); // Clear any previous errors
      setSubmitSuccess(false); // Reset success state
      
      const reviewData = {
        tutorId: typeof selectedSession.tutorId === 'object' ? 
          selectedSession.tutorId._id : selectedSession.tutorId,
        sessionId: selectedSession._id,
        studentId: user.profileId,
        rating,
        comment: reviewText
      };
      
      const response = await api.post('/api/reviews', reviewData);
      
      // Only show error if the response explicitly indicates an error
      if (response.data && response.data.success === false) {
        setSubmitError(response.data.message || 'Failed to submit review');
      } 
      // Otherwise consider it a success
      else {
        setSubmitSuccess(true);
        setRating(0);
        setReviewText('');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Only show error if it's a duplicate review error or other specific error
      if (err.response?.data?.message?.includes('already exists')) {
        setSubmitError(err.response.data.message);
      }
      // Don't show error for other cases if you don't want to
      // else {
      //   setSubmitError('Failed to submit review');
      // }
    } finally {
      setSubmitting(false);
    }
  };

  // Function to check if a session already has a review
  const checkReviewStatus = async (sessionId) => {
    try {
      // This would need a new endpoint on your backend
      const response = await api.get(`/api/reviews/check/${sessionId}`);
      return response.data.exists;
    } catch (err) {
      console.error('Error checking review status:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="completed-sessions-container">
        <div className="loading-message">Loading completed sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="completed-sessions-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="completed-sessions-container">
        <button 
          onClick={handleBackToList}
          className="back-button"
        >
          <ChevronLeft size={16} /> Back to sessions
        </button>
        
        <h2>Leave Feedback for {selectedSession.tutorId?.userId?.username || 'Tutor'}</h2>
        
        {submitSuccess ? (
          <div className="success-message">
            <p>Thank you for your feedback!</p>
            <button 
              onClick={handleBackToList}
              className="submit-button"
            >
              Back to Sessions
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="review-form">
            {submitError && (
              <div className="error-message">{submitError}</div>
            )}
            
            <div className="form-group">
              <label>Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="reviewText">
                <MessageSquare size={16} /> Your Review:
              </label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this tutor..."
                rows={5}
              />
            </div>
            
            <div className="form-group">
              <p className="session-info">
                <strong>Session Details:</strong>
                <br />
                Date: {formatDate(selectedSession.date)}
                <br />
                Time: {selectedSession.startTime} - {selectedSession.endTime}
                <br />
                Tutor: {selectedSession.tutorId?.userId?.username || 'Unknown'}
              </p>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!rating || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="completed-sessions-container">
      <h2>Completed Sessions</h2>
      
      {completedSessions.length === 0 ? (
        <div className="no-sessions-message">No completed sessions found</div>
      ) : (
        <div className="sessions-table-container">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>
                  <Calendar size={16} /> Date
                </th>
                <th>
                  <Clock size={16} /> Time
                </th>
                <th>
                  <User size={16} /> Tutor
                </th>
                <th>
                  <DollarSign size={16} /> Price
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {completedSessions.map((session) => (
                <tr key={session._id}>
                  <td>{formatDate(session.date)}</td>
                  <td>{session.startTime} - {session.endTime}</td>
                  <td>
                    {session.tutorId?.userId?.username || 'Unknown Tutor'}
                  </td>
                  <td>${session.price}/hour</td>
                  <td>
                    <button 
                      onClick={() => handleFeedbackClick(session)}
                      className="feedback-button"
                    >
                      {session.hasReview ? 'View Feedback' : 'Give Feedback'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Review;