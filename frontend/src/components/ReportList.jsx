import React, { useState, useEffect } from 'react';
import { uploadService } from '../services/api';

const ReportList = ({ onReportSelect, refreshTrigger }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await uploadService.getAllReports();
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score) => {
    if (score >= 700) return 'bg-success-500';
    if (score >= 600) return 'bg-primary-500';
    if (score >= 500) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 700) return 'Excellent';
    if (score >= 600) return 'Good';
    if (score >= 500) return 'Fair';
    return 'Poor';
  };

  const handleDeleteReport = async (reportId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await uploadService.deleteReport(reportId);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading credit reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Reports
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchReports} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Credit Reports</h2>
            <p className="text-gray-600 mt-1">
              {reports.length} report{reports.length !== 1 ? 's' : ''} processed
            </p>
          </div>
          <button 
            onClick={fetchReports}
            className="btn-secondary mt-3 sm:mt-0 flex items-center space-x-2"
          >
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Reports Yet
          </h3>
          <p className="text-gray-600">
            Upload an Experian XML file to generate your first credit report.
          </p>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div 
                key={report._id} 
                className="card p-5 hover:shadow-md transition-shadow duration-300 cursor-pointer border-2 border-transparent hover:border-primary-200"
                onClick={() => onReportSelect(report._id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {report.basicDetails.name}
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-danger-500 transition-colors p-1 rounded"
                    onClick={(e) => handleDeleteReport(report._id, e)}
                    title="Delete report"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">PAN:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {report.basicDetails.pan}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credit Score:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getScoreColor(report.basicDetails.creditScore)}`}></div>
                      <span className="font-semibold">
                        {report.basicDetails.creditScore}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getScoreLabel(report.basicDetails.creditScore)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="text-gray-900">
                      {formatDate(report.uploadDate)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">
                      {report.reportSummary.totalAccounts}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {report.reportSummary.activeAccounts}
                    </div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(report.reportSummary.currentBalanceAmount)}
                    </div>
                    <div className="text-xs text-gray-600">Balance</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-primary-600 font-medium">
                  <span>Click to view details</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;