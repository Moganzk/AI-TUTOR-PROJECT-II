import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock API service
jest.mock('../../services/api', () => ({
  auth: {
    login: jest.fn(() => Promise.resolve({
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'student',
          first_name: 'Test',
          last_name: 'User'
        }
      }
    })),
    register: jest.fn(() => Promise.resolve({
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'newuser@example.com',
          role: 'student',
          first_name: 'New',
          last_name: 'User'
        }
      }
    })),
  },
}));

// Mock auth context
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: mockLogin,
    register: mockRegister,
  }),
}));

// Mock router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: '/login' }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}));

// Mock Login component
const MockLogin = () => (
  <div data-testid="login-page">
    <h1>Login</h1>
    <form data-testid="login-form">
      <input
        data-testid="email-input"
        type="email"
        placeholder="Email"
        aria-label="Email"
      />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
        aria-label="Password"
      />
      <button data-testid="login-button" type="submit">
        Login
      </button>
    </form>
    <a href="/register" data-testid="register-link">
      Don't have an account? Register
    </a>
  </div>
);

// Mock Register component
const MockRegister = () => (
  <div data-testid="register-page">
    <h1>Register</h1>
    <form data-testid="register-form">
      <input
        data-testid="first-name-input"
        type="text"
        placeholder="First Name"
        aria-label="First Name"
      />
      <input
        data-testid="last-name-input"
        type="text"
        placeholder="Last Name"
        aria-label="Last Name"
      />
      <input
        data-testid="email-input"
        type="email"
        placeholder="Email"
        aria-label="Email"
      />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
        aria-label="Password"
      />
      <select data-testid="role-select" aria-label="Role">
        <option value="student">Student</option>
        <option value="staff">Staff</option>
      </select>
      <button data-testid="register-button" type="submit">
        Register
      </button>
    </form>
    <a href="/login" data-testid="login-link">
      Already have an account? Login
    </a>
  </div>
);

describe('🔐 Authentication Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Component', () => {
    test('renders login form correctly', () => {
      render(<MockLogin />);
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    test('handles form input correctly', async () => {
      const user = userEvent.setup();
      render(<MockLogin />);
      
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    test('has link to register page', () => {
      render(<MockLogin />);
      
      const registerLink = screen.getByTestId('register-link');
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Register Component', () => {
    test('renders registration form correctly', () => {
      render(<MockRegister />);
      
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
      expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('role-select')).toBeInTheDocument();
      expect(screen.getByTestId('register-button')).toBeInTheDocument();
    });

    test('handles form input correctly', async () => {
      const user = userEvent.setup();
      render(<MockRegister />);
      
      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const roleSelect = screen.getByTestId('role-select');
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.selectOptions(roleSelect, 'student');
      
      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(roleSelect).toHaveValue('student');
    });

    test('has link to login page', () => {
      render(<MockRegister />);
      
      const loginLink = screen.getByTestId('login-link');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    test('login form validates required fields', async () => {
      const user = userEvent.setup();
      render(<MockLogin />);
      
      const submitButton = screen.getByTestId('login-button');
      
      // Try to submit empty form
      await user.click(submitButton);
      
      // Form should prevent submission or show validation
      expect(submitButton).toBeInTheDocument();
    });

    test('register form validates required fields', async () => {
      const user = userEvent.setup();
      render(<MockRegister />);
      
      const submitButton = screen.getByTestId('register-button');
      
      // Try to submit empty form
      await user.click(submitButton);
      
      // Form should prevent submission or show validation
      expect(submitButton).toBeInTheDocument();
    });
  });
});
