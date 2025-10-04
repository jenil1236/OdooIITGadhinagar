import React, { useState, useEffect } from "react";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockApprovals = [
      {
        id: 1,
        subject: "Business Travel - Client Meeting",
        owner: "John Smith",
        category: "Travel",
        status: "Pending",
        amount: 1500,
        date: "2025-10-03",
        currency: "USD",
        description:
          "Travel expenses for client meeting in New York including flight, hotel, and local transportation.",
        receipt: "receipt_travel_001.pdf",
        submittedDate: "2025-10-01",
        projectCode: "PROJ-2024-001",
        items: [
          { description: "Flight to NYC", amount: 650 },
          { description: "Hotel (3 nights)", amount: 600 },
          { description: "Local transportation", amount: 250 },
        ],
      },
      {
        id: 2,
        subject: "Team Lunch - Project Completion",
        owner: "Sarah Johnson",
        category: "Meals",
        status: "Pending",
        amount: 320,
        date: "2025-10-02",
        currency: "USD",
        description:
          "Team celebration lunch for successful project completion at Italian Restaurant.",
        receipt: "receipt_lunch_002.pdf",
        submittedDate: "2025-10-02",
        projectCode: "PROJ-2024-015",
        items: [{ description: "Team lunch", amount: 320 }],
      },
      {
        id: 3,
        subject: "Software Subscription",
        owner: "Mike Chen",
        category: "Software",
        status: "Pending",
        amount: 899,
        date: "2025-10-01",
        currency: "USD",
        description: "Annual subscription for design software and tools.",
        receipt: "receipt_software_003.pdf",
        submittedDate: "2025-09-28",
        projectCode: "PROJ-2024-008",
        items: [{ description: "Design Suite Subscription", amount: 899 }],
      },
    ];

    setApprovals(mockApprovals);

    // Calculate stats
    const pending = mockApprovals.filter((a) => a.status === "Pending").length;
    const totalAmount = mockApprovals.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    setStats({
      pending,
      approved: 15, // Mock data
      rejected: 3, // Mock data
      totalAmount,
    });
  }, []);

  const handleApprove = (id) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: "Approved" } : approval
      )
    );
    // In real app, make API call here
  };

  const handleReject = (id) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: "Rejected" } : approval
      )
    );
    // In real app, make API call here
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedApproval(null);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: "status-pending",
      Approved: "status-approved",
      Rejected: "status-rejected",
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>{status}</span>
    );
  };

  return (
    <div className="manager-dashboard">
      <header className="dashboard-header">
        <h1>Manager's Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Manager</span>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${stats.totalAmount.toLocaleString()}
          </div>
          <div className="stat-label">Total Amount Pending</div>
        </div>
      </div>

      {/* Approvals Section */}
      <section className="approvals-section">
        <div className="section-header">
          <h2>Approvals to Review</h2>
          <div className="section-actions">
            <button className="btn btn-primary">Export Report</button>
          </div>
        </div>

        {approvals.length === 0 ? (
          <div className="empty-state">
            <p>No approvals pending review</p>
          </div>
        ) : (
          <div className="approvals-table-container">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Approval Subject</th>
                  <th>Request Owner</th>
                  <th>Category</th>
                  <th>Request Status</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="subject-cell">
                      <div className="subject-title">{approval.subject}</div>
                    </td>
                    <td>{approval.owner}</td>
                    <td>
                      <span className="category-tag">{approval.category}</span>
                    </td>
                    <td>{getStatusBadge(approval.status)}</td>
                    <td className="amount-cell">
                      ${approval.amount.toLocaleString()} {approval.currency}
                    </td>
                    <td>{approval.date}</td>
                    <td>
                      <div className="action-buttons">
                        {approval.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(approval.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(approval.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleViewDetails(approval)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Activity Section */}
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-content">
              <span className="activity-user">John Smith</span>
              submitted a travel expense request
            </div>
            <div className="activity-time">2 hours ago</div>
          </div>
          <div className="activity-item">
            <div className="activity-content">
              You approved{" "}
              <span className="activity-user">Sarah Johnson's</span> meal
              expense
            </div>
            <div className="activity-time">1 day ago</div>
          </div>
          <div className="activity-item">
            <div className="activity-content">
              <span className="activity-user">Mike Chen</span> updated software
              subscription request
            </div>
            <div className="activity-time">2 days ago</div>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {showDetailsModal && selectedApproval && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Expense Request Details</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Subject:</label>
                    <span>{selectedApproval.subject}</span>
                  </div>
                  <div className="detail-item">
                    <label>Request Owner:</label>
                    <span>{selectedApproval.owner}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span className="category-tag">
                      {selectedApproval.category}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    {getStatusBadge(selectedApproval.status)}
                  </div>
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span className="amount-large">
                      ${selectedApproval.amount.toLocaleString()}{" "}
                      {selectedApproval.currency}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Project Code:</label>
                    <span>{selectedApproval.projectCode}</span>
                  </div>
                  <div className="detail-item">
                    <label>Submitted Date:</label>
                    <span>{selectedApproval.submittedDate}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <p className="description-text">
                  {selectedApproval.description}
                </p>
              </div>

              <div className="detail-section">
                <h4>Expense Items</h4>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedApproval.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-section">
                <h4>Attachments</h4>
                <div className="attachment-item">
                  <span className="attachment-icon">📎</span>
                  <span className="attachment-name">
                    {selectedApproval.receipt}
                  </span>
                  <button className="btn btn-outline btn-sm">Download</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedApproval.status === "Pending" && (
                <div className="modal-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleApprove(selectedApproval.id);
                      closeModal();
                    }}
                  >
                    Approve Expense
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleReject(selectedApproval.id);
                      closeModal();
                    }}
                  >
                    Reject Expense
                  </button>
                </div>
              )}
              <button className="btn btn-outline" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
