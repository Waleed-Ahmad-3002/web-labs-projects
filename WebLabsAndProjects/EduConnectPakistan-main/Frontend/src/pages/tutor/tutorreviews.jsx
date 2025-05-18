import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/TutorReviews.css';

const TutorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReviewId, setExpandedReviewId] = useState(null);

  useEffect(() => {
    if (!user || !user.profileId) return;
    
    const fetchTutorReviews = async () => {
      try {
        setLoading(true);
        // Using the tutorId which is the user's profileId
        const response = await api.get(`/api/reviews/tutor/${user.profileId}`);
        
        let reviewsData = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          reviewsData = response.data;
        }
        
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching tutor reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorReviews();
  }, [user]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const toggleExpandReview = (reviewId) => {
    if (expandedReviewId === reviewId) {
      setExpandedReviewId(null);
    } else {
      setExpandedReviewId(reviewId);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`star ${star <= rating ? 'filled' : ''}`}
          />
        ))}
        <span className="rating-text">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tutor-reviews-container">
        <div className="loading-message">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-reviews-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="tutor-reviews-container">
      <h2>My Student Reviews</h2>
      
      {reviews.length === 0 ? (
        <div className="no-reviews-message">No reviews found</div>
      ) : (
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>
                  <Calendar size={16} /> Date
                </th>
                <th>
                  <User size={16} /> Student
                </th>
                <th>
                  <Star size={16} /> Rating
                </th>
                <th>
                  <MessageSquare size={16} /> Comments
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <React.Fragment key={review._id}>
                  <tr>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      {review.studentId?.userId?.username || 'Anonymous Student'}
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td className="comment-cell">
                      {review.comment ? (
                        <div className="comment-preview">
                          {review.comment.length > 50 
                            ? `${review.comment.substring(0, 50)}...` 
                            : review.comment}
                        </div>
                      ) : (
                        <span className="no-comment">No comment</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleExpandReview(review._id)}
                        className="expand-button"
                      >
                        {expandedReviewId === review._id ? (
                          <>Hide <ChevronUp size={16} /></>
                        ) : (
                          <>View <ChevronDown size={16} /></>
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedReviewId === review._id && (
                    <tr className="expanded-row">
                      <td colSpan="5" className="expanded-content">
                        <div className="review-details">
                          <h3>Full Review</h3>
                          <div className="detail-item">
                            <strong>Session Date:</strong> {review.sessionId ? formatDate(review.sessionId.date) : 'N/A'}
                          </div>
                          <div className="detail-item">
                            <strong>Student:</strong> {review.studentId?.userId?.username || 'Anonymous Student'}
                          </div>
                          <div className="detail-item">
                            <strong>Rating:</strong> {renderStars(review.rating)}
                          </div>
                          <div className="detail-item">
                            <strong>Comment:</strong> 
                            <div className="full-comment">
                              {review.comment || 'No comment provided'}
                            </div>
                          </div>
                          
                          <div className="tutor-reply">
                            <h4>Your Reply</h4>
                            {review.reply && review.reply.content ? (
                              <div className="reply-content">
                                <p>{review.reply.content}</p>
                                <div className="reply-date">
                                  Replied on {formatDate(review.reply.createdAt)}
                                </div>
                              </div>
                            ) : (
                              <div className="no-reply">
                                You haven't replied to this review yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TutorReviews;