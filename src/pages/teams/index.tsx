import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Team, User } from '@prisma/client';
import { prisma } from '@/server/db';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';

type TeamWithMembers = Team & {
  owner: User;
  members: User[];
};

interface TeamsPageProps {
  teams: TeamWithMembers[];
}

export default function TeamsPage({ teams }: TeamsPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (isAddingMember && selectedTeam) {
      // Fetch available users who are not in the team
      fetch(`/api/users/available?teamId=${selectedTeam}`)
        .then(response => response.json())
        .then(data => {
          setAvailableUsers(data);
          if (data.length > 0) {
            setSelectedUserId(data[0].id);
          }
        })
        .catch(error => {
          console.error('Error fetching available users:', error);
          setError('Failed to fetch available users');
        });
    }
  }, [isAddingMember, selectedTeam]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create team');
      }

      setSuccess('Team created successfully');
      setNewTeamName('');
      setIsCreating(false);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create team');
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedUserId) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: selectedTeam,
          userId: selectedUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add member');
      }

      setSuccess('Team member added successfully');
      setIsAddingMember(false);
      setSelectedTeam(null);
      setSelectedUserId('');
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to add team member');
      }
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      const response = await fetch('/api/teams/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          memberId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      setSuccess('Team member removed successfully');
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to remove team member');
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {isCreating ? 'Cancel' : 'Create Team'}
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
              <form onSubmit={handleCreateTeam}>
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                    Team Name
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="teamName"
                      id="teamName"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="flex-1 min-w-0 block w-full rounded-md border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Enter team name"
                      required
                    />
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

          {isAddingMember && (
            <div className="mt-4 bg-white shadow sm:rounded-lg p-4">
              <form onSubmit={handleAddMember}>
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    Add Team Member
                  </label>
                  <div className="mt-1">
                    {availableUsers.length > 0 ? (
                      <select
                        id="userId"
                        name="userId"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      >
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500">No available users to add</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMember(false);
                      setSelectedTeam(null);
                      setSelectedUserId('');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Cancel
                  </button>
                  {availableUsers.length > 0 && (
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Add Member
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Owner: {team.owner.name || team.owner.email}
                  </p>
                  {team.owner.id === team.owner.id && (
                    <button
                      onClick={() => {
                        setSelectedTeam(team.id);
                        setIsAddingMember(true);
                      }}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Add Member
                    </button>
                  )}
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
                  <ul role="list" className="mt-4 space-y-4">
                    {team.members.map((member) => (
                      <li key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name || ''}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-yellow-800">
                                {member.name?.[0] || member.email?.[0] || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.name || member.email}
                            </p>
                            {member.email && (
                              <p className="text-sm text-gray-500">{member.email}</p>
                            )}
                          </div>
                        </div>
                        {team.owner.id === team.owner.id && member.id !== team.owner.id && (
                          <button
                            onClick={() => handleRemoveMember(team.id, member.id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { owner: { id: session.user.id } },
        { members: { some: { id: session.user.id } } },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return {
    props: {
      teams: JSON.parse(JSON.stringify(teams)),
    },
  };
}; 