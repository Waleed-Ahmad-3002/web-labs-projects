import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import '../assets/css/Navbar.css';
import { useAuth, useProfileImageUpload } from '../hooks/useAuth';
import ProfileImageUpload from './ProfileImageUpload';

const Navbar = ({
  logo = "EduConnect Pakistan",
  menuItems = [],
  showLogoutButton = false,
  onLogout = null
}) => {
  const { user, updateProfileImage, logout } = useAuth();
  const { isUploadModalOpen, openUploadModal, closeUploadModal } = useProfileImageUpload();

  // Handle successful image upload
  const handleImageUploadSuccess = (data) => {
    if (data && data.user) {
      updateProfileImage(data.user);
    }
  };
  
  // Use the provided onLogout or the default logout from useAuth
  const handleLogout = onLogout || logout;

  return (
    <>
      <nav className="navbar">
        {/* Left Side - Logo */}
        <div className="navbar-logo-container">
          <Link to="/" className="navbar-logo">
            {logo}
          </Link>
        </div>
        
        {/* Center - Dynamic Menu Items */}
        <div className="navbar-menu-container">
          <ul className="navbar-menu">
            {menuItems.map((item, index) => (
              <li key={index} className="navbar-menu-item">
                <Link to={item.path}>
                  {item.icon && <span className="menu-item-icon">{item.icon}</span>}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Right Side - User Profile or Logout Button */}
        <div className="navbar-user-container">
          {user?.username && (
            <span className="navbar-username">
              {user.username}
            </span>
          )}
          
          {showLogoutButton ? (
            <button 
              className="navbar-logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="navbar-logout-icon" size={24} />
            </button>
          ) : (
            <div
              className="navbar-user-avatar"
              onClick={openUploadModal}
              title="Click to update profile picture"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username || "User Profile"}
                  className="navbar-user-image"
                />
              ) : (
                <div className="navbar-user-default-avatar">
                  <User className="navbar-user-icon" size={24} />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Profile Image Upload Modal */}
      {!showLogoutButton && (
        <ProfileImageUpload
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
          onSuccess={handleImageUploadSuccess}
        />
      )}
    </>
  );
};

export default Navbar;