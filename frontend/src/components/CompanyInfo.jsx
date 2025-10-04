// src/components/CompanyInfo.jsx
import React from "react";

const CompanyInfo = ({ company }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Company Information
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {company.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Currency
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {company.currency}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {company.country}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(company.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            About Your Company
          </h3>
          <p className="text-sm text-blue-700">
            This company was automatically created when you signed up as an
            admin. You can manage users, set up approval workflows, and
            configure expense management settings from this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
