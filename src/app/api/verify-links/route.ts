import connectDB from '@/lib/mongodb';
import LinkModel from '@/models/Link';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { slugs } = await req.json();
    
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ validSlugs: [] });
    }

    await connectDB();
    
    // Find all links that exist in the database from the provided slugs
    const existingLinks = await LinkModel.find({ slug: { $in: slugs } }).select('slug').lean();
    
    const validSlugs = existingLinks.map((link: any) => link.slug);
    
    return NextResponse.json({ validSlugs });
  } catch (error) {
    return NextResponse.json({ validSlugs: [] }, { status: 500 });
  }
}
