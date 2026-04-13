import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllLinks } from '@/lib/db';
import AdminDashboardClient from './client-page';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const { links, total } = await getAllLinks(page, 20);
  
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  // Next.js 15: await searchParams
  
  return (
    <AdminDashboardClient 
      initialLinks={links} 
      totalLinks={total} 
      page={page} 
      origin={origin} 
    />
  );
}
