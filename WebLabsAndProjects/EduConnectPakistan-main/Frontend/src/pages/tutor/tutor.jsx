import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/Navbar.css';
import '../../assets/css/Sidebar.css';
import TutorSidebar from '../../components/TutorSidebar';
import Navbar from '../../components/Navbar';

const TutorDashboard = ({
  logo = "EduConnect Pakistan",
  menuItems = [],
  sidebarItems = [] // Add sidebarItems prop
}) => {
  const { user } = useAuth();
  
  return (
    <div className="tutor-dashboard-container">
      {/* Use the updated Navbar component */}
      <Navbar 
        logo={logo}
        menuItems={menuItems}
      />
      
      {/* Main content area with sidebar */}
      <div className="tutor-content-area">
        {/* Sidebar on the left */}
        <TutorSidebar sidebarItems={sidebarItems} />
        
        {/* Main content on the right */}
        <main className="tutor-main-content">
          {/* Your page content will go here */}
          {/* You might want to use React Router's Outlet here if using nested routes */}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;