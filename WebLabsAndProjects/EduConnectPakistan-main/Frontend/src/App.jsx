import React from 'react';
import { Routes, Route,useParams } from 'react-router-dom';
import LoginSignup from './pages/auth/LoginSignup';
import StudentDashboard from './pages/student/student';
import FindTutor from './pages/student/findtutor';
import WishlistPage from './pages/student/WishlistPage';
import TutorDashboard from './pages/tutor/tutor';
import AdminDashboard from './pages/admin/admin';
import TutorVerification from './pages/tutor/TutorVerification';
import PreviewTutor from './pages/tutor/PreviewTutor';
import Request from './pages/admin/AdminVerificationRequests'
import AddAvailabilty from './pages/tutor/addavailability'
import CheckAvailability  from './pages/student/checkavailability'
import ManageSession from './pages/tutor/managesession'
import Payment from './pages/student/payment'
import TutorIncome from './pages/tutor/income';
import ManageStudentSession from './pages/student/manageStudentSession'
import Review from './pages/student/review';
import TutorReviews from './pages/tutor/tutorreviews'
import Reports from './pages/admin/reports';

const TutorProfilePage = () => {
  const { tutorId } = useParams();
  return <PreviewTutor tutorId={tutorId} isAdminView={false} />;
};
const TutorAvailabilityPage = () => {
  const { tutorId } = useParams();
  return <CheckAvailability tutorId={tutorId} />; // Assuming you have a TutorAvailability component
};
function App() {
  return (

    
    <Routes>
      <Route index element={<LoginSignup />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/reviews" element={<Review />} />
      <Route path="/student/manage-session" element={<ManageStudentSession />} />
      <Route path="/student/payment" element={<Payment />} />
      <Route path="/student/find-tutor" element={<FindTutor />} />
      <Route path="/tutor" element={<TutorDashboard />} />
      <Route path="/tutor/reviews" element={<TutorReviews />} />
      <Route path="/tutor/sessions" element={<ManageSession />} />
      <Route path="/tutor/income" element={<TutorIncome />} />
      <Route path="/tutor/profile/:tutorId" element={<TutorProfilePage />} />
      <Route path="/tutor/:tutorId/availability" element={<TutorAvailabilityPage />} />
      <Route path="/student/wishlist" element={<WishlistPage />} />
      <Route path="/tutor/verification" element={<TutorVerification />} />
      <Route path="/tutor/availability" element={<AddAvailabilty />} />
      <Route path="/tutor/preview" element={<PreviewTutor />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/requests" element={<Request />} />
      <Route path="/admin/reports" element={<Reports />} />
    </Routes>
  );
}


export default App;