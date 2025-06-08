import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/server/db';
import { TaskStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const taskId = req.query.taskId as string;

  // Check if the user has access to the task
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { createdBy: { id: session.user.id } },
        { assignees: { some: { id: session.user.id } } },
      ],
    },
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!Object.values(TaskStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: status as TaskStatus,
        },
        include: {
          assignees: true,
        },
      });

      return res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: { id: taskId },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 