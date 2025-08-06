import React, { createContext, useContext, useReducer } from 'react';

const SettingsContext = createContext();

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_WORKSPACE':
      return { ...state, workspace: { ...state.workspace, ...action.payload } };
    case 'UPDATE_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'UPDATE_MEMBERS':
      return { ...state, members: action.payload };
    case 'UPDATE_BILLING':
      return { ...state, billing: { ...state.billing, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  workspace: {
    name: 'My Workspace',
    description: '',
    theme: 'light'
  },
  accounts: [],
  members: [],
  billing: {
    plan: 'free',
    status: 'active'
  }
};

export const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  const updateWorkspace = (data) => {
    dispatch({ type: 'UPDATE_WORKSPACE', payload: data });
  };

  const updateAccounts = (accounts) => {
    dispatch({ type: 'UPDATE_ACCOUNTS', payload: accounts });
  };

  const updateMembers = (members) => {
    dispatch({ type: 'UPDATE_MEMBERS', payload: members });
  };

  const updateBilling = (data) => {
    dispatch({ type: 'UPDATE_BILLING', payload: data });
  };

  const value = {
    ...state,
    updateWorkspace,
    updateAccounts,
    updateMembers,
    updateBilling
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};