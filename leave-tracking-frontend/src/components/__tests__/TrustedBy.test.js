import React from 'react';
import { render, screen } from '@testing-library/react';
import TrustedBy from '../TrustedBy';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Building2: () => <div data-testid="building-icon">Building Icon</div>,
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  Briefcase: () => <div data-testid="briefcase-icon">Briefcase Icon</div>,
  Globe: () => <div data-testid="globe-icon">Globe Icon</div>,
  Zap: () => <div data-testid="zap-icon">Zap Icon</div>,
}));

describe('TrustedBy Component', () => {
  test('renders with default props', () => {
    render(<TrustedBy />);

    expect(screen.getByText('Trusted by 1000+ teams worldwide')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
    expect(screen.getByText('StartupHub')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Inc')).toBeInTheDocument();
    expect(screen.getByText('Global Solutions')).toBeInTheDocument();
    expect(screen.getByText('Innovation Labs')).toBeInTheDocument();
  });

  test('renders with custom text', () => {
    const customText = 'Trusted by 500+ companies globally';
    render(<TrustedBy text={customText} />);

    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  test('renders with custom companies', () => {
    const customCompanies = [
      { name: 'Custom Corp', icon: 'CustomIcon1' },
      { name: 'Another Inc', icon: 'CustomIcon2' }
    ];

    render(<TrustedBy companies={customCompanies} />);

    expect(screen.getByText('Custom Corp')).toBeInTheDocument();
    expect(screen.getByText('Another Inc')).toBeInTheDocument();
  });

  test('has proper responsive classes', () => {
    const { container } = render(<TrustedBy />);
    
    const mainContainer = container.querySelector('.bg-white');
    const textContainer = container.querySelector('.text-center');
    const logosContainer = container.querySelector('.flex.flex-wrap');
    
    expect(mainContainer).toHaveClass('py-12', 'md:py-16');
    expect(textContainer).toHaveClass('text-center', 'mb-8');
    expect(logosContainer).toHaveClass('flex', 'flex-wrap', 'justify-center', 'items-center', 'gap-8', 'md:gap-12');
  });

  test('has proper hover effects', () => {
    const { container } = render(<TrustedBy />);
    
    const companyItems = container.querySelectorAll('.opacity-60');
    companyItems.forEach(item => {
      expect(item).toHaveClass('hover:opacity-80', 'transition-opacity', 'duration-300');
    });
  });

  test('hides company names on small screens', () => {
    const { container } = render(<TrustedBy />);
    
    const companyNames = container.querySelectorAll('.hidden.sm\\:block');
    expect(companyNames.length).toBeGreaterThan(0);
  });

  test('has proper accessibility attributes', () => {
    render(<TrustedBy />);

    const companyItems = screen.getAllByTitle(/TechCorp|StartupHub|Enterprise Inc|Global Solutions|Innovation Labs/);
    expect(companyItems.length).toBe(5);
  });
});
