import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthMenu } from '../_app';

// Mock the AuthContext
const mockUseAuth = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock GoogleLogin component
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div>Google Login Mock</div>,
}));

describe('AuthMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is logged in as lbsa71@gmail.com', () => {
    it('should display edit documents link', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'lbsa71@gmail.com',
        sub: '107792906905471142685',
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        token: 'mock-token',
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(<AuthMenu />);

      // Look for the edit link
      const editLink = screen.getByRole('link', { name: /edit documents/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/edit/st_ephan');
    });
  });

  describe('when user is logged in as other email', () => {
    it('should NOT display edit documents link', () => {
      const mockUser = {
        id: '2',
        name: 'Other User',
        email: 'other@example.com',
        sub: 'other-sub',
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        token: 'mock-token',
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(<AuthMenu />);

      // Should not find the edit link
      const editLink = screen.queryByRole('link', { name: /edit documents/i });
      expect(editLink).not.toBeInTheDocument();
    });
  });

  describe('when user is not logged in', () => {
    it('should display Google login button', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(<AuthMenu />);

      expect(screen.getByText('Google Login Mock')).toBeInTheDocument();
    });
  });
});
