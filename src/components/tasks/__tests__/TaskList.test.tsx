import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../TaskList';
import { Priority, TaskStatus, type Task, type User } from '@prisma/client';

type TaskWithAssignees = Task & {
  assignees: User[];
};

describe('TaskList', () => {
  const mockTasks: TaskWithAssignees[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: '1',
      userId: 'user1',
      assignees: [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: null,
          image: null,
          password: null,
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: '1',
      userId: 'user1',
      assignees: [],
    },
  ];

  const mockOnDelete = jest.fn();
  const mockOnStatusChange = jest.fn();

  const defaultProps = {
    tasks: mockTasks,
    onDelete: mockOnDelete,
    onStatusChange: mockOnStatusChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tasks', () => {
    render(<TaskList {...defaultProps} />);
    
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('filters tasks by status', () => {
    render(<TaskList {...defaultProps} />);
    
    const statusButtons = screen.getAllByRole('button');
    const inProgressButton = statusButtons.find(button => button.textContent === 'In Progress');
    if (inProgressButton) {
      fireEvent.click(inProgressButton);
    }

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });

  it('calls onStatusChange when status is changed', () => {
    render(<TaskList {...defaultProps} />);
    
    const statusSelects = screen.getAllByRole('combobox');
    fireEvent.change(statusSelects[0], { target: { value: TaskStatus.COMPLETED } });

    expect(mockOnStatusChange).toHaveBeenCalledWith(mockTasks[0].id, TaskStatus.COMPLETED);
  });

  it('displays task details correctly', () => {
    render(<TaskList {...defaultProps} />);
    
    const task = mockTasks[0];
    
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText(task.description!)).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of assignee name
  });
}); 