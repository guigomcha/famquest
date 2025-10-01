import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import AntCustomLayout from './components/Layout';
import EventFeed from './pages/EventFeed';
import EventMap from './pages/EventMap';
import EventUpload from './pages/EventUpload';
import Profile from './pages/Profile';
import EventEdit from './pages/EventEdit';
import FamilyTree from './pages/FamilyTree';
import Trips from './pages/Trips';
import Login from './pages/Login';
import './App.css';

// Ant Design theme customization
// TODO: align with CSS files and put somewhere importable by everyone
const theme = {
  token: {
    colorPrimary: '#8b5cf6',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: 8,
    controlHeight: 40,
  },
};

// Protected Route Component
// TODO G: disable with a flag for dev purposes
const ProtectedRoute = ({ children }) => {
  // const { isAuthenticated } = useAuth();
  // return isAuthenticated ? children : <Navigate to="/login" />;
  return children;
};

// Main App Content
const AppContent = () => {
  // const { isAuthenticated, isLoading } = useAuth();
  const isLoading = false;
  // TODO G: learn how to get the workspace to select the right backend endpoint
  const { workspace } = useWorkspace();
  const { t } = useTranslation();

  if (isLoading) {
    // TODO: Do the loading keeping the logo in the background
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Route - Independent of Layout */}
          {/* <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
          /> */}
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <EventFeed />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <EventMap />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <EventUpload />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <Profile />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/edit/:eventId" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <EventEdit />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/family" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <FamilyTree />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          <Route path="/trips" element={
            <ProtectedRoute>
              <AntCustomLayout>
                <Trips />
              </AntCustomLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
           {/* TODO: show a message of where you could not be routed to */}
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    // <I18nextProvider i18n={i18n}>
      //{/* <AuthProvider> */}
        <WorkspaceProvider>
          <ConfigProvider theme={theme}>
            <AppContent />
          </ConfigProvider>
        </WorkspaceProvider>
      // {/* </AuthProvider> */}
    // </I18nextProvider>
  );
}

export default App;