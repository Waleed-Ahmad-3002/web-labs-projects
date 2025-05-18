import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import TutorCard from '../../components/TutorCard';
import '../../assets/css/FindTutor.css';

const WishlistPage = () => {
  // Data states
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Form states
  const [filters, setFilters] = useState({
    subject: '',
    location: '',
    priceMin: 0,
    priceMax: 10000, // Default max price in PKR
    ratingThreshold: 0
  });
  
  // Fetch wishlisted tutors on component mount
  useEffect(() => {
    const fetchWishlistedTutors = async () => {
      try {
        setLoading(true);
        
        // Get current user from local storage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!currentUser || !(currentUser._id || currentUser.id) || currentUser.role !== 'student') {
          setError('You need to be logged in as a student to view your wishlist');
          setLoading(false);
          return;
        }
        
        // Use _id if available, otherwise fall back to id
        const studentId = currentUser._id || currentUser.id;
        
        // Fetch all wishlisted tutors for this student
        const response = await api.get(`/api/student/wishlist/${studentId}`);
        
        if (response.success && response.data) {
          // Extract tutor data from the wishlist entries
          const wishlistEntries = response.data;
          
          // Process and map each entry to get tutor details
          const wishlistedTutorsPromises = wishlistEntries.map(async entry => {
            if (!entry.tutorId) return null;
            
            try {
              // Get complete tutor data 
              const tutorResponse = await api.get(`/api/tutor/${entry.tutorId._id || entry.tutorId}`);
              
              if (!tutorResponse.success || !tutorResponse.data) {
                return null;
              }
              
              const tutorData = {
                ...tutorResponse.data,
                hourlyRate: tutorResponse.data.hourlyRate || { min: 0, max: 0 },
                subjects: Array.isArray(tutorResponse.data.subjects) ? tutorResponse.data.subjects : [],
              };
              
              // Fetch user data for this tutor
              try {
                const userResponse = await api.get(`/api/users/${tutorData.userId}`);
                
                if (userResponse.success && userResponse.data) {
                  // Add city information directly to tutor object
                  tutorData.city = userResponse.data.city;
                }
              } catch (err) {
                console.error(`Error fetching user data for tutor ${tutorData.userId}:`, err);
              }
              
              return tutorData;
            } catch (err) {
              console.error(`Error fetching tutor data for ${entry.tutorId}:`, err);
              return null;
            }
          });
          
          // Wait for all tutor data to be fetched
          const processedTutors = (await Promise.all(wishlistedTutorsPromises)).filter(Boolean);
          
          setTutors(processedTutors);
          setFilteredTutors(processedTutors);
          
          // Extract unique subjects for filter options
          const uniqueSubjects = new Set();
          // Extract unique locations for filter options
          const uniqueLocations = new Set(['Online']);
          
          processedTutors.forEach(tutor => {
            // Extract subjects/topics
            if (tutor.subjects && Array.isArray(tutor.subjects)) {
              tutor.subjects.forEach(subject => {
                if (typeof subject === 'string') {
                  uniqueSubjects.add(subject);
                } else if (typeof subject === 'object' && subject.name) {
                  uniqueSubjects.add(subject.name);
                }
              });
            }
            
            // Add city to locations if it exists
            if (tutor.city) {
              uniqueLocations.add(tutor.city);
            }
          });
          
          setSubjects(Array.from(uniqueSubjects).sort());
          setLocations(Array.from(uniqueLocations).sort());
        } else {
          setError('Failed to fetch wishlisted tutors');
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('An error occurred while fetching your wishlist');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlistedTutors();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    let results = [...tutors];
    
    // Filter by subject if selected
    if (filters.subject) {
      results = results.filter(tutor => {
        if (!tutor.subjects || !Array.isArray(tutor.subjects)) return false;
        
        return tutor.subjects.some(subj => {
          if (typeof subj === 'object' && subj.name) {
            return subj.name === filters.subject;
          }
          return subj === filters.subject;
        });
      });
    }
    
    // Filter by price range - with proper null checks
    results = results.filter(tutor => {
      if (!tutor.hourlyRate) return false;
      
      const minRate = tutor.hourlyRate.min || 0;
      const maxRate = tutor.hourlyRate.max || 0;
      
      return (
        minRate >= filters.priceMin &&
        (filters.priceMax === 0 || maxRate <= filters.priceMax)
      );
    });
    
    // Filter by rating threshold - with proper null check
    results = results.filter(tutor => 
      (tutor.ratingAverage || 0) >= filters.ratingThreshold
    );
    
    // For location filtering
    if (filters.location) {
      if (filters.location === 'Online') {
        results = results.filter(tutor => 
          tutor.teachingPreference === 'Online' || 
          tutor.teachingPreference === 'Both'
        );
      } else {
        // Filter by city
        results = results.filter(tutor => tutor.city === filters.location);
      }
    }
    
    setFilteredTutors(results);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      subject: '',
      location: '',
      priceMin: 0,
      priceMax: 10000,
      ratingThreshold: 0
    });
    setFilteredTutors(tutors);
  };
  
  // Apply filters whenever the filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters]);
  
  if (loading) return <div className="loading-state">Loading wishlist...</div>;
  if (error) return <div className="error-state">{error}</div>;
  
  return (
    <div className="find-tutor-container">
      <h1 className="page-title">My Wishlisted Tutors</h1>
      
      {/* Filter Section */}
      <div className="filters-section">
        <h2 className="filters-title">Filter Tutors</h2>
        <div className="filters-grid">
          {/* Subject Filter */}
          <div className="filter-group">
            <label htmlFor="subject">Subject/Topic</label>
            <select 
              id="subject" 
              name="subject" 
              value={filters.subject} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject, index) => (
                <option key={`subject-${index}`} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          {/* Location Filter */}
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select 
              id="location" 
              name="location" 
              value={filters.location} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={`location-${index}`} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div className="filter-group">
            <label>Price Range (PKR)</label>
            <div className="price-inputs">
              <input 
                type="number" 
                name="priceMin" 
                value={filters.priceMin} 
                onChange={handleFilterChange} 
                placeholder="Min" 
                className="price-input"
                min="0"
              />
              <span>to</span>
              <input 
                type="number" 
                name="priceMax" 
                value={filters.priceMax} 
                onChange={handleFilterChange} 
                placeholder="Max" 
                className="price-input"
                min="0"
              />
            </div>
          </div>
          
          {/* Rating Threshold Filter */}
          <div className="filter-group">
            <label htmlFor="ratingThreshold">Minimum Rating</label>
            <select 
              id="ratingThreshold" 
              name="ratingThreshold" 
              value={filters.ratingThreshold} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="0">Any Rating</option>
              <option value="1">1+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          
          {/* Reset Filters Button */}
          <div className="filter-group filter-actions">
            <button 
              className="reset-filters-button" 
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="results-count">
        {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor' : 'tutors'} in your wishlist
      </div>
      
      {/* Tutors Grid */}
      {filteredTutors.length === 0 ? (
        <div className="empty-state">You haven't added any tutors to your wishlist yet.</div>
      ) : (
        <div className="tutors-grid">
          {filteredTutors.map(tutor => (
            <TutorCard key={tutor._id || `tutor-${tutor.userId}`} tutorId={tutor._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;