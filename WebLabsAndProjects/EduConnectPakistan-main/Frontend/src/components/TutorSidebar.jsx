import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  LogOut,
  Users,
  Verified,
  User,
  Clock,
  Star // Added Star icon for reviews
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TutorSidebar = ({
  sidebarItems = [],
  logo = "EduConnect"
}) => {
  const { logout } = useAuth();
  
  // Default sidebar items if not provided
  const defaultSidebarItems = [
    {
      icon: <Clock className="sidebar-item-icon" />,
      label: "Add Availability",
      path: "/tutor/availability"
    },
    {
      icon: <Users className="sidebar-item-icon" />,
      label: "Manage Sessions",
      path: "/tutor/sessions"
    },
    {
      icon: <Star className="sidebar-item-icon" />, // Changed from Calendar to Star
      label: "Reviews", // Changed from Calendar to Reviews
      path: "/tutor/reviews"
    },
    {
      icon: <DollarSign className="sidebar-item-icon" />,
      label: "Income",
      path: "/tutor/income"
    },
    {
      icon: <Verified className="sidebar-item-icon" />,
      label: "Get Verified",
      path: "/tutor/verification"
    },
    {
      icon: <User className="sidebar-item-icon" />,
      label: "Preview Profile",
      path: "/tutor/preview"
    }
  ];
  
  // Use provided sidebar items or default items
  const itemsToRender = sidebarItems.length > 0
    ? sidebarItems
    : defaultSidebarItems;
  
  return (
    <div className="tutor-sidebar">
      <div className="sidebar-content">
        {/* Sidebar Menu Items */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {itemsToRender.map((item, index) => (
              <li
                key={index}
                className="sidebar-menu-item"
              >
                <Link
                  to={item.path}
                  className={`sidebar-menu-link ${item.label === "Get Verified" ? "verification-item" : ""}`}
                >
                  {item.icon}
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Section */}
        <div className="sidebar-logout">
          <button
            onClick={logout}
            className="sidebar-logout-button"
          >
            <LogOut className="sidebar-item-icon" />
            <span className="sidebar-item-label">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorSidebar;