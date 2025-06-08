import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Task, User } from '@prisma/client';
import { prisma } from '@/server/db';
import Layout from '@/components/layout/Layout';
import TaskForm from '@/components/tasks/TaskForm';
import TaskList from '@/components/tasks/TaskList';

interface TasksPageProps {
  initialTasks: (Task & { assignees: User[] })[];
  teamMembers: { id: string; name: string }[];
}

export default function TasksPage({ initialTasks, teamMembers }: TasksPageProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          projectId: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setIsCreating(false);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: updatedTask.status } : task
      ));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete task');
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {isCreating ? 'Cancel' : 'Create Task'}
            </button>
          </div>

          <div className="mt-4">
            {isCreating && (
              <div className="bg-white shadow sm:rounded-lg p-4 mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
                <TaskForm
                  onSubmit={handleCreateTask}
                  teamMembers={teamMembers}
                />
              </div>
            )}

            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  const [tasks, teamMembers] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { createdBy: { id: session.user.id } },
          { assignees: { some: { id: session.user.id } } },
        ],
      },
      include: {
        assignees: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          { name: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
      },
    }) as Promise<{ id: string; name: string }[]>,
  ]);

  const serializedTasks = tasks.map(task => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate?.toISOString() || null,
    assignees: task.assignees.map(assignee => ({
      ...assignee,
      createdAt: assignee.createdAt.toISOString(),
      updatedAt: assignee.updatedAt.toISOString(),
      emailVerified: assignee.emailVerified?.toISOString() || null,
    })),
  }));

  return {
    props: {
      initialTasks: serializedTasks,
      teamMembers,
    },
  };
}; 