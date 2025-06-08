import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'PATCH') {
    try {
      const { name, email, image } = req.body;

      // Validate email format
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      if (email && email !== session.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.id !== session.user.id) {
          return res.status(400).json({ error: 'Email is already taken' });
        }
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: name || null,
          email: email || null,
          image: image || null,
        },
      });

      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 