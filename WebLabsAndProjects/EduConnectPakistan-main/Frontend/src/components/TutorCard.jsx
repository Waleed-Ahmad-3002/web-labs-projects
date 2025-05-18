import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Star, Eye, Heart } from 'lucide-react';
import '../assets/css/TutorCard.css';

const TutorCard = ({ tutorId }) => {
  const [tutor, setTutor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        
        // Fetch tutor profile
        const tutorResponse = await api.get(`/api/tutor/${tutorId}`);
        
        if (tutorResponse.success && tutorResponse.data) {
          // Ensure tutor data has proper structure
          const processedTutor = {
            ...tutorResponse.data,
            hourlyRate: tutorResponse.data.hourlyRate || { min: 0, max: 0 },
            subjects: Array.isArray(tutorResponse.data.subjects) 
              ? tutorResponse.data.subjects 
              : [],
            ratingAverage: tutorResponse.data.ratingAverage || 0,
            totalRatings: tutorResponse.data.totalRatings || 0,
            bio: tutorResponse.data.bio || "",
            teachingPreference: tutorResponse.data.teachingPreference || "In-person"
          };
          
          setTutor(processedTutor);
          
          // Fetch user data associated with the tutor
          if (processedTutor.userId) {
            const userResponse = await api.get(`/api/users/${processedTutor.userId}`);
            
            if (userResponse.success && userResponse.data) {
              setUser(userResponse.data);
              
              // Get current user from local storage
              const currentUser = JSON.parse(localStorage.getItem('user'));
              
              // If current user is a student, check if this tutor is in their wishlist
              if (currentUser && (currentUser._id || currentUser.id) && currentUser.role === 'student') {
                const studentId = currentUser._id || currentUser.id;
                checkWishlistStatus(studentId, tutorId);
              }
            } else {
              throw new Error('Failed to load user data');
            }
          } else {
            throw new Error('Tutor has no associated user');
          }
        } else {
          throw new Error('Failed to load tutor data');
        }
      } catch (err) {
        console.error('Error fetching tutor data:', err);
        setError(err.message || 'Failed to load tutor information');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorData();
    } else {
      setError('No tutor ID provided');
      setLoading(false);
    }
  }, [tutorId]);

  // Check if tutor is in student's wishlist
  const checkWishlistStatus = async (studentId, tutorId) => {
    try {
      const response = await api.get(`/api/student/check/${studentId}/${tutorId}`);
      
      if (response.success) {
        setIsWishlisted(response.isWishlisted);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      // Don't show error to user, just default to not wishlisted
      setIsWishlisted(false);
    }
  };

  // Toggle wishlist status
  const handleWishlist = async () => {
    try {
      // Get current user from local storage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      console.log('Current user from localStorage:', currentUser);
      
      // Check if user is logged in and is a student
      if (!currentUser || !(currentUser._id || currentUser.id)) {
        alert('You need to be logged in to use the wishlist feature');
        return;
      }
      
      if (currentUser.role !== 'student') {
        alert('Only students can add tutors to wishlist');
        return;
      }
      
      setWishlistLoading(true);
      
      // Use _id if available, otherwise fall back to id
      const studentId = currentUser._id || currentUser.id;
      
      if (isWishlisted) {
        // Remove from wishlist
        const response = await api.delete(`/api/student/${studentId}/${tutorId}`);
        
        if (response.success) {
          setIsWishlisted(false);
        } else {
          throw new Error(response.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await api.post('/api/student', {
          studentId: studentId,
          tutorId: tutorId
        });
        
        if (response.success) {
          setIsWishlisted(true);
        } else {
          throw new Error(response.message || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      alert(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle view profile click
  const handleViewProfile = () => {
    // Navigate to profile page or open modal
    if (tutorId) {
        window.location.href = `/tutor/profile/${tutorId}`;
      } else {
        console.error("No tutorId available for navigation");
        // Maybe show an alert or toast notification to the user
      }
  };

  const renderRatingStars = () => {
    const filledStars = Math.round(tutor?.ratingAverage || 0);
    const stars = [];
        
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          size={16}
          className={`star-icon ${i < filledStars ? 'star-filled' : 'star-empty'}`}
          fill={i < filledStars ? '#f6ad55' : 'none'}
          stroke={i < filledStars ? '#ed8936' : '#a0aec0'}
        />
      );
    }
        
    return stars;
  };

  const renderSubjects = () => {
    if (!tutor || !tutor.subjects || !Array.isArray(tutor.subjects) || tutor.subjects.length === 0) {
      return "No subjects listed";
    }
    
    return tutor.subjects.map(subject => {
      if (typeof subject === 'string') {
        return subject;
      } else if (typeof subject === 'object' && subject.name) {
        return subject.name;
      }
      return "";
    }).filter(Boolean).join(", ");
  };

  if (loading) return <div className="tutor-card-skeleton">Loading...</div>;
  if (error) return <div className="tutor-card-error">{error}</div>;
  if (!tutor) return <div className="tutor-card-error">Tutor information not available</div>;

  return (
    <div className="tutor-card">
      {/* Wishlist button (positioned absolutely over the image) */}
      <button 
        className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''} ${wishlistLoading ? 'loading' : ''}`} 
        onClick={handleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        disabled={wishlistLoading}
      >
        <Heart 
          size={20} 
          fill={isWishlisted ? "#e53e3e" : "none"} 
          stroke={isWishlisted ? "#e53e3e" : "#3b82f6"} 
          strokeWidth={2}
        />
      </button>

      {/* Profile Image Section */}
      <div className="profile-image">
        {user && user.profilePicture ? (
          <img 
            src={`http://localhost:3000${user.profilePicture}`} 
            alt={`${user.username || 'Tutor'} profile`}
          />
        ) : (
          <div className="fallback-avatar">
            <User size={64} className="avatar-icon" />
          </div>
        )}
      </div>

      {/* Tutor Information Section */}
      <div className="tutor-info">
        {/* Rating */}
        <div className="tutor-rating">
          <div className="rating-stars">
            {renderRatingStars()}
          </div>
          <span className="rating-count">
            ({tutor.totalRatings || 0} reviews)
          </span>
        </div>

        {/* Name and Location */}
        <div className="tutor-header">
          <h3 className="tutor-name">{user ? user.username : 'Unnamed Tutor'}</h3>
          <div className="tutor-location">
            {user ? (
              <>
                {user.city || ''}{user.city && user.country ? ', ' : ''}{user.country || ''}
              </>
            ) : 'Location unknown'}
          </div>
        </div>

        {/* Subjects */}
        <div className="tutor-subjects">
          <span className="subjects-label">Subjects:</span> {renderSubjects()}
        </div>

        {/* Hourly Rate */}
        {tutor.hourlyRate && (
          <div className="tutor-rate">
            PKR {tutor.hourlyRate.min || 0} - {tutor.hourlyRate.max || 0} <span className="rate-unit">per hour</span>
          </div>
        )}

        {/* Teaching Preference */}
        {tutor.teachingPreference && (
          <div className="teaching-preference">
            <span className="preference-label">Teaches:</span> {tutor.teachingPreference}
          </div>
        )}

        {/* Bio - Truncated for card view */}
        <div className="tutor-bio">
          <p>{tutor.bio ? `${tutor.bio.substring(0, 100)}${tutor.bio.length > 100 ? '...' : ''}` : "No bio available"}</p>
        </div>

        {/* Action Buttons */}
        <div className="tutor-actions">
          <button 
            className="view-profile-button" 
            onClick={handleViewProfile}
          >
            <Eye size={16} />
            <span>View Profile</span>
          </button>
          
          <button 
            className={`wishlist-button-text ${isWishlisted ? 'wishlisted' : ''} ${wishlistLoading ? 'loading' : ''}`} 
            onClick={handleWishlist}
            disabled={wishlistLoading}
          >
            <Heart size={16} />
            <span>{wishlistLoading ? 'Processing...' : isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;