import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Project, Task, Team, User, TaskStatus } from '@prisma/client';
import { prisma } from '@/server/db';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

type ProjectWithDetails = Project & {
  tasks: Task[];
  team: (Team & {
    members: User[];
  }) | null;
  createdBy: User;
};

interface ProjectsPageProps {
  projects: ProjectWithDetails[];
  teams: (Team & { members: User[] })[];
}

export default function ProjectsPage({ projects, teams }: ProjectsPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName,
          teamId: selectedTeamId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      setSuccess('Project created successfully');
      setNewProjectName('');
      setSelectedTeamId('');
      setIsCreating(false);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create project');
      }
    }
  };

  const getStatusColor = (completedTasks: number, totalTasks: number) => {
    if (totalTasks === 0) return 'bg-gray-100 text-gray-800';
    const progress = (completedTasks / totalTasks) * 100;
    if (progress === 100) return 'bg-green-100 text-green-800';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {isCreating ? 'Cancel' : 'Create Project'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          {isCreating && (
            <div className="mt-4 bg-white shadow sm:rounded-lg p-4">
              <form onSubmit={handleCreateProject}>
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="projectName"
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">
                    Team
                  </label>
                  <div className="mt-1">
                    <select
                      id="teamId"
                      name="teamId"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const completedTasks = project.tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
              const totalTasks = project.tasks.length;
              const statusColor = getStatusColor(completedTasks, totalTasks);

              return (
                <div
                  key={project.id}
                  className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link
                            href={`/projects/${project.id}`}
                            className="hover:text-yellow-600"
                          >
                            {project.name}
                          </Link>
                        </h3>
                        {project.team && (
                          <p className="mt-1 text-sm text-gray-500">
                            Team: {project.team.name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {completedTasks}/{totalTasks} tasks
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Recent Tasks</h4>
                        <ul className="mt-2 space-y-2">
                          {project.tasks.slice(0, 3).map((task) => (
                            <li key={task.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-900">{task.title}</span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === TaskStatus.COMPLETED
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {task.status === TaskStatus.COMPLETED ? 'Completed' : 'In Progress'}
                              </span>
                            </li>
                          ))}
                          {project.tasks.length === 0 && (
                            <li className="text-sm text-gray-500">No tasks yet</li>
                          )}
                        </ul>
                      </div>
                      {project.team && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
                          <div className="mt-2 flex -space-x-1 overflow-hidden">
                            {project.team.members.slice(0, 5).map((member) => (
                              <div
                                key={member.id}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                              >
                                {member.image ? (
                                  <img
                                    src={member.image}
                                    alt={member.name || ''}
                                    className="h-6 w-6 rounded-full"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-yellow-800">
                                      {member.name?.[0] || member.email?.[0] || '?'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {project.team.members.length > 5 && (
                              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                                +{project.team.members.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

  const [projects, teams] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { createdBy: { id: session.user.id } },
          { team: { members: { some: { id: session.user.id } } } },
        ],
      },
      include: {
        tasks: true,
        team: {
          include: {
            members: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { owner: { id: session.user.id } },
          { members: { some: { id: session.user.id } } },
        ],
      },
      include: {
        members: true,
      },
    }),
  ]);

  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
      teams: JSON.parse(JSON.stringify(teams)),
    },
  };
}; 