import React, { useState, useEffect } from "react";

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    managerId: "",
    requiresManagerFirst: true,
    approvers: [],
    approvalSequence: true,
    approvalPercentage: 60,
    minAmount: "",
    maxAmount: "",
    categories: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sample data
  const [users] = useState([
    {
      id: "1",
      name: "Sarah Wilson",
      role: "MANAGER",
      email: "sarah@company.com",
    },
    { id: "2", name: "John Doe", role: "MANAGER", email: "john@company.com" },
    { id: "3", name: "Mike Chen", role: "MANAGER", email: "mike@company.com" },
    {
      id: "4",
      name: "Finance Team",
      role: "FINANCE",
      email: "finance@company.com",
    },
    {
      id: "5",
      name: "Director",
      role: "DIRECTOR",
      email: "director@company.com",
    },
  ]);

  const [expenseCategories] = useState([
    { id: "1", name: "Travel", description: "Business travel expenses" },
    {
      id: "2",
      name: "Meals",
      description: "Client meetings and business meals",
    },
    {
      id: "3",
      name: "Equipment",
      description: "Office equipment and supplies",
    },
    {
      id: "4",
      name: "Software",
      description: "Software subscriptions and tools",
    },
    { id: "5", name: "Miscellaneous", description: "Other business expenses" },
  ]);

  // Sample initial rules
  const initialRules = [
    {
      id: "1",
      name: "Miscellaneous Expenses",
      description: "Approval rule for miscellaneous expenses",
      managerId: "1",
      managerName: "Sarah Wilson",
      requiresManagerFirst: true,
      approvers: [
        { id: "1", name: "Sarah Wilson", type: "MANAGER", required: true },
        { id: "4", name: "Finance Team", type: "FINANCE", required: true },
        { id: "5", name: "Director", type: "DIRECTOR", required: false },
      ],
      approvalSequence: true,
      approvalPercentage: 60,
      minAmount: 100,
      maxAmount: 1000,
      categories: ["5"],
      status: "active",
    },
  ];

  useEffect(() => {
    setRules(initialRules);
  }, []);

  const managers = users.filter((user) => user.role === "MANAGER");
  const potentialApprovers = users.filter((user) => user.role !== "EMPLOYEE");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRule((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleApproverChange = (index, field, value) => {
    const updatedApprovers = [...newRule.approvers];
    updatedApprovers[index] = {
      ...updatedApprovers[index],
      [field]: value,
    };
    setNewRule((prev) => ({
      ...prev,
      approvers: updatedApprovers,
    }));
  };

  const addApprover = () => {
    setNewRule((prev) => ({
      ...prev,
      approvers: [
        ...prev.approvers,
        { id: "", name: "", type: "MANAGER", required: true },
      ],
    }));
  };

  const removeApprover = (index) => {
    const updatedApprovers = newRule.approvers.filter((_, i) => i !== index);
    setNewRule((prev) => ({
      ...prev,
      approvers: updatedApprovers,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const updatedCategories = newRule.categories.includes(categoryId)
      ? newRule.categories.filter((id) => id !== categoryId)
      : [...newRule.categories, categoryId];

    setNewRule((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newRule.name.trim()) {
      newErrors.name = "Rule name is required";
    }

    if (!newRule.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (newRule.requiresManagerFirst && !newRule.managerId) {
      newErrors.managerId =
        'Manager is required when "Manager First" is enabled';
    }

    if (newRule.approvers.length === 0) {
      newErrors.approvers = "At least one approver is required";
    }

    if (newRule.approvalPercentage < 1 || newRule.approvalPercentage > 100) {
      newErrors.approvalPercentage =
        "Approval percentage must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRule = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedManager = managers.find((m) => m.id === newRule.managerId);

      const ruleToAdd = {
        id: Date.now().toString(),
        ...newRule,
        managerName: selectedManager?.name || "",
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setRules((prev) => [...prev, ruleToAdd]);

      alert("Approval rule created successfully!");

      setNewRule({
        name: "",
        description: "",
        managerId: "",
        requiresManagerFirst: true,
        approvers: [],
        approvalSequence: true,
        approvalPercentage: 60,
        minAmount: "",
        maxAmount: "",
        categories: [],
      });
      setShowAddRule(false);
    } catch (error) {
      console.error("Error adding rule:", error);
      alert("Failed to create approval rule. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRuleStatus = (ruleId) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              status: rule.status === "active" ? "inactive" : "active",
            }
          : rule
      )
    );
  };

  const deleteRule = (ruleId) => {
    if (window.confirm("Are you sure you want to delete this approval rule?")) {
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Approval Rules Management
          </h1>
          <p className="text-gray-600">
            Configure how expense approvals flow through your organization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Approval Rules
                  </h2>
                  <button
                    onClick={() => setShowAddRule(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add New Rule
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {rule.name}
                          </h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rule.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.status}
                          </span>
                        </div>

                        <p className="text-gray-600 mt-1">{rule.description}</p>

                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Manager:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {rule.managerName}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Approvers:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {rule.approvers.length}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Sequence:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {rule.approvalSequence
                                ? "Sequential"
                                : "Parallel"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Threshold:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {rule.approvalPercentage}%
                            </span>
                          </div>
                        </div>

                        {rule.minAmount && rule.maxAmount && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">
                              Amount Range:
                            </span>
                            <span className="ml-2 text-gray-900">
                              ${rule.minAmount} - ${rule.maxAmount}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            rule.status === "active"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {rule.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Approvers List */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Approval Flow:
                      </h4>
                      <div className="flex items-center space-x-2">
                        {rule.approvers.map((approver, index) => (
                          <React.Fragment key={index}>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                approver.required
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {approver.name} {approver.required && "*"}
                            </div>
                            {index < rule.approvers.length - 1 && (
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rules.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No approval rules
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new approval rule.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                About Approval Rules
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Manager First Approval
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    When enabled, expense requests always go to the employee's
                    manager first before proceeding to other approvers.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Approver Sequence
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Sequential:</strong> Request moves to next approver
                    only after current approval
                    <br />
                    <strong>Parallel:</strong> Request sent to all approvers
                    simultaneously
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Approval Percentage
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum percentage of approvers required to approve for the
                    expense to be automatically approved.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Required Approvers
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Required approvers must approve the request. If any required
                    approver rejects, the expense is automatically rejected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Rule Modal */}
        {showAddRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Approval Rule
                </h3>
              </div>

              <form onSubmit={handleAddRule} className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newRule.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Miscellaneous Expenses Rule"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={newRule.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.description
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Description about rules: Approval rule for miscellaneous expenses"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manager Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Manager Settings
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="requiresManagerFirst"
                        checked={newRule.requiresManagerFirst}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Require manager approval first
                      </label>
                    </div>

                    {newRule.requiresManagerFirst && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Manager *
                        </label>
                        <select
                          name="managerId"
                          value={newRule.managerId}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.managerId
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a manager</option>
                          {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.name}
                            </option>
                          ))}
                        </select>
                        {errors.managerId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.managerId}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Initially the manager set in user record will be used,
                          but can be changed for approval if required.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approvers */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Approvers
                    </h4>
                    <button
                      type="button"
                      onClick={addApprover}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Add Approver
                    </button>
                  </div>

                  {newRule.approvers.map((approver, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <select
                          value={approver.id}
                          onChange={(e) =>
                            handleApproverChange(index, "id", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select approver</option>
                          {potentialApprovers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={approver.required}
                          onChange={(e) =>
                            handleApproverChange(
                              index,
                              "required",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Required
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeApprover(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {errors.approvers && (
                    <p className="text-sm text-red-600">{errors.approvers}</p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    It has a dashed line by default the expense request would go
                    to his/her manager first, before going to other approvers.
                  </p>
                </div>

                {/* Approval Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Approval Settings
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="approvalSequence"
                        checked={newRule.approvalSequence}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable sequential approval
                      </label>
                    </div>

                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p>
                        <strong>Sequential:</strong> If ticked, the request goes
                        through approvers in sequence. Each approver must
                        approve/reject before moving to the next. If any
                        required approver rejects, the expense is automatically
                        rejected.
                      </p>
                      <p className="mt-1">
                        <strong>Parallel:</strong> If not ticked, request is
                        sent to all approvers simultaneously.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approval Percentage *
                      </label>
                      <input
                        type="number"
                        name="approvalPercentage"
                        value={newRule.approvalPercentage}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.approvalPercentage
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.approvalPercentage && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.approvalPercentage}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum percentage of approvers required for
                        auto-approval (when using parallel approval)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Additional Settings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Amount
                      </label>
                      <input
                        type="number"
                        name="minAmount"
                        value={newRule.minAmount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Amount
                      </label>
                      <input
                        type="number"
                        name="maxAmount"
                        value={newRule.maxAmount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Categories
                    </label>
                    <div className="space-y-2">
                      {expenseCategories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newRule.categories.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddRule(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Create Rule"}
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

export default ApprovalRules;
