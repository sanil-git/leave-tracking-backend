import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the AuthContext
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    fetchUserProfile: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders home page when user is not logged in', () => {
    render(<App />);
    
    expect(screen.getByText('Smart Leave Planning')).toBeInTheDocument();
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('renders sign in form when sign in is clicked', async () => {
    render(<App />);
    
    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back! Please sign in to your account.')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });

  test('renders register form when get started is clicked', async () => {
    render(<App />);
    
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create your account to start tracking your leave.')).toBeInTheDocument();
    });
  });

  test('has proper accessibility attributes', () => {
    render(<App />);
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });

  test('shows loading state when loading is true', () => {
    // Mock loading state
    jest.doMock('./contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        token: null,
        loading: true,
        login: jest.fn(),
        logout: jest.fn(),
        fetchUserProfile: jest.fn(),
      }),
    }));

    render(<App />);
    expect(screen.getByText('Loading PlanWise')).toBeInTheDocument();
  });
});
