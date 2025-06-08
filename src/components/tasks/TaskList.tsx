import { Task, User } from '@prisma/client';
import { useState } from 'react';

interface TaskListProps {
  tasks: (Task & { assignees: User[] })[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  const [filter, setFilter] = useState('ALL');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'ALL' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('TODO')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'TODO' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'IN_PROGRESS' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('REVIEW')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'REVIEW' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
            }`}
          >
            Review
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'COMPLETED' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <li key={task.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        className={`text-xs rounded-full ${getStatusColor(task.status)} border-0 cursor-pointer`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  {task.assignees.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Assignees:</span>
                      <div className="flex -space-x-1">
                        {task.assignees.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white"
                            title={assignee.name || ''}
                          >
                            {assignee.name?.[0] || '?'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 