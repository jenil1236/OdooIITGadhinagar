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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending approvals from API
  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/manager/approvals", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch approvals");
      }

      const data = await response.json();

      // Transform API data to match frontend structure
      const transformedApprovals = data.expenses.map((expense) => ({
        id: expense._id,
        subject: expense.description || "Expense Request",
        owner: expense.ownerId?.name || "Unknown User",
        category: expense.category || "General",
        status: mapStatus(expense.status),
        amount: expense.amount || 0,
        date: new Date(expense.createdAt).toLocaleDateString(),
        currency: expense.currency || "USD",
        description: expense.details || "No description provided",
        receipt: expense.receiptUrl ? "receipt.pdf" : "No receipt",
        submittedDate: new Date(expense.createdAt).toLocaleDateString(),
        projectCode: expense.projectCode || "N/A",
        items: expense.items || [
          { description: "Expense", amount: expense.amount },
        ],
        // Backend specific fields
        _id: expense._id,
        isSequentialApproval: expense.isSequentialApproval,
        currentApproverId: expense.currentApproverId,
        approvalFlow: expense.approvalFlow,
        minimumApprovalPercentage: expense.minimumApprovalPercentage,
      }));

      setApprovals(transformedApprovals);

      // Calculate stats from API data
      if (data.stats) {
        setStats({
          pending: data.stats.pending,
          approved: data.stats.approved,
          rejected: data.stats.rejected,
          totalAmount: data.stats.totalAmount,
        });
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
      // Fallback to empty state
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapStatus = (backendStatus) => {
    const statusMap = {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };
    return statusMap[backendStatus] || "Pending";
  };

  // Map frontend status to backend status
  const mapToBackendStatus = (frontendStatus) => {
    const statusMap = {
      Approved: "APPROVED",
      Rejected: "REJECTED",
      Pending: "PENDING",
    };
    return statusMap[frontendStatus] || "PENDING";
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/manager/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve expense");
      }

      // Refresh the approvals list
      await fetchApprovals();
    } catch (error) {
      console.error("Error approving expense:", error);
      alert("Failed to approve expense. Please try again.");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`/api/manager/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject expense");
      }

      // Refresh the approvals list
      await fetchApprovals();
    } catch (error) {
      console.error("Error rejecting expense:", error);
      alert("Failed to reject expense. Please try again.");
    }
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

  // Check if manager can approve this expense based on backend logic
  const canManagerApprove = (approval) => {
    if (!approval.isSequentialApproval) return true;

    if (
      approval.isSequentialApproval &&
      approval.currentApproverId === getUserManagerId()
    ) {
      return true;
    }

    return false;
  };

  // Mock function - replace with actual user manager ID from your auth context
  const getUserManagerId = () => {
    return "current-user-manager-id"; // This should come from your auth context
  };

  const getApprovalFlowInfo = (approval) => {
    if (!approval.approvalFlow) return null;

    const currentApprover = approval.approvalFlow.find(
      (flow) => flow.approverId === approval.currentApproverId
    );

    return {
      currentApprover: currentApprover?.approverId?.name || "Unknown",
      totalApprovers: approval.approvalFlow.length,
      approvedCount: approval.approvalFlow.filter(
        (flow) => flow.status === "APPROVED"
      ).length,
      requiredApproval: approval.minimumApprovalPercentage,
    };
  };

  if (isLoading) {
    return (
      <div className="manager-dashboard">
        <div className="loading-state">
          <p>Loading approvals...</p>
        </div>
      </div>
    );
  }

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
            <button className="btn btn-primary" onClick={fetchApprovals}>
              Refresh
            </button>
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
                {approvals.map((approval) => {
                  const canApprove = canManagerApprove(approval);
                  const flowInfo = getApprovalFlowInfo(approval);

                  return (
                    <tr key={approval.id}>
                      <td className="subject-cell">
                        <div className="subject-title">{approval.subject}</div>
                        {flowInfo && (
                          <div className="approval-progress">
                            {flowInfo.approvedCount}/{flowInfo.totalApprovers}{" "}
                            approved
                            {approval.isSequentialApproval && ` (Sequential)`}
                          </div>
                        )}
                      </td>
                      <td>{approval.owner}</td>
                      <td>
                        <span className="category-tag">
                          {approval.category}
                        </span>
                      </td>
                      <td>{getStatusBadge(approval.status)}</td>
                      <td className="amount-cell">
                        ${approval.amount.toLocaleString()} {approval.currency}
                      </td>
                      <td>{approval.date}</td>
                      <td>
                        <div className="action-buttons">
                          {approval.status === "Pending" && canApprove && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApprove(approval._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(approval._id)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Activity Section */}
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {approvals.slice(0, 3).map((approval) => (
            <div className="activity-item" key={approval.id}>
              <div className="activity-content">
                <span className="activity-user">{approval.owner}</span>
                submitted a {approval.category.toLowerCase()} expense request
              </div>
              <div className="activity-time">{approval.date}</div>
            </div>
          ))}
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
                  {selectedApproval.approvalFlow && (
                    <div className="detail-item full-width">
                      <label>Approval Progress:</label>
                      <span>
                        {
                          selectedApproval.approvalFlow.filter(
                            (flow) => flow.status === "APPROVED"
                          ).length
                        }
                        /{selectedApproval.approvalFlow.length} approved
                        {selectedApproval.minimumApprovalPercentage &&
                          ` (${selectedApproval.minimumApprovalPercentage}% required)`}
                      </span>
                    </div>
                  )}
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
                <h4>Approval Flow</h4>
                <div className="approval-flow">
                  {selectedApproval.approvalFlow?.map((flow, index) => (
                    <div key={index} className="flow-item">
                      <span className="approver-name">
                        {flow.approverId?.name || `Approver ${index + 1}`}
                      </span>
                      <span
                        className={`flow-status ${flow.status.toLowerCase()}`}
                      >
                        {flow.status}
                      </span>
                      {flow.approverId ===
                        selectedApproval.currentApproverId && (
                        <span className="current-approver">Current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedApproval.status === "Pending" &&
                canManagerApprove(selectedApproval) && (
                  <div className="modal-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleApprove(selectedApproval._id);
                        closeModal();
                      }}
                    >
                      Approve Expense
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleReject(selectedApproval._id);
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
