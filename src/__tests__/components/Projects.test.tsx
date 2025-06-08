import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectsPage from '@/pages/projects';
import { useSession } from 'next-auth/react';
import { TaskStatus, Priority, ProjectStatus, UserRole, type Project, type Team, type User } from '@prisma/client';

// Mock useSession
jest.mock('next-auth/react');

// Mock fetch function
global.fetch = jest.fn();

describe('Projects Page', () => {
  const mockUser: User = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: null,
    image: null,
    password: null,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTeam: Team & { members: User[] } = {
    id: 'team1',
    name: 'Test Team',
    description: 'Test team description',
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'user1',
    members: [mockUser],
  };

  const mockProject: Project & { tasks: any[]; team: typeof mockTeam; createdBy: User } = {
    id: 'project1',
    name: 'Test Project',
    description: 'Test project description',
    startDate: new Date(),
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    teamId: 'team1',
    userId: 'user1',
    status: ProjectStatus.ACTIVE,
    tasks: [],
    team: mockTeam,
    createdBy: mockUser,
  };

  beforeEach(() => {
    // Mock the session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: mockUser,
      },
      status: 'authenticated',
    });
  });

  it('renders project list', () => {
    render(<ProjectsPage projects={[mockProject]} teams={[mockTeam]} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test project description')).toBeInTheDocument();
  });

  it('renders create project button', () => {
    render(<ProjectsPage projects={[]} teams={[mockTeam]} />);

    const createButton = screen.getByRole('button', { name: /create project/i });
    expect(createButton).toBeInTheDocument();
  });

  it('displays team name for project', () => {
    render(<ProjectsPage projects={[mockProject]} teams={[mockTeam]} />);

    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });
}); 