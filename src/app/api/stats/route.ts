import connectDB from '@/lib/mongodb';
import LinkModel from '@/models/Link';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const count = await LinkModel.countDocuments();
    return NextResponse.json({ totalLinks: count });
  } catch (error) {
    return NextResponse.json({ totalLinks: 0 }, { status: 500 });
  }
}
