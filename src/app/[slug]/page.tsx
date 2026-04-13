import { getLink } from '@/lib/db';
import { notFound } from 'next/navigation';
import RedirectButton from './redirect-button';

// In Next.js 15, params is a Promise. We need to await it.
export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const longUrl = await getLink(slug);

  if (!longUrl) {
    notFound();
  }

  // Show a brief warning page before redirecting to external URL
  // This prevents silent open redirects and gives users a chance to verify
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">You are being redirected</h1>
      <p className="text-muted-foreground max-w-md">
        This short link will take you to:
      </p>
      <p className="font-mono bg-muted p-3 rounded-md break-all max-w-xl text-sm">
        {longUrl}
      </p>
      <p className="text-sm text-muted-foreground">
        If you did not expect this destination, do not proceed.
      </p>
      <RedirectButton url={longUrl} />
    </div>
  );
}
