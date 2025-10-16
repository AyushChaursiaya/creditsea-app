import React, { useState, useEffect } from 'react';
import { uploadService } from '../services/api';

const ReportDetail = ({ reportId, onBack }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setLoading(true);
        setError('');
        const response = await uploadService.getReportById(reportId);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to load report details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 700) return 'from-green-500 to-emerald-600';
    if (score >= 600) return 'from-blue-500 to-primary-600';
    if (score >= 500) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 700) return 'Excellent';
    if (score >= 600) return 'Good';
    if (score >= 500) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading report details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Report
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={onBack} className="btn-primary">
            ← Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Report Not Found
          </h3>
          <p className="text-gray-600 mb-4">The requested report could not be found.</p>
          <button onClick={onBack} className="btn-primary">
            ← Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6">
        <button 
          onClick={onBack}
          className="btn-secondary mb-4 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Reports</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Credit Report - {report.basicDetails.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span><strong>File:</strong> {report.fileName}</span>
              <span><strong>Processed:</strong> {formatDate(report.uploadDate)}</span>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <div className={`bg-gradient-to-r ${getScoreColor(report.basicDetails.creditScore)} text-white px-4 py-3 rounded-lg text-center`}>
              <div className="text-2xl font-bold">{report.basicDetails.creditScore}</div>
              <div className="text-sm opacity-90">
                {getScoreLabel(report.basicDetails.creditScore)} Credit Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Details Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          Basic Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <div className="font-semibold text-gray-900">{report.basicDetails.name}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Phone</label>
            <div className="font-semibold text-gray-900">{report.basicDetails.mobilePhone || 'N/A'}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">PAN Number</label>
            <div className="font-mono font-semibold text-gray-900 bg-white px-2 py-1 rounded border">
              {report.basicDetails.pan}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">Credit Score</label>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(report.basicDetails.creditScore).replace('from-', 'bg-').split(' ')[0]}`}></div>
              <span className="font-semibold text-gray-900">
                {report.basicDetails.creditScore}
              </span>
              <span className="text-sm text-gray-600">
                ({getScoreLabel(report.basicDetails.creditScore)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          Report Summary
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Accounts', value: report.reportSummary.totalAccounts, icon: '📈' },
            { label: 'Active Accounts', value: report.reportSummary.activeAccounts, icon: '✅' },
            { label: 'Closed Accounts', value: report.reportSummary.closedAccounts, icon: '❌' },
            { label: 'Current Balance', value: formatCurrency(report.reportSummary.currentBalanceAmount), icon: '💰' },
            { label: 'Secured Accounts', value: report.reportSummary.securedAccountsAmount, icon: '🏠' },
            { label: 'Unsecured Accounts', value: report.reportSummary.unsecuredAccountsAmount, icon: '💳' },
            { label: 'Last 7 Days Enquiries', value: report.reportSummary.last7DaysEnquiries, icon: '🔍' },
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              {/* <div className="text-2xl mb-2">{item.icon}</div> */}
              <div className="text-lg font-bold text-gray-900 mb-1">{item.value}</div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Accounts Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          Credit Accounts Information
        </h2>
        
        {report.creditAccounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Credit Accounts Found
            </h3>
            <p className="text-gray-600">
              No credit account information was found in this report.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-600">
              Showing {report.creditAccounts.length} credit account(s)
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Bank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Account Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Amount Overdue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {report.creditAccounts.map((account, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-b">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b font-medium text-gray-900">
                      {account.bank}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {account.accountNumber}
                      </code>
                    </td>
                    <td className="px-4 py-3 border-b text-gray-600 max-w-xs truncate">
                      {account.address}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className={`font-semibold ${
                        account.amountOverdue > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(account.amountOverdue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(account.currentBalance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;