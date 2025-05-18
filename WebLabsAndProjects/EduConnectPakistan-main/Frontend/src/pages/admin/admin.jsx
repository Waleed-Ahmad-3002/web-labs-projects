import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Inbox, LogOut } from 'lucide-react';
import '../../assets/css/Navbar.css';
import Navbar from '../../components/Navbar';

const AdminDashboard = ({
  logo = "EduConnect Pakistan",
  menuItems = [],
  sidebarItems = []
}) => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Create the navbar menu items from the sidebar items
  const adminNavItems = [
    {
      icon: <FileText className="menu-item-icon" />,
      label: "Reports",
      path: "/admin/reports"
    },
    {
      icon: <Inbox className="menu-item-icon" />,
      label: "Requests",
      path: "/admin/requests"
    }
  ];
  
  // Use provided menuItems or our admin nav items
  const navItemsToUse = menuItems.length > 0 ? menuItems : adminNavItems;
  
  return (
    <div className="admin-dashboard-container">
      <Navbar
        logo={logo}
        menuItems={navItemsToUse}
        showLogoutButton={true}
        onLogout={logout}
      />
      
      <div className="admin-content-area">
        <main className="admin-main-content" style={{ width: '100%' }}>
          {/* Your main content here */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;