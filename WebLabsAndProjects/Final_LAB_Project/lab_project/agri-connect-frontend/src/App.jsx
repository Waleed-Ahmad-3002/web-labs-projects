// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Layout
import MainLayout from './layouts/MainLayout';

// Page Components
import FarmDashboard from './pages/FarmDashboard.jsx';
import CropPlanningPage from './pages/CropPlanningPage';
import FinancialTrackerPage from './pages/FinancialTrackerPage';
import MarketplaceOverviewPage from './pages/marketplace/MarketplaceOverviewPage';
import ProductListingsPage from './pages/marketplace/ProductListingsPage';
import CartPage from './pages/cart/CartPage';
import MapAddressPage from './pages/cart/MapAddressPage';
import MapViewPage from './pages/MapViewPage';
import LoginPage from './pages/LoginPage'; // Your existing LoginPage
import SignupPage from './pages/SignupPage'; // Your existing SignupPage
import GoogleCallbackPage from './components/Auth/GoogleCallbackHandler'; // Your existing GoogleCallbackHandler

// --- NEW IMPORTS FOR PASSWORD RESET ---
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
// --- END NEW IMPORTS ---

// Farmer Detail Pages
import TaskManagementPage from './pages/TaskManagementPage';
import MarketPriceManagementPage from './pages/MarketPriceManagementPage';
import FarmerNotificationsPage from './pages/FarmerNotificationsPage';

// Admin Page Components
import MarketplaceManagementPage from './pages/admin/MarketplaceManagementPage';
import FarmActivitySupervisionPage from './pages/admin/FarmActivitySupervisionPage';

// Placeholder pages
const ProfilePage = () => <div className="container mt-4"><h2>Profile Page</h2></div>;
const SettingsPage = () => <div className="container mt-4"><h2>Settings Page</h2></div>;
const MarketTrendsPage = () => <div className="container mt-4"><h2>Market Trends</h2></div>;
const NotificationsPage = () => <div className="container mt-4"><h2>Notifications</h2><p>This is the general user notification page.</p></div>;
const MyOrdersPage = () => <div className="container mt-4"><h2>My Orders (Buyer)</h2></div>;
const AdminUserManagementPage = () => <div className="container mt-4"><h2>Admin: User Management</h2></div>;

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles/App.css'; // Your custom App.css

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Routes WITHOUT MainLayout (Authentication, Password Reset, etc.) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          {/* --- NEW ROUTES FOR PASSWORD RESET (typically outside MainLayout) --- */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* --- END NEW ROUTES --- */}

          {/* Routes WITH MainLayout */}
          <Route element={<MainLayout />}>
            {/* Farmer Routes */}
            <Route path="/dashboard" element={<FarmDashboard />} />
            <Route path="/planning" element={<CropPlanningPage />} />
            <Route path="/financials" element={<FinancialTrackerPage />} />
            <Route path="/tasks" element={<TaskManagementPage />} />
            <Route path="/market-prices" element={<MarketPriceManagementPage />} />
            <Route path="/farmer-notifications" element={<FarmerNotificationsPage />} />
            <Route path="/marketplace/my-listings" element={<ProductListingsPage />} />

            {/* Marketplace (Buyer/General) Routes */}
            <Route path="/marketplace" element={<MarketplaceOverviewPage />} />
            <Route path="/marketplace/trends" element={<MarketTrendsPage />} />
            <Route path="/marketplace/my-orders" element={<MyOrdersPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/cart/map-address" element={<MapAddressPage />} />

            {/* Common Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/map-view" element={<MapViewPage />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/marketplace-management" element={<MarketplaceManagementPage />} />
            <Route path="/admin/farm-activity" element={<FarmActivitySupervisionPage />} />
            <Route path="/admin/users" element={<AdminUserManagementPage />} />

            <Route path="/" element={<MarketplaceOverviewPage />} />

            <Route path="*" element={
              <div className="text-center mt-5 py-5">
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
                <Link to="/" className="btn btn-success">Go to Homepage</Link>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}
export default App;