import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <Frown className="w-24 h-24 text-muted-foreground mb-4" />
      <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4">
        404 - Not Found
      </h1>
      <p className="max-w-md text-lg md:text-xl text-muted-foreground mb-8">
        Oops! The link you're looking for seems to have vanished into thin air.
      </p>
      <Button asChild size="lg" className="font-headline">
        <Link href="/">
          Go back to Homepage
        </Link>
      </Button>
    </div>
  );
}
