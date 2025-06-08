import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teamId } = req.query;

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Get all users who are not in the team
    const availableUsers = await prisma.user.findMany({
      where: {
        NOT: [
          { id: session.user.id }, // Exclude the current user
          {
            teams: {
              some: {
                id: teamId,
              },
            },
          },
          {
            ownedTeams: {
              some: {
                id: teamId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return res.status(200).json(availableUsers);
  } catch (error) {
    console.error('Error fetching available users:', error);
    return res.status(500).json({ error: 'Failed to fetch available users' });
  }
} 