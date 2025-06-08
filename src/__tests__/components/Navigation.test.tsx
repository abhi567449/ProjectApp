import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '@/components/layout/Navigation';
import { useSession } from 'next-auth/react';

// Mock useSession
jest.mock('next-auth/react');

describe('Navigation Component', () => {
  beforeEach(() => {
    // Mock the session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: null,
        },
      },
      status: 'authenticated',
    });
  });

  it('renders navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('ProjectHub')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('renders user menu button', () => {
    render(<Navigation />);
    
    const userMenuButton = screen.getByRole('button', { name: /open user menu/i });
    expect(userMenuButton).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(<Navigation />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    render(<Navigation />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(mobileMenuButton);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
}); 