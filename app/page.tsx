import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/emails');
  }

  return <LoginForm />;
}
