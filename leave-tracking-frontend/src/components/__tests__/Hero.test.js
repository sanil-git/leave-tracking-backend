import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '../Hero';

describe('Hero Component', () => {
  const mockOnGetStarted = jest.fn();
  const mockOnSeeDemo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<Hero />);

    expect(screen.getByText(/Smart.*Leave Planning/)).toBeInTheDocument();
    expect(screen.getByText(/Track holidays, plan vacations, and discover long weekends/)).toBeInTheDocument();
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('See Demo')).toBeInTheDocument();
    expect(screen.getByText('No credit card required • Free forever plan available')).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    const customHeadline = 'Custom Headline';
    const customSubtext = 'Custom subtext content';
    
    render(
      <Hero
        headline={customHeadline}
        subtext={customSubtext}
        onGetStarted={mockOnGetStarted}
        onSeeDemo={mockOnSeeDemo}
      />
    );

    expect(screen.getByText(new RegExp(customHeadline))).toBeInTheDocument();
    expect(screen.getByText(customSubtext)).toBeInTheDocument();
  });

  test('calls onGetStarted when Get Started Free button is clicked', () => {
    render(
      <Hero
        onGetStarted={mockOnGetStarted}
        onSeeDemo={mockOnSeeDemo}
      />
    );

    fireEvent.click(screen.getByText('Get Started Free'));
    expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
  });

  test('calls onSeeDemo when See Demo button is clicked', () => {
    render(
      <Hero
        onGetStarted={mockOnGetStarted}
        onSeeDemo={mockOnSeeDemo}
      />
    );

    fireEvent.click(screen.getByText('See Demo'));
    expect(mockOnSeeDemo).toHaveBeenCalledTimes(1);
  });

  test('has proper accessibility attributes', () => {
    render(
      <Hero
        onGetStarted={mockOnGetStarted}
        onSeeDemo={mockOnSeeDemo}
      />
    );

    const getStartedBtn = screen.getByText('Get Started Free');
    const seeDemoBtn = screen.getByText('See Demo');
    const dashboardPreview = screen.getByRole('img');

    expect(getStartedBtn).toHaveAttribute('aria-label', 'Get started with PlanWise for free');
    expect(seeDemoBtn).toHaveAttribute('aria-label', 'Watch a demo of PlanWise');
    expect(dashboardPreview).toHaveAttribute('aria-label', 'PlanWise dashboard preview showing calendar with highlighted vacation dates, leave balances, and long weekend alerts');
  });

  test('has proper CSS classes for animations', () => {
    render(<Hero />);

    const headline = screen.getByText(/Smart.*Leave Planning/);
    const subtext = screen.getByText(/Track holidays, plan vacations, and discover long weekends/);
    const dashboardPreview = screen.getByRole('img');

    expect(headline).toHaveClass('animate-fade-in');
    expect(subtext).toHaveClass('animate-fade-in-delay');
    expect(dashboardPreview).toHaveClass('animate-fade-in-delay-2');
  });

  test('has proper hover and transition classes', () => {
    render(<Hero />);

    const getStartedBtn = screen.getByText('Get Started Free');
    const seeDemoBtn = screen.getByText('See Demo');

    expect(getStartedBtn).toHaveClass('hover:scale-105', 'transition-all', 'duration-200');
    expect(seeDemoBtn).toHaveClass('transition-all', 'duration-200');
  });

  test('renders dashboard preview with calendar mock', () => {
    render(<Hero />);

    expect(screen.getByText('PlanWise Dashboard')).toBeInTheDocument();
    expect(screen.getByText('March 2024')).toBeInTheDocument();
    expect(screen.getByText('EL Balance')).toBeInTheDocument();
    expect(screen.getByText('SL Balance')).toBeInTheDocument();
    expect(screen.getByText('Long Weekend Detected')).toBeInTheDocument();
  });
});
