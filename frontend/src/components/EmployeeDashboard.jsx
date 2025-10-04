import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("to-submit");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: "",
    currency: "USD",
    expenseCurrency: "USD",
    paidBy: "",
    remarks: "",
    receipt: null,
    receiptImage: null,
    status: "draft",
  });
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // Available currencies for expense submission
  const availableCurrencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  ];

  // Sample expense categories
  const expenseCategories = [
    {
      id: "1",
      name: "Food & Dining",
      description: "Restaurant bills, business meals",
    },
    { id: "2", name: "Travel", description: "Flights, hotels, transportation" },
    { id: "3", name: "Office Supplies", description: "Stationery, equipment" },
    { id: "4", name: "Software", description: "Subscriptions, tools" },
    {
      id: "5",
      name: "Client Entertainment",
      description: "Client meetings, events",
    },
    { id: "6", name: "Miscellaneous", description: "Other business expenses" },
  ];

  // Sample expenses data with approval history
  const sampleExpenses = [
    {
      id: "1",
      employee: "Sarah Wilson",
      description: "Restaurant bill - client meeting",
      date: "2025-10-04",
      category: "Food & Dining",
      paidBy: "Sarah Wilson",
      remarks: "Business dinner with potential client",
      amount: 5000,
      currency: "INR",
      expenseCurrency: "INR",
      convertedAmount: 60,
      status: "waiting_approval",
      receiptUrl: "/receipts/sample1.jpg",
      submittedDate: "2025-10-04",
      approvalHistory: [
        {
          approver: "Sarah Wilson",
          action: "submitted",
          timestamp: "2025-10-04T10:30:00",
          comments: "Expense submitted for approval",
        },
      ],
      isReadOnly: true,
    },
    {
      id: "2",
      employee: "Sarah Wilson",
      description: "Flight to Mumbai",
      date: "2025-10-03",
      category: "Travel",
      paidBy: "Sarah Wilson",
      remarks: "Round trip for conference",
      amount: 12500,
      currency: "INR",
      expenseCurrency: "INR",
      convertedAmount: 150,
      status: "approved",
      receiptUrl: "/receipts/sample2.jpg",
      submittedDate: "2025-10-03",
      approvedDate: "2025-10-05",
      approvalHistory: [
        {
          approver: "Sarah Wilson",
          action: "submitted",
          timestamp: "2025-10-03T14:20:00",
          comments: "Expense submitted for approval",
        },
        {
          approver: "John Manager",
          action: "approved",
          timestamp: "2025-10-04T09:15:00",
          comments: "Approved - business travel",
        },
        {
          approver: "Finance Team",
          action: "approved",
          timestamp: "2025-10-05T11:30:00",
          comments: "Payment processed",
        },
      ],
      isReadOnly: true,
    },
    {
      id: "3",
      employee: "Sarah Wilson",
      description: "Office software subscription",
      date: "2025-10-01",
      category: "Software",
      paidBy: "Sarah Wilson",
      remarks: "Annual subscription",
      amount: 8500,
      currency: "INR",
      expenseCurrency: "INR",
      convertedAmount: 102,
      status: "approved",
      receiptUrl: "/receipts/sample3.jpg",
      submittedDate: "2025-09-28",
      approvedDate: "2025-10-02",
      approvalHistory: [
        {
          approver: "Sarah Wilson",
          action: "submitted",
          timestamp: "2025-09-28T14:20:00",
          comments: "Expense submitted for approval",
        },
        {
          approver: "John Manager",
          action: "approved",
          timestamp: "2025-10-02T09:15:00",
          comments: "Approved - within budget",
        },
      ],
      isReadOnly: true,
    },
  ];

  // Mock exchange rates
  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.25,
    JPY: 110.5,
    CAD: 1.25,
    AUD: 1.35,
  };

  useEffect(() => {
    setExpenses(sampleExpenses);
    setNewExpense((prev) => ({
      ...prev,
      paidBy: user?.name || "",
    }));
  }, [user]);

  // Update converted amount whenever amount or currency changes
  useEffect(() => {
    const updateConvertedAmount = () => {
      if (newExpense.amount && newExpense.expenseCurrency) {
        const amount = parseFloat(newExpense.amount);
        if (!isNaN(amount)) {
          const converted = convertCurrencySync(
            amount,
            newExpense.expenseCurrency,
            "USD"
          );
          setConvertedAmount(converted);
        }
      } else {
        setConvertedAmount(0);
      }
    };

    updateConvertedAmount();
  }, [newExpense.amount, newExpense.expenseCurrency]);

  const filteredExpenses = expenses.filter((expense) => {
    switch (activeTab) {
      case "to-submit":
        return expense.status === "draft";
      case "waiting-approval":
        return (
          expense.status === "submitted" ||
          expense.status === "waiting_approval"
        );
      case "approved":
        return expense.status === "approved";
      default:
        return true;
    }
  });

  const convertCurrencySync = (amount, fromCurrency, toCurrency = "USD") => {
    if (fromCurrency === toCurrency) return amount;

    const rate = exchangeRates[fromCurrency] / exchangeRates[toCurrency];
    return Math.round(amount * rate * 100) / 100;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewExpense((prev) => ({
        ...prev,
        receipt: file,
        receiptImage: URL.createObjectURL(file),
      }));

      processOCR(file);
    }
  };

  const processOCR = async (file) => {
    setOcrProcessing(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      // Use the correct backend URL
      const response = await fetch(
        "http://localhost:5000/api/process-receipt",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const ocrData = result.data;

        setNewExpense((prev) => ({
          ...prev,
          amount: ocrData.amount || "",
          date: ocrData.date || new Date().toISOString().split("T")[0],
          description: ocrData.description || "Receipt from OCR",
          expenseCurrency: ocrData.currency || "USD",
          ocrData: ocrData,
        }));

        setShowExpenseForm(true);
        setShowUploadModal(false);
      } else {
        throw new Error(result.error || "OCR processing failed");
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      alert(
        `OCR processing failed: ${error.message}. Please enter details manually.`
      );
      setShowExpenseForm(true);
      setShowUploadModal(false);
    } finally {
      setOcrProcessing(false);
    }
  };

  const takePhoto = () => {
    alert(
      "Camera access would be implemented here. For now, please upload a file."
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newExpense.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!newExpense.date) {
      newErrors.date = "Date is required";
    }

    if (!newExpense.category) {
      newErrors.category = "Category is required";
    }

    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!newExpense.paidBy.trim()) {
      newErrors.paidBy = "Paid by field is required";
    }

    if (!newExpense.receipt) {
      newErrors.receipt = "Receipt is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const convertedAmount = convertCurrencySync(
        parseFloat(newExpense.amount),
        newExpense.expenseCurrency,
        "USD"
      );

      const expenseToAdd = {
        id: Date.now().toString(),
        employee: user?.name || "Employee",
        description: newExpense.description,
        date: newExpense.date,
        category: newExpense.category,
        paidBy: newExpense.paidBy,
        remarks: newExpense.remarks || "None",
        amount: parseFloat(newExpense.amount),
        currency: "USD",
        expenseCurrency: newExpense.expenseCurrency,
        convertedAmount: convertedAmount,
        status: "waiting_approval",
        receiptUrl: newExpense.receiptImage,
        submittedDate: new Date().toISOString(),
        approvalHistory: [
          {
            approver: user?.name || "Employee",
            action: "submitted",
            timestamp: new Date().toISOString(),
            comments: "Expense submitted for approval",
          },
        ],
        isReadOnly: true,
      };

      setExpenses((prev) => [...prev, expenseToAdd]);

      alert("Expense submitted successfully! Waiting for approval.");

      setNewExpense({
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        amount: "",
        currency: "USD",
        expenseCurrency: "USD",
        paidBy: user?.name || "",
        remarks: "",
        receipt: null,
        receiptImage: null,
        status: "draft",
      });
      setConvertedAmount(0);
      setShowExpenseForm(false);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Failed to submit expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      submitted: { color: "bg-blue-100 text-blue-800", label: "Submitted" },
      waiting_approval: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Waiting Approval",
      },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderApprovalHistory = (expense) => {
    if (!expense.approvalHistory || expense.approvalHistory.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Approval History
        </h4>
        <div className="space-y-3">
          {expense.approvalHistory.map((history, index) => (
            <div key={index} className="flex items-start space-x-3 text-sm">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  history.action === "approved"
                    ? "bg-green-500"
                    : history.action === "rejected"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">
                    {history.approver}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatDateTime(history.timestamp)}
                  </span>
                </div>
                <div
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    history.action === "approved"
                      ? "bg-green-100 text-green-800"
                      : history.action === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {history.action.charAt(0).toUpperCase() +
                    history.action.slice(1)}
                </div>
                {history.comments && (
                  <p className="text-gray-600 mt-1">{history.comments}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ExpenseManager
              </h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Employee
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500">Employee</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name || "Employee"}!
            </h2>
            <p className="text-gray-600 mt-2">
              Manage your expenses and track approvals
            </p>
          </div>

          {/* Upload Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload New Expense</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">To Submit</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {expenses.filter((e) => e.status === "draft").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Waiting Approval
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      expenses.filter(
                        (e) =>
                          e.status === "submitted" ||
                          e.status === "waiting_approval"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {expenses.filter((e) => e.status === "approved").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  {
                    id: "to-submit",
                    label: "To Submit",
                    count: expenses.filter((e) => e.status === "draft").length,
                  },
                  {
                    id: "waiting-approval",
                    label: "Waiting Approval",
                    count: expenses.filter(
                      (e) =>
                        e.status === "submitted" ||
                        e.status === "waiting_approval"
                    ).length,
                  },
                  {
                    id: "approved",
                    label: "Approved",
                    count: expenses.filter((e) => e.status === "approved")
                      .length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 text-gray-700 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                        {expense.isReadOnly && renderApprovalHistory(expense)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.paidBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.remarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          <div>
                            {formatCurrency(
                              expense.amount,
                              expense.expenseCurrency
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(expense.convertedAmount, "USD")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(expense.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExpenses.length === 0 && (
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
                    No expenses
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "to-submit"
                      ? "Get started by uploading a new expense."
                      : `No expenses in ${activeTab.replace("-", " ")}.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upload Receipt Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Receipt
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="receipt-upload"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      Upload Receipt
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </label>
                </div>

                {/* Camera Capture */}
                <div
                  onClick={takePhoto}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                >
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Take Photo
                  </p>
                  <p className="text-xs text-gray-500">
                    Use your camera to capture receipt
                  </p>
                </div>
              </div>

              {ocrProcessing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-blue-700">
                      Processing receipt with OCR...
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Submission Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submit Expense
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Draft
                  </span>
                  <span>→</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Waiting approval
                  </span>
                  <span>→</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    Approved
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-6">
              {/* Receipt Preview */}
              {newExpense.receiptImage && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Attached Receipt
                  </h4>
                  <img
                    src={newExpense.receiptImage}
                    alt="Receipt preview"
                    className="max-w-xs rounded-lg border mx-auto"
                  />
                </div>
              )}

              {/* OCR Results Notice */}
              {newExpense.ocrData && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        OCR processed successfully! Details have been
                        auto-filled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={newExpense.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Restaurant bill, taxi fare, etc."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={newExpense.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.amount ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    <select
                      name="expenseCurrency"
                      value={newExpense.expenseCurrency}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Amount in original currency: {newExpense.amount}{" "}
                    {newExpense.expenseCurrency}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid By *
                  </label>
                  <input
                    type="text"
                    name="paidBy"
                    value={newExpense.paidBy}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.paidBy ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Your name"
                  />
                  {errors.paidBy && (
                    <p className="mt-1 text-sm text-red-600">{errors.paidBy}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={newExpense.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes or comments..."
                  />
                </div>
              </div>

              {/* Currency Conversion Info */}
              {newExpense.amount && newExpense.expenseCurrency && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Currency Conversion
                  </h4>
                  <p className="text-sm text-blue-700">
                    Original amount:{" "}
                    {formatCurrency(
                      parseFloat(newExpense.amount),
                      newExpense.expenseCurrency
                    )}
                  </p>
                  <p className="text-sm text-blue-700">
                    Converted to company currency (USD):{" "}
                    {formatCurrency(convertedAmount, "USD")}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Managers will see the amount converted to company base
                    currency (USD)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
