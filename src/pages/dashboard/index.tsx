import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/server/db';
import Dashboard from '@/components/dashboard/Dashboard';
import Layout from '@/components/layout/Layout';

type ProjectWithTasks = NonNullable<Awaited<ReturnType<typeof prisma.project.findFirst>>> & {
  tasks: NonNullable<Awaited<ReturnType<typeof prisma.task.findMany>>>;
};

type TeamWithMembers = NonNullable<Awaited<ReturnType<typeof prisma.team.findFirst>>> & {
  members: NonNullable<Awaited<ReturnType<typeof prisma.user.findMany>>>;
};

type TaskWithAssignees = NonNullable<Awaited<ReturnType<typeof prisma.task.findFirst>>> & {
  assignees: NonNullable<Awaited<ReturnType<typeof prisma.user.findMany>>>;
};

interface DashboardPageProps {
  projects: ProjectWithTasks[];
  teams: TeamWithMembers[];
  tasks: TaskWithAssignees[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  const [projects, teams, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { createdBy: { id: session.user.id } },
          { team: { members: { some: { id: session.user.id } } } },
        ],
      },
      include: {
        tasks: true,
      },
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { owner: { id: session.user.id } },
          { members: { some: { id: session.user.id } } },
        ],
      },
      include: {
        members: true,
      },
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { createdBy: { id: session.user.id } },
          { assignees: { some: { id: session.user.id } } },
        ],
      },
      include: {
        assignees: true,
      },
    }),
  ]);

  // Convert dates to ISO strings before serialization
  const serializedProjects = projects.map(project => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    startDate: project.startDate.toISOString(),
    endDate: project.endDate?.toISOString() || null,
    tasks: project.tasks.map(task => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
    })),
  }));

  const serializedTeams = teams.map(team => ({
    ...team,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      emailVerified: member.emailVerified?.toISOString() || null,
    })),
  }));

  const serializedTasks = tasks.map(task => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate?.toISOString() || null,
    assignees: task.assignees.map(assignee => ({
      ...assignee,
      createdAt: assignee.createdAt.toISOString(),
      updatedAt: assignee.updatedAt.toISOString(),
      emailVerified: assignee.emailVerified?.toISOString() || null,
    })),
  }));

  return {
    props: {
      projects: serializedProjects,
      teams: serializedTeams,
      tasks: serializedTasks,
      session,
    },
  };
};

export default function DashboardPage({ projects, teams, tasks }: DashboardPageProps) {
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Dashboard projects={projects} teams={teams} tasks={tasks} />
          </div>
        </div>
      </div>
    </Layout>
  );
} 