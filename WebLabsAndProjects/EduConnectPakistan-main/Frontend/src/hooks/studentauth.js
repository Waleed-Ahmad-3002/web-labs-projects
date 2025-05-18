import { useState, useEffect } from 'react';
import api from '../utils/api';

// Custom hook to handle authentication and user/student profile data
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!userData) {
          setUser(null);
          setStudentProfile(null);
          setLoading(false);
          return;
        }
        
        // Check for either id or _id property
        const userId = userData.id || userData._id;
        
        if (!userId) {
          setUser(null);
          setStudentProfile(null);
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        // Check if user has a student profile
        try {
          const studentResponse = await api.get(`/api/student/user/${userId}`);
          
          if (studentResponse.success && studentResponse.data) {
            setStudentProfile(studentResponse.data);
          }
        } catch (studentErr) {
          console.error('Error fetching student profile:', studentErr);
          // User might not have a student profile, which is fine
          setStudentProfile(null);
        }
      } catch (err) {
        console.error('Error in auth process:', err);
        setError(err.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Check if user is logged in
  const isAuthenticated = !!user;
  
  // Check if user is a student
  const isStudent = !!studentProfile;
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStudentProfile(null);
    // Optional: redirect to login page
    window.location.href = '/';
  };
  
  return {
    user,
    studentProfile,
    isAuthenticated,
    isStudent,
    loading,
    error,
    logout
  };
};

export default useAuth;