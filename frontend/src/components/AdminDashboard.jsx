// // src/components/AdminDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import UserManagement from "./UserManagement";
// import CompanyInfo from "./CompanyInfo";
// import ApprovalRules from "./ApprovalRules";

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState("users");

//   // Sample company data
//   const [company] = useState({
//     name: user?.companyName || "Benerous Magpie",
//     currency: user?.currency || "USD",
//     country: user?.country || "United States",
//     createdAt: new Date().toISOString(),
//   });

//   const handleLogout = () => {
//     logout();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 ExpenseManager
//               </h1>
//               <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
//                 Admin
//               </span>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">
//                   {user?.name}
//                 </p>
//                 <p className="text-sm text-gray-500">{company.name}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation Tabs */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <nav className="flex space-x-8">
//             <button
//               onClick={() => setActiveTab("users")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "users"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               User Management
//             </button>
//             <button
//               onClick={() => setActiveTab("company")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "company"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               Company Info
//             </button>
//             <button
//               onClick={() => setActiveTab("approval-rules")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "approval-rules"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               Approval Rules
//             </button>
//           </nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="px-4 py-6 sm:px-0">
//           {activeTab === "users" && <UserManagement company={company} />}
//           {activeTab === "company" && <CompanyInfo company={company} />}
//           {activeTab === "approval-rules" && <ApprovalRules />}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showApprovalSettings, setShowApprovalSettings] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee',
    managerId: ''
  });

  const [approvalSettings, setApprovalSettings] = useState({
    userId: '',
    isManagerApprover: false,
    isSequentialApproval: false,
    minimumApprovalPercentage: 50,
    managerId: '',
    approvalFlow: []
  });

  const [newApprover, setNewApprover] = useState({
    approverId: '',
    isRequired: false
  });

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/register', newUser);
      alert(`User created successfully! Password: ${response.data.password}`);
      setShowUserForm(false);
      setNewUser({ name: '', email: '', role: 'employee', managerId: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + error.response?.data?.error || error.message);
    }
  };

  // Update approval settings
  const handleUpdateApprovalSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/admin/new', approvalSettings);
      alert('Approval settings updated successfully!');
      setShowApprovalSettings(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating approval settings:', error);
      alert('Failed to update approval settings: ' + error.response?.data?.error || error.message);
    }
  };

  // Add approver to flow
  const addApproverToFlow = () => {
    if (!newApprover.approverId) {
      alert('Please select an approver');
      return;
    }

    const approverExists = approvalSettings.approvalFlow.some(
      flow => flow.approverId === newApprover.approverId
    );

    if (approverExists) {
      alert('This approver is already in the flow');
      return;
    }

    setApprovalSettings(prev => ({
      ...prev,
      approvalFlow: [
        ...prev.approvalFlow,
        {
          approverId: newApprover.approverId,
          isRequired: newApprover.isRequired,
          status: 'PENDING'
        }
      ]
    }));

    setNewApprover({ approverId: '', isRequired: false });
  };

  // Remove approver from flow
  const removeApproverFromFlow = (index) => {
    setApprovalSettings(prev => ({
      ...prev,
      approvalFlow: prev.approvalFlow.filter((_, i) => i !== index)
    }));
  };

  // Open approval settings for a user
  const openApprovalSettings = (user) => {
    setSelectedUser(user);
    setApprovalSettings({
      userId: user._id,
      isManagerApprover: user.isManagerApprover || false,
      isSequentialApproval: user.isSequentialApproval || false,
      minimumApprovalPercentage: user.minimumApprovalPercentage || 50,
      managerId: user.managerId?._id || '',
      approvalFlow: user.approvalFlow || []
    });
    setShowApprovalSettings(true);
  };

  // Get manager name by ID
  const getManagerName = (managerId) => {
    const manager = users.find(user => user._id === managerId);
    return manager ? manager.name : 'Not assigned';
  };

  // Get approver name by ID
  const getApproverName = (approverId) => {
    const approver = users.find(user => user._id === approverId);
    return approver ? approver.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button
              onClick={() => setShowUserForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New User
            </button>
          </div>
          <p className="text-gray-600 mt-2">Manage users, managers, and approval workflows</p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.managerId ? user.managerId.name : 'No manager'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openApprovalSettings(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Approval Settings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add User Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager
                    </label>
                    <select
                      value={newUser.managerId}
                      onChange={(e) => setNewUser({ ...newUser, managerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Manager</option>
                      {users
                        .filter(user => user.role === 'manager')
                        .map(manager => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Approval Settings Modal */}
        {showApprovalSettings && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Approval Settings for {selectedUser.name}
              </h2>
              <form onSubmit={handleUpdateApprovalSettings}>
                <div className="space-y-6">
                  {/* Manager Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Manager Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign Manager
                        </label>
                        <select
                          value={approvalSettings.managerId}
                          onChange={(e) => setApprovalSettings({
                            ...approvalSettings,
                            managerId: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Manager</option>
                          {users
                            .filter(user => user.role === 'manager' && user._id !== selectedUser._id)
                            .map(manager => (
                              <option key={manager._id} value={manager._id}>
                                {manager.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isManagerApprover"
                          checked={approvalSettings.isManagerApprover}
                          onChange={(e) => setApprovalSettings({
                            ...approvalSettings,
                            isManagerApprover: e.target.checked
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isManagerApprover" className="ml-2 text-sm text-gray-700">
                          Manager is an approver
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Approval Flow Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Approval Flow Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isSequentialApproval"
                          checked={approvalSettings.isSequentialApproval}
                          onChange={(e) => setApprovalSettings({
                            ...approvalSettings,
                            isSequentialApproval: e.target.checked
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isSequentialApproval" className="ml-2 text-sm text-gray-700">
                          Sequential approval required
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Approval Percentage
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={approvalSettings.minimumApprovalPercentage}
                          onChange={(e) => setApprovalSettings({
                            ...approvalSettings,
                            minimumApprovalPercentage: parseInt(e.target.value) || 0
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Approval Flow */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Approval Flow</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <select
                          value={newApprover.approverId}
                          onChange={(e) => setNewApprover({
                            ...newApprover,
                            approverId: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Approver</option>
                          {users
                            .filter(user => user._id !== selectedUser._id)
                            .map(user => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.role})
                              </option>
                            ))}
                        </select>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isRequired"
                            checked={newApprover.isRequired}
                            onChange={(e) => setNewApprover({
                              ...newApprover,
                              isRequired: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700 whitespace-nowrap">
                            Required
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={addApproverToFlow}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>

                      {/* Current Approval Flow */}
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-2">Current Approval Flow:</h4>
                        {approvalSettings.approvalFlow.length === 0 ? (
                          <p className="text-gray-500 text-sm">No approvers added</p>
                        ) : (
                          <div className="space-y-2">
                            {approvalSettings.approvalFlow.map((flow, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div>
                                  <span className="font-medium">
                                    {getApproverName(flow.approverId)}
                                  </span>
                                  {flow.isRequired && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeApproverFromFlow(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowApprovalSettings(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;