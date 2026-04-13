'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { createShortLink, deleteLink, updateLink } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Wand2, ClipboardPaste, Edit, Trash2 } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  slug: z.string().min(3, { message: 'Custom name must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Only letters, numbers, hyphens, and underscores are allowed.' }),
});

type RecentLink = {
  slug: string;
  url: string;
  editToken?: string;
};

export default function Home() {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState('');
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [totalLinks, setTotalLinks] = useState<number | null>(null);
  const { toast } = useToast();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [slugToUpdate, setSlugToUpdate] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      const stored = localStorage.getItem('recentLinks');
      if (stored) {
        const parsedLinks: RecentLink[] = JSON.parse(stored);
        setRecentLinks(parsedLinks);
        
        // Verify links against the database
        if (parsedLinks.length > 0) {
          verifyLinks(parsedLinks);
        }
      }
    }
    fetchStats();
  }, []);

  async function verifyLinks(links: RecentLink[]) {
    try {
      const slugs = links.map(l => l.slug);
      const res = await fetch('/api/verify-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs })
      });
      
      if (res.ok) {
        const { validSlugs } = await res.json();
        // Keep only links that still exist in the database
        const stillValidLinks = links.filter(l => validSlugs.includes(l.slug));
        
        if (stillValidLinks.length !== links.length) {
          setRecentLinks(stillValidLinks);
          localStorage.setItem('recentLinks', JSON.stringify(stillValidLinks));
        }
      }
    } catch (e) {
      console.error('Failed to verify links', e);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setTotalLinks(data.totalLinks);
      }
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      slug: '',
    },
  });

  function showSuccessModal(shortUrl: string) {
    setGeneratedLink(`${origin}/${shortUrl}`);
    setIsModalOpen(true);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createShortLink(values);
      if (result.success && result.shortUrl) {
        showSuccessModal(result.shortUrl);
        
        // Save to recent links
        const newLink = { slug: result.shortUrl, url: values.url, editToken: result.editToken };
        const updatedRecent = [newLink, ...recentLinks.filter(l => l.slug !== newLink.slug)].slice(0, 10);
        setRecentLinks(updatedRecent);
        localStorage.setItem('recentLinks', JSON.stringify(updatedRecent));
        
        form.reset();
        fetchStats(); // Update stats after creation
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to create link.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was a problem with your request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The link has been copied.',
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue('url', text);
      toast({
        title: 'Pasted from clipboard!',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to paste',
        description: 'Could not read from clipboard. Please check permissions.',
      });
    }
  };

  const handleDelete = async (slug: string, editToken?: string) => {
    try {
      const result = await deleteLink(slug, editToken);
      if (result.success) {
        toast({ title: 'Success', description: 'Link deleted successfully' });
        const updated = recentLinks.filter(l => l.slug !== slug);
        setRecentLinks(updated);
        localStorage.setItem('recentLinks', JSON.stringify(updated));
        fetchStats();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete link', variant: 'destructive' });
    }
  };

  const openUpdateModal = (slug: string, url: string) => {
    setSlugToUpdate(slug);
    setNewUrl(url);
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    const linkObj = recentLinks.find(l => l.slug === slugToUpdate);
    try {
      const result = await updateLink(slugToUpdate, newUrl, linkObj?.editToken);
      if (result.success) {
        toast({ title: 'Success', description: 'Link updated successfully' });
        const updated = recentLinks.map(l => l.slug === slugToUpdate ? { ...l, url: newUrl } : l);
        setRecentLinks(updated);
        localStorage.setItem('recentLinks', JSON.stringify(updated));
        setIsUpdateModalOpen(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update link', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
       <div className="flex flex-col items-center justify-center text-center px-4 mb-8">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4">
          Shortened Link
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground">
          Transform your long, unwieldy URLs into short, memorable links. Create your magic link and share it with the world.
        </p>
        
        {totalLinks !== null && (
          <div className="mt-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Wand2 className="mr-2 h-4 w-4 text-primary" />
            {totalLinks} links shortened so far
          </div>
        )}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Create a Magical Link</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long URL</FormLabel>
                    <FormControl>
                       <div className="flex w-full items-center gap-2">
                        <Input placeholder="https://your-very-long-url.com/goes-here" {...field} />
                        <Button type="button" size="icon" onClick={handlePaste} className="shrink-0">
                          <ClipboardPaste className="h-4 w-4" />
                          <span className="sr-only">Paste from clipboard</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Name</FormLabel>
                    <FormDescription className="bg-muted p-2 rounded-md break-words">
                      Your shortened link will look like this: {origin}/&lt;your-custom-name&gt;
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="my-magic-link" {...field} className="mt-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-headline" disabled={isSubmitting}>
                {isSubmitting ? 'Conjuring...' : 'Generate Link'}
                <Wand2 className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {recentLinks.length > 0 && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Your Recent Links</CardTitle>
            <CardDescription>Links you've shortened recently on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLinks.map((link) => (
                <div key={link.slug} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="overflow-hidden">
                    <p className="font-medium text-primary hover:underline truncate">
                      <a href={`${origin}/${link.slug}`} target="_blank" rel="noopener noreferrer">
                        {origin}/{link.slug}
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground truncate" title={link.url}>
                      {link.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${origin}/${link.slug}`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {link.editToken && (
                      <>
                        <Button variant="outline" size="icon" onClick={() => openUpdateModal(link.slug, link.url)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the short link <span className="font-bold">{link.slug}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(link.slug, link.editToken)}>
                                Yes, delete it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-center">Your Link is Ready!</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-center text-muted-foreground">
              Your alchemy was successful. Here is your short link:
            </p>
            <div className="flex items-center space-x-2">
                <Input value={generatedLink} readOnly />
                <Button type="button" size="icon" onClick={() => copyToClipboard(generatedLink)}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <Button asChild variant="outline">
              <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                Test Link <LinkIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Link Destination</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Target URL for /{slugToUpdate}</label>
              <Input 
                value={newUrl} 
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isUpdating || !newUrl.trim()}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
