import { getLink } from '@/lib/db';
import { notFound } from 'next/navigation';
import Redirector from './redirector';

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const longUrl = await getLink(slug);

  if (!longUrl) {
    notFound();
  }

  return <Redirector url={longUrl} />;
}
