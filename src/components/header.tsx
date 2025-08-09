'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import Logo from './logo';

const Header = () => {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={handleLogoClick}>
          <Logo className="h-6 w-6 md:h-8 md:w-8" />
          <span className="font-headline text-base md:text-xl font-semibold">
            Shortened Link
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
