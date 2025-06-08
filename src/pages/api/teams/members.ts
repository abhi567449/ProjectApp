import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get team members
  if (req.method === 'GET') {
    try {
      const teamMembers = await prisma.user.findMany({
        where: {
          OR: [
            { teams: { some: { owner: { id: session.user.id } } } },
            { teams: { some: { members: { some: { id: session.user.id } } } } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return res.json(teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      return res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }

  // POST: Add a new member
  if (req.method === 'POST') {
    try {
      const { teamId, userId } = req.body;

      if (!teamId || !userId) {
        return res.status(400).json({ error: 'Team ID and user ID are required' });
      }

      // Check if the current user is the team owner
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          owner: { id: session.user.id },
        },
      });

      if (!team) {
        return res.status(403).json({ error: 'Only team owners can add members' });
      }

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is already in the team
      const isAlreadyMember = await prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [
            { owner: { id: userId } },
            { members: { some: { id: userId } } },
          ],
        },
      });

      if (isAlreadyMember) {
        return res.status(400).json({ error: 'User is already a team member' });
      }

      // Add the user to the team
      await prisma.team.update({
        where: { id: teamId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });

      return res.status(200).json({ message: 'Member added successfully' });
    } catch (error) {
      console.error('Error adding member:', error);
      return res.status(500).json({ error: 'Failed to add member' });
    }
  }

  // DELETE: Remove a member from the team
  if (req.method === 'DELETE') {
    try {
      const { teamId, memberId } = req.body;

      if (!teamId || !memberId) {
        return res.status(400).json({ error: 'Team ID and member ID are required' });
      }

      // Check if the current user is the team owner
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          owner: { id: session.user.id },
        },
      });

      if (!team) {
        return res.status(403).json({ error: 'Only team owners can remove members' });
      }

      // Remove the member from the team
      await prisma.team.update({
        where: { id: teamId },
        data: {
          members: {
            disconnect: { id: memberId },
          },
        },
      });

      return res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      console.error('Error removing member:', error);
      return res.status(500).json({ error: 'Failed to remove member' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 