'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RedirectButton({ url }: { url: string }) {
  const [countdown, setCountdown] = useState(5);
  const [isCancelled, setIsCancelled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isCancelled) return;

    if (countdown <= 0) {
      window.location.href = url;
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, url, isCancelled]);

  const handleGoBack = () => {
    setIsCancelled(true);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">
        {isCancelled ? 'Redirect cancelled.' : `Redirecting in ${countdown}s...`}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => (window.location.href = url)}>
          Continue Now
        </Button>
        <Button variant="outline" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
