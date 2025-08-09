import { NextResponse } from 'next/server';

export async function GET() {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="24" height="24" fill="black" rx="4" />
      <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke="white" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" stroke="white" />
      <line x1="8" x2="16" y1="12" y2="12" stroke="white" />
    </svg>`;
    
  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
