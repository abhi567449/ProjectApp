import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: Fetch projects
  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
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
      });

      return res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  // POST: Create a new project
  if (req.method === 'POST') {
    try {
      const { name, teamId } = req.body;

      if (!name || !teamId) {
        return res.status(400).json({ error: 'Project name and team ID are required' });
      }

      // Check if the user is a member or owner of the team
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [
            { owner: { id: session.user.id } },
            { members: { some: { id: session.user.id } } },
          ],
        },
      });

      if (!team) {
        return res.status(403).json({ error: 'You must be a team member to create a project' });
      }

      const project = await prisma.project.create({
        data: {
          name,
          startDate: new Date(),
          endDate: null,
          description: '',
          team: {
            connect: { id: teamId },
          },
          createdBy: {
            connect: { id: session.user.id },
          },
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
          createdBy: true,
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  // DELETE: Delete a project
  if (req.method === 'DELETE') {
    try {
      const { projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Check if the user is the project creator
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          createdBy: { id: session.user.id },
        },
      });

      if (!project) {
        return res.status(403).json({ error: 'Only project creators can delete projects' });
      }

      // Delete all tasks associated with the project
      await prisma.task.deleteMany({
        where: {
          projectId,
        },
      });

      // Delete the project
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });

      return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 