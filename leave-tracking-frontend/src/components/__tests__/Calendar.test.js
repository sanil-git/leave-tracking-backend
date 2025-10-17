import React from 'react';
import { render, screen } from '@testing-library/react';
import Calendar from '../Calendar';

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  Calendar: ({ events, components, eventPropGetter, ...props }) => (
    <div data-testid="calendar">
      <div data-testid="calendar-events">
        {events.map((event, index) => (
          <div key={index} data-testid={`event-${index}`} title={event.title}>
            {event.title}
          </div>
        ))}
      </div>
      <div data-testid="calendar-components">
        {components.dateCellWrapper && <div data-testid="date-cell-wrapper" />}
        {components.event && <div data-testid="event-component" />}
      </div>
    </div>
  ),
  dateFnsLocalizer: () => ({}),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(),
  parse: jest.fn(),
  startOfWeek: jest.fn(),
  getDay: jest.fn(),
}));

// Mock date-fns/locale
jest.mock('date-fns/locale/en-US', () => ({}));

describe('Calendar Component', () => {
  const mockHolidays = [
    { _id: '1', name: 'Dussehra', date: '2024-10-01' },
    { _id: '2', name: 'Mahatma Gandhi Jayanti', date: '2024-10-02' }
  ];

  const mockVacations = [
    { _id: '1', name: 'Summer Vacation', startDate: '2024-10-15', endDate: '2024-10-20' }
  ];

  test('renders calendar with events', () => {
    render(
      <Calendar
        holidays={mockHolidays}
        vacations={mockVacations}
        currentDate={new Date('2024-10-01')}
      />
    );

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-events')).toBeInTheDocument();
  });

  test('renders holiday events', () => {
    render(
      <Calendar
        holidays={mockHolidays}
        vacations={[]}
        currentDate={new Date('2024-10-01')}
      />
    );

    expect(screen.getByText('Dussehra')).toBeInTheDocument();
    expect(screen.getByText('Mahatma Gandhi Jayanti')).toBeInTheDocument();
  });

  test('renders vacation events', () => {
    render(
      <Calendar
        holidays={[]}
        vacations={mockVacations}
        currentDate={new Date('2024-10-01')}
      />
    );

    expect(screen.getByText('Summer Vacation')).toBeInTheDocument();
  });

  test('includes custom components', () => {
    render(
      <Calendar
        holidays={[]}
        vacations={[]}
        currentDate={new Date('2024-10-01')}
      />
    );

    expect(screen.getByTestId('date-cell-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('event-component')).toBeInTheDocument();
  });

  test('handles empty events gracefully', () => {
    render(
      <Calendar
        holidays={[]}
        vacations={[]}
        currentDate={new Date('2024-10-01')}
      />
    );

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-events')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    render(
      <Calendar
        holidays={[]}
        vacations={[]}
        currentDate={new Date('2024-10-01')}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading calendar data...')).toBeInTheDocument();
  });
});
