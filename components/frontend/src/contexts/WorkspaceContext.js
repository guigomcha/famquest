import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Workspace Context
const WorkspaceContext = createContext();

// Workspace Provider Component
export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = () => {
    try {
      // Check for workspace in localStorage
      const savedWorkspace = localStorage.getItem('workspace');
      
      if (savedWorkspace) {
        setWorkspace(JSON.parse(savedWorkspace));
      } else {
        // Set default workspace
        const defaultWorkspace = {
          name: 'demo',
          backend: 'https://demo-api.eventfeed.com',
          displayName: 'Demo Workspace',
          features: ['events', 'map', 'family_tree', 'trips']
        };
        setWorkspace(defaultWorkspace);
        localStorage.setItem('workspace', JSON.stringify(defaultWorkspace));
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      // Set fallback workspace
      const fallbackWorkspace = {
        name: 'default',
        backend: 'http://localhost:8000',
        displayName: 'Default Workspace',
        features: ['events', 'map']
      };
      setWorkspace(fallbackWorkspace);
      localStorage.setItem('workspace', JSON.stringify(fallbackWorkspace));
    } finally {
      setIsLoading(false);
    }
  };

  const setWorkspaceContext = (workspaceData) => {
    setWorkspace(workspaceData);
    localStorage.setItem('workspace', JSON.stringify(workspaceData));
  };

  const updateWorkspaceFeature = (feature, enabled) => {
    if (!workspace) return;
    
    const updatedWorkspace = {
      ...workspace,
      features: enabled 
        ? [...new Set([...workspace.features, feature])]
        : workspace.features.filter(f => f !== feature)
    };
    
    setWorkspaceContext(updatedWorkspace);
  };

  const isFeatureEnabled = (feature) => {
    return workspace?.features?.includes(feature) || false;
  };

  const getApiEndpoint = (path = '') => {
    if (!workspace) return path;
    return `${workspace.backend}${path}`;
  };

  const getWorkspaceConfig = () => {
    return workspace;
  };

  const value = {
    workspace,
    isLoading,
    setWorkspace: setWorkspaceContext,
    updateWorkspaceFeature,
    isFeatureEnabled,
    getApiEndpoint,
    getWorkspaceConfig
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Custom hook for using workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

// Workspace configuration presets
export const workspacePresets = {
  demo: {
    name: 'demo',
    backend: 'https://demo-api.eventfeed.com',
    displayName: 'Demo Workspace',
    features: ['events', 'map', 'family_tree', 'trips', 'virtual_users'],
    description: 'Full-featured demo environment'
  },
  company1: {
    name: 'company1',
    backend: 'https://api.company1.com',
    displayName: 'Company 1',
    features: ['events', 'map', 'family_tree'],
    description: 'Corporate event management'
  },
  community: {
    name: 'community',
    backend: 'https://community-api.eventfeed.com',
    displayName: 'Community',
    features: ['events', 'map', 'trips'],
    description: 'Community event platform'
  },
  development: {
    name: 'development',
    backend: 'http://localhost:8000',
    displayName: 'Development',
    features: ['events', 'map', 'family_tree', 'trips', 'virtual_users'],
    description: 'Local development environment'
  }
};