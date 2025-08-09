'use server';

import * as z from 'zod';
import { saveLink, updateExistingLink, deleteLink as dbDeleteLink } from '@/lib/db';

const formSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
});

type CreateShortLinkResult = {
  success: boolean;
  shortUrl?: string;
  error?: string;
};

export async function createShortLink(
  values: z.infer<typeof formSchema>
): Promise<CreateShortLinkResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { url, slug } = validatedFields.data;

  const result = await saveLink(slug, url);

  if (!result.success) {
    if (result.error === 'This URL has already been shortened.' && result.existingSlug) {
      return { success: false, error: result.error, shortUrl: result.existingSlug };
    }
    return { success: false, error: result.error };
  }

  return { success: true, shortUrl: slug };
}


const updateFormSchema = z.object({
  url: z.string().url(),
});

export async function updateLink(slug: string, newUrl: string): Promise<CreateShortLinkResult> {
  const validatedFields = updateFormSchema.safeParse({ url: newUrl });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid URL format.' };
  }

  const result = await updateExistingLink(slug, newUrl);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, shortUrl: slug };
}

type DeleteLinkResult = {
  success: boolean;
  error?: string;
};

export async function deleteLink(slug: string): Promise<DeleteLinkResult> {
    try {
        await dbDeleteLink(slug);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete link.' };
    }
}
