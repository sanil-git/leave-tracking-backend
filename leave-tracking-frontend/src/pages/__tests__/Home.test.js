import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../Home';

// Mock the components to isolate testing
jest.mock('../../components/Header', () => {
  return function MockHeader({ onSignIn, onGetStarted, onBackToHome, showBackButton }) {
    return (
      <div data-testid="header">
        <button onClick={onSignIn} data-testid="sign-in-btn">Sign In</button>
        <button onClick={onGetStarted} data-testid="get-started-btn">Get Started</button>
        {showBackButton && (
          <button onClick={onBackToHome} data-testid="back-to-home-btn">Back to Home</button>
        )}
      </div>
    );
  };
});

jest.mock('../../components/Hero', () => {
  return function MockHero({ onGetStarted, onSeeDemo }) {
    return (
      <div data-testid="hero">
        <h1>Smart Leave Planning</h1>
        <button onClick={onGetStarted} data-testid="hero-get-started-btn">Get Started Free</button>
        <button onClick={onSeeDemo} data-testid="hero-see-demo-btn">See Demo</button>
      </div>
    );
  };
});

jest.mock('../../components/WaveDivider', () => {
  return function MockWaveDivider() {
    return (
      <div data-testid="wave-divider">
        <svg>Wave SVG</svg>
      </div>
    );
  };
});

jest.mock('../../components/TrustedBy', () => {
  return function MockTrustedBy() {
    return (
      <div data-testid="trusted-by">
        <p>Trusted by 1000+ teams worldwide</p>
        <div data-testid="company-logo">Company Logo</div>
      </div>
    );
  };
});

jest.mock('../../components/Features', () => {
  return function MockFeatures() {
    return (
      <div data-testid="features">
        <h2>Features</h2>
        <div data-testid="feature-card">Track Leave</div>
        <div data-testid="feature-card">Plan Vacations</div>
        <div data-testid="feature-card">AI Insights</div>
      </div>
    );
  };
});

jest.mock('../../components/DashboardPreview', () => {
  return function MockDashboardPreview() {
    return (
      <div data-testid="dashboard-preview">
        <h3>See PlanWise in Action</h3>
        <div data-testid="calendar-preview">Calendar</div>
      </div>
    );
  };
});

jest.mock('../../components/CTA', () => {
  return function MockCTA({ onButtonClick }) {
    return (
      <div data-testid="cta">
        <button onClick={onButtonClick} data-testid="cta-button">Get Started Now</button>
      </div>
    );
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter() {
    return (
      <div data-testid="footer">
        <p>© 2024 PlanWise. All rights reserved.</p>
      </div>
    );
  };
});

describe('Home Component', () => {
  const mockOnSignIn = jest.fn();
  const mockOnGetStarted = jest.fn();
  const mockOnBackToHome = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all main sections', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={false}
      />
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('wave-divider')).toBeInTheDocument();
    expect(screen.getByTestId('trusted-by')).toBeInTheDocument();
    expect(screen.getByTestId('features')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-preview')).toBeInTheDocument();
    expect(screen.getByTestId('cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders with back button when showBackButton is true', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={true}
      />
    );

    expect(screen.getByTestId('back-to-home-btn')).toBeInTheDocument();
  });

  test('calls onSignIn when sign in button is clicked', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={false}
      />
    );

    fireEvent.click(screen.getByTestId('sign-in-btn'));
    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
  });

  test('calls onGetStarted when get started button is clicked', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={false}
      />
    );

    fireEvent.click(screen.getByTestId('get-started-btn'));
    expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
  });

  test('calls onBackToHome when back to home button is clicked', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={true}
      />
    );

    fireEvent.click(screen.getByTestId('back-to-home-btn'));
    expect(mockOnBackToHome).toHaveBeenCalledTimes(1);
  });

  test('passes onGetStarted to hero and cta components', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={false}
      />
    );

    // Test hero get started button
    fireEvent.click(screen.getByTestId('hero-get-started-btn'));
    expect(mockOnGetStarted).toHaveBeenCalledTimes(1);

    // Test CTA button
    fireEvent.click(screen.getByTestId('cta-button'));
    expect(mockOnGetStarted).toHaveBeenCalledTimes(2);
  });

  test('has proper accessibility attributes', () => {
    render(
      <Home
        onSignIn={mockOnSignIn}
        onGetStarted={mockOnGetStarted}
        onBackToHome={mockOnBackToHome}
        showBackButton={false}
      />
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  test('renders with default props when no props provided', () => {
    render(<Home />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('features')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-preview')).toBeInTheDocument();
    expect(screen.getByTestId('cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
