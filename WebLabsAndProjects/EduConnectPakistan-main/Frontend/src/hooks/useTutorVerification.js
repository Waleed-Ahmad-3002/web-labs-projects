// useTutorVerification.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import api from '../utils/api'; // Import the centralized API

export const useTutorVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const initialState = {
    bio: '',
    qualifications: [{ degree: '', institution: '', year: '', certificate: '' }],
    experience: [{ title: '', organization: '', years: '', description: '' }],
    subjects: [{ name: '', level: 'Primary' }],
    hourlyRate: { min: '', max: '' },
    teachingPreference: 'Both'
  };

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // Fetch existing tutor profile on component mount
  useEffect(() => {
    const fetchTutorProfile = async () => {
      if (!user) return;

      try {
        const response = await api.get('/api/tutor/profile');
        
        if (response.data) {
          setExistingProfile(response.data);
          
          // Merge existing data with initial state
          setFormData(prevData => ({
            ...prevData,
            ...response.data,
            hourlyRate: response.data.hourlyRate || { min: '', max: '' }
          }));
        }
      } catch (err) {
        // Profile might not exist yet, which is fine
        console.log('No existing profile found', err);
      }
    };

    fetchTutorProfile();
  }, [user]);

  // Handle input changes for main form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle nested array field changes
  const handleNestedChange = (type, index, e) => {
    const { name, value } = e.target;

    const updatedArray = [...formData[type]];
    updatedArray[index] = {
      ...updatedArray[index],
      [name]: value
    };

    setFormData(prev => ({
      ...prev,
      [type]: updatedArray
    }));
  };

  // Add this function to specifically handle hourly rate changes
  const handleHourlyRateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      hourlyRate: {
        ...prev.hourlyRate,
        [name]: value
      }
    }));
  };

  // Add new entry to qualifications, experience, or subjects
  const addEntry = (type) => {
    let newEntry;
    switch(type) {
      case 'qualifications':
        newEntry = { degree: '', institution: '', year: '', certificate: '' };
        break;
      case 'experience':
        newEntry = { title: '', organization: '', years: '', description: '' };
        break;
      case 'subjects':
        newEntry = { name: '', level: 'Primary' };
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newEntry]
    }));
  };

  // Remove an entry from qualifications, experience, or subjects
  const removeEntry = (type, index) => {
    const updatedArray = formData[type].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [type]: updatedArray
    }));
  };

  // Validation method
  const validateForm = () => {
    // Comprehensive validation
    if (!formData.bio || formData.bio.length < 50) {
      setError('Bio must be at least 50 characters');
      return false;
    }

    if (!formData.qualifications || formData.qualifications.length === 0) {
      setError('Please add at least one qualification');
      return false;
    }

    if (!formData.experience || formData.experience.length === 0) {
      setError('Please add at least one experience entry');
      return false;
    }

    if (!formData.subjects || formData.subjects.length === 0) {
      setError('Please add at least one subject');
      return false;
    }

    if (!formData.hourlyRate || !formData.hourlyRate.min || !formData.hourlyRate.max) {
      setError('Please specify both minimum and maximum hourly rates');
      return false;
    }

    if (parseFloat(formData.hourlyRate.min) >= parseFloat(formData.hourlyRate.max)) {
      setError('Minimum rate must be less than maximum rate');
      return false;
    }

    return true;
  };

  // Submit verification form
  const submitVerification = async () => {
    if (!user) {
      setError('Please log in to submit verification');
      return false;
    }

    // Validate form
    if (!validateForm()) {
      return false;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        userId: user.userId,
        profileId: user.profileId
      };

      await api.post('/api/tutor/verify', dataToSubmit);

      // Handle successful submission
      setLoading(false);
      navigate('/tutor');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification submission failed';
      setError(errorMessage);
      console.error('Verification error:', err);
      setLoading(false);
      return false;
    }
  };
// Add this to your useTutorVerification.js
const handleApply = async () => {
  if (!user) {
    setError('Please log in to apply');
    return false;
  }
  
  setLoading(true);
  setError('');
  
  try {
    console.log('Applying with tutorId:', user.profileId); // Debug log
    
    // Simple request to create a verification request
    const response = await api.post('/api/tutor/apply', {
      tutorId: user.profileId // Use profileId from useAuth
    });
    
    console.log('Application response:', response.data); // Debug log
    setLoading(false);
    
    // You might want to update UI or redirect
    return response.data;
  } catch (err) {
    console.error('Application error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      profileId: user?.profileId
    });
    
    const errorMessage = err.response?.data?.message || 'Application submission failed';
    setError(errorMessage);
    setLoading(false);
    return false;
  }
};
  return {
    formData,
    error,
    loading,
    existingProfile,
    handleChange,
    handleNestedChange,
    handleHourlyRateChange,
    addEntry,
    removeEntry,
    submitVerification,
    handleApply 
  };
};