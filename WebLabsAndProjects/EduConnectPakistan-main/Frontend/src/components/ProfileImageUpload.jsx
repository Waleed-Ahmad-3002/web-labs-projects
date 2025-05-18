import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload } from 'lucide-react';
import '../assets/css/ProfileImageUpload.css';

const ProfileImageUpload = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file type
    if (file && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    setError('');
    setSelectedFile(file);
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to upload an image');
        setUploading(false);
        return;
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('profileImage', selectedFile);
      
      // Send request to upload endpoint
      const response = await axios.post('/api/users/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Call success callback with updated user data
      if (onSuccess && response.data) {
        onSuccess(response.data);
      }
      
      // Close modal
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-image-upload-overlay">
      <div className="profile-image-upload-modal">
        <div className="profile-image-upload-header">
          <h2>Upload Profile Picture</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="profile-image-upload-content">
          {previewUrl ? (
            <div className="image-preview-container">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="image-preview" 
              />
            </div>
          ) : (
            <div className="upload-placeholder">
              <Upload size={48} />
              <p>Select an image to upload</p>
            </div>
          )}
          
          <input
            type="file"
            id="profile-image-input"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          
          <label htmlFor="profile-image-input" className="file-input-label">
            Choose Image
          </label>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="button-container">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              className="upload-button" 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;