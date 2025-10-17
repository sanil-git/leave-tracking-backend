import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from '../Features';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  Plane: () => <div data-testid="plane-icon">Plane Icon</div>,
  Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb Icon</div>,
}));

describe('Features Component', () => {
  test('renders with default features', () => {
    render(<Features />);

    expect(screen.getByText('Track Leave')).toBeInTheDocument();
    expect(screen.getByText('Plan Vacations')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
    
    expect(screen.getByText(/Monitor your EL, SL, and CL balances/)).toBeInTheDocument();
    expect(screen.getByText(/Plan multi-day vacations with smart date validation/)).toBeInTheDocument();
    expect(screen.getByText(/Get smart recommendations for optimal vacation timing/)).toBeInTheDocument();
  });

  test('renders with custom features', () => {
    const customFeatures = [
      {
        icon: 'CustomIcon1',
        title: 'Custom Feature 1',
        description: 'Custom description 1',
        iconColor: 'text-red-600'
      },
      {
        icon: 'CustomIcon2',
        title: 'Custom Feature 2',
        description: 'Custom description 2',
        iconColor: 'text-blue-600'
      }
    ];

    render(<Features features={customFeatures} />);

    expect(screen.getByText('Custom Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Custom description 1')).toBeInTheDocument();
    expect(screen.getByText('Custom description 2')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<Features />);

    const featureCards = screen.getAllByText(/Track Leave|Plan Vacations|AI Insights/);
    featureCards.forEach((card, index) => {
      const iconContainer = card.parentElement.querySelector('[aria-label]');
      expect(iconContainer).toHaveAttribute('aria-label');
    });
  });

  test('has proper CSS classes for hover effects', () => {
    render(<Features />);

    const featureCards = screen.getAllByText(/Track Leave|Plan Vacations|AI Insights/);
    featureCards.forEach((card) => {
      const cardElement = card.closest('div');
      expect(cardElement).toHaveClass('hover:scale-105', 'transition-all', 'duration-300', 'group', 'cursor-pointer');
    });
  });

  test('has proper icon styling classes', () => {
    render(<Features />);

    const iconContainers = screen.getAllByLabelText(/feature icon/);
    iconContainers.forEach((container) => {
      expect(container).toHaveClass('group-hover:bg-purple-100', 'transition-colors', 'duration-300');
    });
  });

  test('renders correct number of features', () => {
    render(<Features />);

    const featureCards = screen.getAllByText(/Track Leave|Plan Vacations|AI Insights/);
    expect(featureCards).toHaveLength(3);
  });

  test('has proper grid layout classes', () => {
    const { container } = render(<Features />);
    const gridContainer = container.querySelector('.grid');
    
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
  });
});
