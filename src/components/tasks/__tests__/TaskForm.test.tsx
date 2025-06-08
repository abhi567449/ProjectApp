import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../TaskForm';
import { Priority, TaskStatus } from '@prisma/client';

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(<TaskForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: Priority.HIGH },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: TaskStatus.IN_PROGRESS },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2024-12-31' },
    });

    const submitButton = screen.getByText('Save Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2024-12-31',
        assigneeIds: [],
      });
    });
  });

  it('validates required fields', async () => {
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByText('Save Task');
    fireEvent.click(submitButton);

    // Check if the form validation prevents submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('initializes with provided data', () => {
    const initialData = {
      title: 'Initial Task',
      description: 'Initial Description',
      priority: Priority.LOW,
      status: TaskStatus.TODO,
      dueDate: '2024-12-31',
      assigneeIds: [],
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Initial Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Initial Description');
    expect(screen.getByLabelText(/priority/i)).toHaveValue(Priority.LOW);
    expect(screen.getByLabelText(/status/i)).toHaveValue(TaskStatus.TODO);
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2024-12-31');
  });
}); 