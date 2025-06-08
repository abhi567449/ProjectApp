import { Project, Task, User, Team } from '@prisma/client';
import { useState } from 'react';

interface DashboardProps {
  projects: (Project & { tasks: Task[] })[];
  teams: (Team & { members: User[] })[];
  tasks: (Task & { assignees: User[] })[];
}

export default function Dashboard({ projects, teams, tasks }: DashboardProps) {
  const [selectedProject, setSelectedProject] = useState<string | 'all'>('all');

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.projectId === selectedProject);

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED');
    return projectTasks.length > 0
      ? Math.round((completedTasks.length / projectTasks.length) * 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{project.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{getProjectProgress(project.id)}%</p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a
                    href={`/projects/${project.id}`}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View details
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>

      {/* Task Overview */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Tasks</h3>
          <div className="mt-2">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedProject('all')}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  selectedProject === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Projects
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    selectedProject === project.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <li key={task.id} className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      <a href={`/tasks/${task.id}`} className="hover:underline focus:outline-none">
                        {task.title}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex -space-x-1">
                        {task.assignees.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs"
                            title={assignee.name || assignee.email || ''}
                          >
                            {assignee.name?.[0] || assignee.email?.[0] || '?'}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Teams</h3>
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {teams.map((team) => (
                <li key={team.id} className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      <a href={`/teams/${team.id}`} className="hover:underline focus:outline-none">
                        {team.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{team.description}</p>
                    <div className="mt-2">
                      <div className="flex -space-x-1">
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs"
                            title={member.name || member.email || ''}
                          >
                            {member.name?.[0] || member.email?.[0] || '?'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 