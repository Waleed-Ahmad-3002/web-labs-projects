import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import { Book, Calendar, MessageSquare, UserCog, Heart, CreditCard, Clock, Star } from 'lucide-react';
import '../../assets/css/Navbar.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }
  
  // Updated menu items with Review option
  const menuItems = [
    {
      icon: <Book size={18} />,
      label: "Find Tutor",
      path: "/student/find-tutor"
    },
    {
      icon: <Heart size={18} />,
      label: "Wishlist",
      path: "/student/wishlist"
    },
    {
      icon: <CreditCard size={18} />,
      label: "Payment",
      path: "/student/payment"
    },
    {
      icon: <Clock size={18} />,
      label: "Manage Session",
      path: "/student/manage-session"
    },
    {
      icon: <Star size={18} />,
      label: "Reviews",
      path: "/student/reviews"
    }
  ];

  return (
    <div className="student-dashboard-container">
      <Navbar 
        logo="EduConnect Pakistan"
        menuItems={menuItems}
        showLogoutButton={true}
        onLogout={logout}
      />
      
      <div className="admin-content-area">
        <main className="admin-main-content" style={{ width: '100%' }}>
          {/* Your main dashboard content */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;