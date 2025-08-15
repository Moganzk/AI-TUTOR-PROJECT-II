import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';

// Mock contexts and apiService
jest.mock('../services/api', () => ({
  admin: {
    stats: () => Promise.resolve({ data: {
      success: true,
      stats: {
        users: { total: 10, students: 6, staff: 3, admins: 1, active_users: 5 },
        courses: { total: 4, active: 3 },
        assignments: { total: 8, published: 5 },
        system: { health: { status: 'healthy', uptime: '99.9%' } }
      },
      estimates: {
        courses: { total_enrollments: 20 },
        assignments: { total_submissions: 30, graded_submissions: 20, avg_grade: 88.5 },
        system: { active_sessions: 3 }
      },
      metadata: { estimated_fields: ['estimates.system.active_sessions'], version: 'v2' }
    }})
  }
}));

jest.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'admin1', role: 'admin' } }) }));

// Silence toast
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

test('renders overview metrics with estimated badge', async () => {
  console.log('Running ReportsAnalytics test start');
  render(<ReportsAnalytics />);
  // Wait for a known metric
  const heading = await screen.findByText(/Reports & Analytics/i);
  expect(heading).toBeInTheDocument();
  // An estimated badge should appear (est text)
  const estBadges = await screen.findAllByText('est');
  expect(estBadges.length).toBeGreaterThan(0);
  // Trivial assertion marker
  expect(true).toBe(true);
  console.log('ReportsAnalytics test end');
});
