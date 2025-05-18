import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { User, Check, X, Eye, Calendar, AlertCircle, MessageSquare } from 'lucide-react';
import PreviewTutor from '../tutor/PreviewTutor';
import '../../assets/css/AdminVerificationRequests.css';

const AdminVerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/verification-requests');
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests. Please try again later.');
      setLoading(false);
    }
  };

  const previewTutorProfile = async (tutorId, requestId) => {
    try {
      setPreviewMode(true);
      setSelectedRequestId(requestId);
      const response = await api.get(`/api/admin/tutor-verification/${tutorId}`);
      setSelectedTutor(response.data);
    } catch (err) {
      console.error('Error fetching tutor details:', err);
      setError('Failed to load tutor profile. Please try again.');
    }
  };

  const closePreview = () => {
    setPreviewMode(false);
    setSelectedTutor(null);
    setSelectedRequestId(null);
  };

  const openCommentsModal = () => {
    setShowCommentsModal(true);
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
  };

  const updateVerificationStatus = async (requestId, status) => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/verification-requests/${requestId}`, {
        status,
        adminComments
      });
      
      // Refresh the request list
      fetchVerificationRequests();
      setActionLoading(false);
      
      // Close the preview if open
      if (previewMode) {
        closePreview();
      }
      
      // Close comments modal if open
      if (showCommentsModal) {
        closeCommentsModal();
      }
      
      // Reset comments
      setAdminComments('');
      
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError('Failed to update verification status. Please try again.');
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading verification requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <AlertCircle size={24} />
        <p>{error}</p>
        <button onClick={fetchVerificationRequests}>Try Again</button>
      </div>
    );
  }

  if (previewMode && selectedTutor) {
    return (
      <div className="tutor-preview-wrapper">
        <div className="preview-header">
          <button className="back-button" onClick={closePreview}>
            &larr; Back to Requests
          </button>
          <h2>Tutor Profile Preview</h2>
          
          {/* Action buttons moved here but separate from the preview */}
          <div className="preview-actions">
            <button 
              className="comments-button"
              onClick={openCommentsModal}
            >
              <MessageSquare size={16} />
              Add Comments
            </button>
            <button 
              className="reject-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reject this verification request?')) {
                  updateVerificationStatus(selectedRequestId, 'rejected');
                }
              }}
              disabled={actionLoading}
            >
              <X size={16} />
              Reject
            </button>
            <button 
              className="approve-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to approve this verification request?')) {
                  updateVerificationStatus(selectedRequestId, 'approved');
                }
              }}
              disabled={actionLoading}
            >
              <Check size={16} />
              Approve
            </button>
          </div>
        </div>
        
        {/* PreviewTutor component without admin controls */}
        <PreviewTutor tutorData={selectedTutor} isAdminView={true} />
        
        {/* Comments Modal */}
        {showCommentsModal && (
          <div className="comments-modal-overlay">
            <div className="comments-modal">
              <div className="modal-header">
                <h3>Admin Comments</h3>
                <button className="close-modal" onClick={closeCommentsModal}>×</button>
              </div>
              <div className="modal-body">
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Add any notes about this verification decision"
                  rows={5}
                />
              </div>
              <div className="modal-footer">
                <button className="cancel-button" onClick={closeCommentsModal}>Cancel</button>
                <button className="save-button" onClick={closeCommentsModal}>Save Comments</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-requests-container">
      <div className="admin-header">
        <h1>Tutor Verification Requests</h1>
        <div className="request-stats">
          <div className="stat-item">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {requests.filter(req => req.status === 'pending').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="no-requests">
          <User size={48} color="#2563eb" />
          <h3>No Verification Requests</h3>
          <p>There are currently no tutor verification requests to process.</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className={`status-${request.status}`}>
                  <td>{request.tutorId.userId.email}</td>
                  <td className="date-cell">
                    <Calendar size={14} />
                    {formatDate(request.requestDate)}
                  </td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="preview-button"
                        onClick={() => previewTutorProfile(request.tutorId._id, request._id)}
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className="comments-button"
                            onClick={() => {
                              setSelectedRequestId(request._id);
                              openCommentsModal();
                            }}
                          >
                            <MessageSquare size={16} />
                            Comments
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to reject this verification request?')) {
                                updateVerificationStatus(request._id, 'rejected');
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <X size={16} />
                            Reject
                          </button>
                          <button 
                            className="approve-button"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to approve this verification request?')) {
                                updateVerificationStatus(request._id, 'approved');
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <Check size={16} />
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Comments Modal (when not in preview mode) */}
      {showCommentsModal && !previewMode && (
        <div className="comments-modal-overlay">
          <div className="comments-modal">
            <div className="modal-header">
              <h3>Admin Comments</h3>
              <button className="close-modal" onClick={closeCommentsModal}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder="Add any notes about this verification decision"
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeCommentsModal}>Cancel</button>
              <button className="save-button" onClick={closeCommentsModal}>Save Comments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationRequests;