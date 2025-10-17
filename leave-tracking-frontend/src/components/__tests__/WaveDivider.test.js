import React from 'react';
import { render, screen } from '@testing-library/react';
import WaveDivider from '../WaveDivider';

describe('WaveDivider Component', () => {
  test('renders with default props', () => {
    const { container } = render(<WaveDivider />);
    
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    const gradient = container.querySelector('linearGradient');
    
    expect(svg).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    expect(gradient).toBeInTheDocument();
    expect(gradient).toHaveAttribute('id', 'waveGradient');
  });

  test('renders with custom className', () => {
    const { container } = render(<WaveDivider className="custom-class" />);
    
    const wrapper = container.querySelector('.w-full.overflow-hidden.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  test('renders with custom fill color', () => {
    const { container } = render(<WaveDivider fillColor="#ff0000" />);
    
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', '#ff0000');
  });

  test('has proper responsive classes', () => {
    const { container } = render(<WaveDivider />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-full', 'h-12', 'sm:h-16', 'md:h-20', 'lg:h-24');
  });

  test('has proper SVG attributes', () => {
    const { container } = render(<WaveDivider />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 1200 120');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  test('has proper gradient stops', () => {
    const { container } = render(<WaveDivider />);
    
    const stops = container.querySelectorAll('stop');
    expect(stops).toHaveLength(3);
    
    expect(stops[0]).toHaveAttribute('offset', '0%');
    expect(stops[0]).toHaveAttribute('stop-color', '#f3e8ff');
    
    expect(stops[1]).toHaveAttribute('offset', '50%');
    expect(stops[1]).toHaveAttribute('stop-color', '#e9d5ff');
    
    expect(stops[2]).toHaveAttribute('offset', '100%');
    expect(stops[2]).toHaveAttribute('stop-color', '#ddd6fe');
  });

  test('has proper wave path', () => {
    const { container } = render(<WaveDivider />);
    
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', 'M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z');
  });

  test('prevents horizontal overflow', () => {
    const { container } = render(<WaveDivider />);
    
    const wrapper = container.querySelector('.w-full.overflow-hidden');
    expect(wrapper).toBeInTheDocument();
  });
});
