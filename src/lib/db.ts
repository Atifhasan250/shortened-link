import connectDB from './mongodb';
import LinkModel, { ILink } from '@/models/Link';

export type Link = {
  slug: string;
  url: string;
  createdAt: Date;
  clickCount: number;
};

type SaveLinkResult = {
  success: boolean;
  error?: string;
  existingSlug?: string;
};

export async function saveLink(slug: string, url: string, editToken: string): Promise<SaveLinkResult> {
  try {
    await connectDB();

    const existingSlug = await LinkModel.findOne({ slug }).lean();
    if (existingSlug) {
      return { success: false, error: 'This custom name is already taken.' };
    }

    const existingUrl = await LinkModel.findOne({ url }).lean();
    if (existingUrl) {
      return {
        success: false,
        error: 'This URL has already been shortened.',
        existingSlug: (existingUrl as any).slug,
      };
    }

    await LinkModel.create({ slug, url, editToken });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving link:', error);
    if (error.code === 11000) {
      return { success: false, error: 'This custom name is already taken.' };
    }
    return { success: false, error: 'An error occurred while saving the link.' };
  }
}

type UpdateLinkResult = {
  success: boolean;
  error?: string;
};

export async function updateExistingLink(slug: string, newUrl: string, editToken?: string): Promise<UpdateLinkResult> {
  try {
    await connectDB();

    const link = await LinkModel.findOne({ slug }).lean();
    if (!link) {
      return { success: false, error: 'Link not found.' };
    }

    // Verify token if provided, instead of relying solely on actions level
    if (editToken && (link as any).editToken !== editToken) {
      return { success: false, error: 'Unauthorized: Invalid edit token.' };
    }

    const existingUrl = await LinkModel.findOne({ url: newUrl, slug: { $ne: slug } }).lean();
    if (existingUrl) {
      return {
        success: false,
        error: `This URL is already linked to: ${(existingUrl as any).slug}`,
      };
    }

    const updated = await LinkModel.findOneAndUpdate(
      { slug },
      { url: newUrl },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return { success: false, error: 'Failed to update link.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating link:', error);
    return { success: false, error: 'An error occurred while updating the link.' };
  }
}

export async function getLink(slug: string): Promise<string | null> {
  try {
    await connectDB();
    const link = await LinkModel.findOneAndUpdate(
      { slug },
      { $inc: { clickCount: 1 } },
      { returnDocument: 'after' }
    ).lean();
    return link ? (link as any).url : null;
  } catch (error) {
    console.error('Error getting link:', error);
    return null;
  }
}

export async function getAllLinks(page = 1, limit = 20): Promise<{ links: Link[]; total: number }> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const [links, total] = await Promise.all([
      LinkModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LinkModel.countDocuments(),
    ]);
    return {
      links: links.map((l: any) => ({
        slug: l.slug,
        url: l.url,
        createdAt: l.createdAt,
        clickCount: l.clickCount,
      })),
      total,
    };
  } catch (error) {
    console.error('Error getting all links:', error);
    return { links: [], total: 0 };
  }
}

export async function deleteLink(slug: string, editToken?: string): Promise<void> {
  try {
    await connectDB();
    if (editToken) {
      const link = await LinkModel.findOne({ slug }).lean();
      if (!link || (link as any).editToken !== editToken) {
        throw new Error('Unauthorized');
      }
    }
    await LinkModel.findOneAndDelete({ slug });
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
}
