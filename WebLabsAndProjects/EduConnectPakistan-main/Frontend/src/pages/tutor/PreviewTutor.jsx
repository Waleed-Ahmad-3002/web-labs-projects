import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { User, Award, Book, Clock, DollarSign, MapPin, MessageSquare, Star, Calendar, Briefcase, GraduationCap, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import '../../assets/css/PreviewTutor.css';

const PreviewTutor = ({ tutorData: propsTutorData, isAdminView = false, tutorId }) => {
  const { user } = useAuth();
  const [tutorData, setTutorData] = useState(propsTutorData || null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(!propsTutorData);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  
  // Determine if the current user is a student
  const isStudent = user && user.role === 'student';

  useEffect(() => {
    // If tutorData is passed as prop (admin view), use it directly
    if (propsTutorData) {
      setTutorData(propsTutorData);
      
      // If we have the userId in propsTutorData, fetch the user data
      if (propsTutorData.userId && typeof propsTutorData.userId === 'string') {
        fetchUserData(propsTutorData.userId);
      } else if (propsTutorData.userId) {
        // If userId is already an object with user data
        setUserData(propsTutorData.userId);
      }
      
      setLoading(false);
      return;
    }
    
    // Otherwise fetch data based on the context
    fetchTutorData();
  }, [user, propsTutorData, isAdminView, tutorId]);

  const fetchUserData = async (userId) => {
    try {
      const userResponse = await api.get(`/api/users/${userId}`);
      console.log('User API response:', userResponse);
      
      // Handle the API response structure
      const userData = userResponse.data ? userResponse.data : userResponse;
      setUserData(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Don't set error state here as we still want to show tutor data
    }
  };

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      let tutorResponse;
      
      // If we're viewing a specific tutor profile (not the current user's)
      if (isAdminView === false && tutorId) {
        tutorResponse = await api.get(`/api/tutor/${tutorId}`);
        console.log('Tutor API response:', tutorResponse);
        
        // Handle the API response structure
        const tutorData = tutorResponse.data ? tutorResponse.data : tutorResponse;
        setTutorData(tutorData);
        
        // If tutor data includes userId, fetch the associated user data
        if (tutorData.userId && typeof tutorData.userId === 'string') {
          await fetchUserData(tutorData.userId);
        } else if (tutorData.userId) {
          setUserData(tutorData.userId);
        }
      } 
      // Otherwise fetch tutor's own profile (tutor view)
      else if (user && !isAdminView) {
        tutorResponse = await api.get('/api/tutor/profile');
        console.log('Tutor API response:', tutorResponse);
        
        // Handle the API response structure
        const tutorData = tutorResponse.data ? tutorResponse.data : tutorResponse;
        setTutorData(tutorData);
        
        // For the current user, we already have user data in the auth context
        if (user) {
          setUserData({
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            city: user.city,
            country: user.country,
            role: user.role,
            profilePicture: user.profilePicture
          });
        }
        // If tutor data includes userId and we don't have user data, fetch it
        else if (tutorData.userId && typeof tutorData.userId === 'string') {
          await fetchUserData(tutorData.userId);
        } else if (tutorData.userId) {
          setUserData(tutorData.userId);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tutor data:', err);
      setError('Failed to load tutor profile. Please try again later.');
      setLoading(false);
    }
  };

  // Function to handle view availability button click
  const handleViewAvailability = () => {
    // Redirect to availability page or open a modal
    window.location.href = `/tutor/${tutorId}/availability`;
  };

  // Handle section hover to highlight active section
  const handleSectionMouseEnter = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleSectionMouseLeave = () => {
    setActiveSection(null);
  };

  if (loading) {
    return (
      <div className="tutor-preview-loading">
        <div className="loader"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-preview-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!tutorData) {
    return (
      <div className="tutor-preview-not-found">
        <User size={48} color="#2563eb" />
        <h2>No Tutor Profile Found</h2>
        <p>You haven't created a tutor profile yet.</p>
        <a href="/tutor/verification" className="create-profile-btn">Create Tutor Profile</a>
      </div>
    );
  }

  // Destructure data from the API response
  const { 
    bio, 
    qualifications, 
    experience, 
    subjects, 
    hourlyRate, 
    teachingPreference,
    verificationStatus,
    isVerified,
    ratingAverage,
    totalRatings,
    totalSessions,
    totalEarnings,
    userId
  } = tutorData;

  // Use userData if available, otherwise fall back to nested userId fields
  const username = userData?.username || userId?.username || tutorData.username || 'N/A';
  const email = userData?.email || userId?.email || tutorData.email || 'N/A';
  const city = userData?.city || userId?.city || tutorData.city || '';
  const country = userData?.country || userId?.country || tutorData.country || '';
  const profilePicture = userData?.profilePicture || userId?.profilePicture || tutorData.profilePicture || '';
  const phone = userData?.phoneNumber || userId?.phone || tutorData.phone || '';

  return (
    <div className="tutor-preview-container">
      <div className="tutor-preview-header">
        <div className="tutor-profile">
          {profilePicture ? (
            <img 
              src={`http://localhost:3000${profilePicture}`} 
              alt={`${username}'s profile`} 
              className="profile-picture" 
            />
          ) : (
            <div className="profile-placeholder">
              <User size={48} />
            </div>
          )}
          <h1 className="tutor-name">{username}</h1>
        </div>
        
        <div className="tutor-info"> 
          <div className="verification-badge" data-status={verificationStatus}>
            <Award size={16} />
            <span>
              {verificationStatus === 'approved' ? 'Verified Tutor' : 
               verificationStatus === 'pending' ? 'Verification Pending' : 
               'Not Verified'}
            </span>
          </div>
          <div className="tutor-meta">
            {city && country && (
              <div className="meta-item">
                <MapPin size={16} color="#2563eb" />
                <span>{city}, {country}</span>
              </div>
            )}
            
            <div className="meta-item">
              <Mail size={16} color="#2563eb" />
              <span>{email}</span>
            </div>
            
            {phone && (
              <div className="meta-item">
                <Phone size={16} color="#2563eb" />
                <span>{phone}</span>
              </div>
            )}
            
            <div className="meta-item">
              <DollarSign size={16} color="#2563eb" />
              <span>${hourlyRate?.min || '--'} - ${hourlyRate?.max || '--'} / hour</span>
            </div>
            
            <div className="meta-item">
              <Clock size={16} color="#2563eb" />
              <span>{teachingPreference || '--'} Sessions</span>
            </div>
          </div>
        </div>
        
        <div className="tutor-stats">
          {/* Student view availability button - only shown when the viewer is a student and we're looking at a tutor profile */}
          {isStudent && tutorId && verificationStatus === 'approved' && (
            <button onClick={handleViewAvailability} className="availability-btn">
              <CalendarIcon size={16} />
              <span>View Availability</span>
            </button>
          )}
          
          <div className="stat-item">
            <Star size={20} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{ratingAverage?.toFixed(1) || 'N/A'}</div>
              <div className="stat-label">Rating ({totalRatings || 0})</div>
            </div>
          </div>
          
          <div className="stat-item">
            <Calendar size={20} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{totalSessions || 0}</div>
              <div className="stat-label">Sessions</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="tutor-preview-content">
        <div className="left-column">
          <section 
            className={`tutor-section bio-section ${activeSection === 'bio' ? 'active' : ''}`}
            onMouseEnter={() => handleSectionMouseEnter('bio')}
            onMouseLeave={handleSectionMouseLeave}
          >
            <h2>About Me</h2>
            <p>{bio || 'No bio provided yet.'}</p>
          </section>
          
          <section 
            className={`tutor-section qualifications-section ${activeSection === 'qualifications' ? 'active' : ''}`}
            onMouseEnter={() => handleSectionMouseEnter('qualifications')}
            onMouseLeave={handleSectionMouseLeave}
          >
            <h2>
              <GraduationCap size={20} className="section-icon" />
              Academic Qualifications
            </h2>
            {qualifications?.length > 0 ? (
              <div className="qualifications-list">
                {qualifications.map((qual, index) => (
                  <div key={index} className="qualification-item">
                    <div className="qualification-year">{qual.year || '--'}</div>
                    <div className="qualification-content">
                      <h3>{qual.degree || 'Degree not specified'}</h3>
                      <p className="qualification-institution">{qual.institution || 'Institution not specified'}</p>
                      {qual.certificate && (
                        <p className="qualification-certificate">{qual.certificate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No qualifications added yet.</p>
            )}
          </section>
        </div>
        
        <div className="right-column">
          <section 
            className={`tutor-section experience-section ${activeSection === 'experience' ? 'active' : ''}`}
            onMouseEnter={() => handleSectionMouseEnter('experience')}
            onMouseLeave={handleSectionMouseLeave}
          >
            <h2>
              <Briefcase size={20} className="section-icon" />
              Teaching Experience
            </h2>
            {experience?.length > 0 ? (
              <div className="experience-list">
                {experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-years">{exp.years || '--'} {exp.years === 1 ? 'year' : 'years'}</div>
                    <div className="experience-content">
                      <h3>{exp.title || 'Position not specified'}</h3>
                      <p className="experience-organization">{exp.organization || 'Organization not specified'}</p>
                      <p className="experience-description">{exp.description || 'No description provided'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No experience added yet.</p>
            )}
          </section>
          
          <section 
            className={`tutor-section subjects-section ${activeSection === 'subjects' ? 'active' : ''}`}
            onMouseEnter={() => handleSectionMouseEnter('subjects')}
            onMouseLeave={handleSectionMouseLeave}
          >
            <h2>
              <Book size={20} className="section-icon" />
              Subjects I Teach
            </h2>
            {subjects?.length > 0 ? (
              <div className="subjects-grid">
                {subjects.map((subject, index) => (
                  <div key={index} className="subject-item">
                    <h3>{subject.name || 'Subject'}</h3>
                    <span className="subject-level">{subject.level || 'Level not specified'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No subjects added yet.</p>
            )}
          </section>
        </div>
      </div>
      
      {!isAdminView && verificationStatus !== 'approved' && (
        <div className="tutor-preview-footer">
          <a href="/tutor/verification" className="edit-profile-btn">
            Edit Profile
          </a>
          <p className="verification-note">
            {verificationStatus === 'pending' 
              ? 'Your profile is pending verification. You will be notified once approved.'
              : 'Your profile needs verification. Please complete all required information.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewTutor;