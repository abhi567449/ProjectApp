import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default function Home() {
  // This component won't be rendered as we're redirecting on the server side
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If user is authenticated, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  // If user is not authenticated, redirect to sign in
  return {
    redirect: {
      destination: '/auth/signin',
      permanent: false,
    },
  };
};
