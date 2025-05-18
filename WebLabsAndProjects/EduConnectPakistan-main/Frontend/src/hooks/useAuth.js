import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const navigate = useNavigate();

  // Check for existing user on hook initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        // Get current route
        const currentPath = window.location.pathname;
  
        // Prevent redirecting if already on a valid page
        if (currentPath === '/' || currentPath === '/login') {
          switch (parsedUser.role) {
            case 'student':
              navigate('/student');
              break;
            case 'tutor':
              navigate('/tutor');
              break;
            case 'admin':
              navigate('/admin');
              break;
            default:
              break;
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, [navigate]);
  
  // Login handler
  const login = async (loginData) => {
    setLoginError('');
    
    // Validate mandatory fields
    if (!loginData.email || !loginData.password) {
      setLoginError('Email and password are required');
      return false;
    }
    
    try {
      const response = await axios.post('/api/auth/login', loginData);
      
      // Enhance user object with both user ID and profile ID
      const userWithIds = {
        ...response.data.user,
        userId: response.data.user.id,  // User table ID
        profileId: response.data.user.profileId  // Student/Tutor table ID
      };
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userWithIds));
      
      // Update user state
      setUser(userWithIds);
      
      // Redirect based on user role
      switch(userWithIds.role) {
        case 'student':
          navigate('/student');
          break;
        case 'tutor':
          navigate('/tutor');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          break;
      }
      
      return true;
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
      return false;
    }
  };

  // Signup handler
  const signup = async (signupData) => {
    setSignupError('');
    
    // Validate mandatory fields
    if (!signupData.username || !signupData.email || !signupData.password) {
      setSignupError('Username, email, and password are required');
      return false;
    }
    
    // Ensure role is set (default to student if not provided)
    const dataToSend = {
      ...signupData,
      role: signupData.role || 'student'
    };
    
    try {
      const response = await axios.post('/api/auth/signup', dataToSend);
      
      // Enhance user object with both user ID and profile ID
      const userWithIds = {
        ...response.data.user,
        userId: response.data.user.id,  // User table ID
        profileId: response.data.user.profileId  // Student/Tutor table ID
      };
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userWithIds));
      
      // Update user state
      setUser(userWithIds);
      
      // Redirect based on user role
      switch(userWithIds.role) {
        case 'student':
          navigate('/student');
          break;
        case 'tutor':
          navigate('/tutor');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          break;
      }
      
      return true;
    } catch (error) {
      setSignupError(
        error.response?.data?.message || 'Signup failed. Please try again.'
      );
      return false;
    }
  };

  // Profile image update handler
  const updateProfileImage = (updatedUser) => {
    // Update local state
    setUser(prevUser => ({
      ...prevUser,
      profilePicture: updatedUser.profilePicture
    }));
    
    // Update localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedStoredUser = {
      ...storedUser,
      profilePicture: updatedUser.profilePicture
    };
    localStorage.setItem('user', JSON.stringify(updatedStoredUser));
    
    return true;
  };

  // Logout handler
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset user state
    setUser(null);
    
    // Redirect to login page
    navigate('/');
  };

  return {
    user,
    loginError,
    signupError,
    login,
    signup,
    logout,
    updateProfileImage
  };
};

// Other hooks remain the same
export const useFormData = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const resetForm = () => {
    setFormData(initialState);
  };
  
  return {
    formData,
    handleChange,
    resetForm,
    setFormData
  };
};

export const usePanelToggle = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  
  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };
  
  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };
  
  return {
    isRightPanelActive,
    handleSignUpClick,
    handleSignInClick
  };
};

// New hook for managing profile image upload modal
export const useProfileImageUpload = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };
  
  return {
    isUploadModalOpen,
    openUploadModal,
    closeUploadModal
  };
};