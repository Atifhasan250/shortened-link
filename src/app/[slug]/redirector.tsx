'use client';

import { useEffect } from 'react';

export default function Redirector({ url }: { url: string }) {
  useEffect(() => {
    if (url) {
      window.location.href = url;
    }
  }, [url]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-12 h-12 border-4 border-primary border-solid border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-muted-foreground">
        Redirecting, please wait...
      </p>
    </div>
  );
}
