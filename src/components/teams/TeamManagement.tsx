import { useState } from 'react';
import { User } from '@prisma/client';
import Image from 'next/image';

interface TeamManagementProps {
  teamMembers: User[];
  onInviteMember: (email: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export default function TeamManagement({ teamMembers, onInviteMember, onRemoveMember }: TeamManagementProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await onInviteMember(email);
      setSuccess('Team member invited successfully');
      setEmail('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to invite team member');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await onRemoveMember(userId);
      setSuccess('Team member removed successfully');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to remove team member');
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900">Current Team Members</h3>
        <div className="mt-4">
          <ul role="list" className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <li key={member.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name || ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-800">
                        {member.name?.[0] || member.email?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(member.id, member.name || member.email || 'Unknown')}
                  className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Invite New Team Member</h3>
        <form onSubmit={handleInvite} className="mt-4">
          <div className="flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`ml-4 inline-flex justify-center rounded-md border border-transparent bg-yellow-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 