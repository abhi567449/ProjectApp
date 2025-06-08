import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/server/db';
import { Priority, TaskStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    try {
      const { title, description, dueDate, priority, status, assigneeIds, projectId } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // If no projectId is provided, create a default project for the user
      let targetProjectId = projectId;
      if (!projectId) {
        const defaultProject = await prisma.project.findFirst({
          where: {
            name: 'Personal Tasks',
            createdBy: { id: session.user.id },
          },
        });

        if (defaultProject) {
          targetProjectId = defaultProject.id;
        } else {
          const newProject = await prisma.project.create({
            data: {
              name: 'Personal Tasks',
              description: 'Default project for personal tasks',
              startDate: new Date(),
              endDate: null,
              status: 'ACTIVE',
              createdBy: {
                connect: { id: session.user.id },
              },
            },
          });
          targetProjectId = newProject.id;
        }
      }

      // Validate priority and status enums
      if (!Object.values(Priority).includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority value' });
      }

      if (!Object.values(TaskStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      // Create task with project connection
      const taskData = {
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority as Priority,
        status: status as TaskStatus,
        project: {
          connect: { id: targetProjectId },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
        assignees: {
          connect: assigneeIds?.map((id: string) => ({ id })) || [],
        },
      };

      const task = await prisma.task.create({
        data: taskData,
        include: {
          assignees: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      // Return more specific error message
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 