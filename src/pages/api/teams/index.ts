import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Team name is required' });
      }

      const team = await prisma.team.create({
        data: {
          name,
          owner: {
            connect: { id: session.user.id },
          },
          members: {
            connect: { id: session.user.id },
          },
        },
        include: {
          owner: true,
          members: true,
        },
      });

      return res.status(201).json(team);
    } catch (error) {
      console.error('Error creating team:', error);
      return res.status(500).json({ error: 'Failed to create team' });
    }
  }

  if (req.method === 'GET') {
    try {
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { owner: { id: session.user.id } },
            { members: { some: { id: session.user.id } } },
          ],
        },
        include: {
          owner: true,
          members: true,
        },
      });

      return res.status(200).json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 