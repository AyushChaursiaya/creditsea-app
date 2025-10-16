import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import ReportList from './ReportList';
import ReportDetail from './ReportDetail';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { user, logout } = useAuth();

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReportSelect = (reportId) => {
    setSelectedReportId(reportId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedReportId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">CreditSea</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' ? (
          <div className="space-y-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <ReportList 
              onReportSelect={handleReportSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : (
          <ReportDetail 
            reportId={selectedReportId}
            onBack={handleBackToList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 CreditSea - Credit by Ayush Chaurasiya
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;