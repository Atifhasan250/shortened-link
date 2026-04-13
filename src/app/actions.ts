'use server';

import { auth } from '@/auth';
import * as z from 'zod';
import { saveLink, updateExistingLink, deleteLink as dbDeleteLink } from '@/lib/db';
import { headers } from 'next/headers';
import { ratelimit } from '@/lib/ratelimit';

const formSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
});

function isBlockedUrl(url: string): boolean {
  const blocked = ['javascript:', 'data:', 'vbscript:'];
  return blocked.some((b) => url.toLowerCase().startsWith(b));
}

type CreateShortLinkResult = {
  success: boolean;
  shortUrl?: string;
  error?: string;
  editToken?: string;
};

export async function createShortLink(
  values: z.infer<typeof formSchema>
): Promise<CreateShortLinkResult> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
  
  const { success: rateLimiterSuccess, error: rateLimiterError } = ratelimit.limit(ip);
  if (!rateLimiterSuccess) {
    return { success: false, error: rateLimiterError };
  }

  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { url, slug } = validatedFields.data;

  // Block obviously malicious patterns
  if (isBlockedUrl(url)) {
    return { success: false, error: 'This URL is not allowed.' };
  }

  const editToken = crypto.randomUUID();
  const result = await saveLink(slug, url, editToken);

  if (!result.success) {
    if (result.error === 'This URL has already been shortened.' && result.existingSlug) {
      return { success: false, error: result.error, shortUrl: result.existingSlug };
    }
    return { success: false, error: result.error };
  }

  return { success: true, shortUrl: slug, editToken };
}

const updateFormSchema = z.object({
  url: z.string().url(),
});

export async function updateLink(slug: string, newUrl: string, editToken?: string): Promise<CreateShortLinkResult> {
  const session = await auth();
  if (!session && !editToken) return { success: false, error: 'Unauthorized.' };

  const validatedFields = updateFormSchema.safeParse({ url: newUrl });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid URL format.' };
  }

  const tokenToVerify = session ? undefined : editToken;
  const result = await updateExistingLink(slug, newUrl, tokenToVerify);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, shortUrl: slug };
}

type DeleteLinkResult = {
  success: boolean;
  error?: string;
};

export async function deleteLink(slug: string, editToken?: string): Promise<DeleteLinkResult> {
  const session = await auth();
  if (!session && !editToken) return { success: false, error: 'Unauthorized.' };

  try {
    const tokenToVerify = session ? undefined : editToken;
    await dbDeleteLink(slug, tokenToVerify);
    return { success: true };
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return { success: false, error: 'Invalid edit token.' };
    }
    return { success: false, error: 'Failed to delete link.' };
  }
}
