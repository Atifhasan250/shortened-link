
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
  DialogClose,
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
} from "@/components/ui/alert-dialog"

import { createShortLink, updateLink, deleteLink } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Wand2, ClipboardPaste, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';
import { getAllLinks, Link } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  slug: z.string().min(3, { message: 'Custom name must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Only letters, numbers, hyphens, and underscores are allowed.' }),
});

const adminAuthSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


export default function Home() {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [slugToManage, setSlugToManage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState('');
  const [linkHistory, setLinkHistory] = useState<Link[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [urlToUpdate, setUrlToUpdate] = useState('');
  const [actionToPerform, setActionToPerform] = useState<'update' | 'delete' | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      if (sessionStorage.getItem('isAdmin') === 'true') {
        setIsAdmin(true);
        setIsAdminAuthenticated(true);
      }
    }
    fetchHistory();
  }, []);
  
  async function fetchHistory() {
    setIsLoadingHistory(true);
    const history = await getAllLinks();
    setLinkHistory(history);
    setIsLoadingHistory(false);
  }


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      slug: '',
    },
  });

  const adminAuthForm = useForm<z.infer<typeof adminAuthSchema>>({
    resolver: zodResolver(adminAuthSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });


  function showSuccessModal(shortUrl: string) {
    setGeneratedLink(`${origin}/${shortUrl}`);
    setIsModalOpen(true);
    form.reset();
    fetchHistory();
  }
  
  function openManageModal(slug: string, url: string, action: 'update' | 'delete') {
    setSlugToManage(slug);
    setUrlToUpdate(url);
    setActionToPerform(action);
    setAuthError('');
    adminAuthForm.reset();

    if (isAdminAuthenticated) {
      if (action === 'update') {
        handleAutoUpdate();
      } else {
        setIsManageModalOpen(true); 
      }
    } else {
      setIsManageModalOpen(true);
    }
  }

  async function onAdminAuthSubmit(values: z.infer<typeof adminAuthSchema>) {
    if (values.username === 'fahim' && values.password === 'fahim') {
      setIsAdminAuthenticated(true);
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setAuthError('');
      
      if (actionToPerform === 'update') {
        await handleAutoUpdate();
      } else if (actionToPerform === 'delete') {
        setIsManageModalOpen(false);
        // We need to re-trigger the alert dialog for deletion confirmation
        // This is a bit tricky, so for now we will just close the auth modal
        // and the user has to click delete again.
        toast({
          title: 'Authenticated!',
          description: 'Please click the remove button again to confirm deletion.',
        });

      }

    } else {
      setAuthError('Invalid credentials. Only admins can manage links.');
      setIsAdminAuthenticated(false);
    }
  }

  async function handleAutoUpdate() {
    try {
      const result = await updateLink(slugToManage, urlToUpdate);
      if (result.success && result.shortUrl) {
        setIsManageModalOpen(false);
        showSuccessModal(result.shortUrl);
        toast({
          title: 'Success!',
          description: 'The link has been updated successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update link.',
        });
         setIsManageModalOpen(false);
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was a problem with your request.',
      });
       setIsManageModalOpen(false);
    }
  }
  
  async function handleDeleteLink(slug: string) {
    if (!isAdminAuthenticated) {
        openManageModal(slug, '', 'delete');
        return;
    }
    
    try {
      const result = await deleteLink(slug);
      if (result.success) {
        toast({
          title: "Success!",
          description: "The link has been removed.",
        });
        fetchHistory();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to remove link.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createShortLink(values);
      if (result.success && result.shortUrl) {
        showSuccessModal(result.shortUrl);
      } else {
        if (result.error === 'This custom name is already taken.') {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: (
                <div className="flex flex-col items-start gap-2">
                  <span>{result.error}</span>
                   <div className="flex flex-row items-center justify-between mt-2 w-full">
                     <ToastAction
                      altText="See Link"
                      onClick={() => showSuccessModal(values.slug)}
                      className="bg-white text-black hover:bg-black hover:text-white"
                    >
                      See Link
                    </ToastAction>
                    <button
                      onClick={() => openManageModal(values.slug, values.url, 'update')}
                      className="text-sm underline hover:text-white/80 text-left cursor-pointer"
                    >
                      Manage Link
                    </button>
                  </div>
                </div>
              ),
            });
        } else if (result.error === 'This URL has already been shortened.' && result.shortUrl) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error,
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => showSuccessModal(result.shortUrl!)}
                 className="bg-white text-black hover:bg-black hover:text-white"
              >
                See Link
              </Button>
            ),
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Failed to create link.',
          });
        }
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

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
       <div className="flex flex-col items-center justify-center text-center px-4 mb-8">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4">
          Shortened Link
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground">
          Transform your long, unwieldy URLs into short, memorable links. Create your magic link and share it with the world.
        </p>
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
      
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Link History</CardTitle>
          <CardDescription className="text-center">A list of created links in this app.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
             <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 border-4 border-primary border-solid border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : linkHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Custom Name</TableHead>
                  <TableHead className="text-center">Short Link</TableHead>
                  <TableHead className="text-center">Original URL</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkHistory.map((link) => (
                  <TableRow key={link.slug}>
                    <TableCell className="font-medium">{link.slug}</TableCell>
                    <TableCell>
                       <div className="flex items-center justify-center gap-2">
                        <a href={`${origin}/${link.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{`${origin}/${link.slug}`}</a>
                        <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(`${origin}/${link.slug}`)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.url}</a>
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={(e) => {
                                if (!isAdminAuthenticated) {
                                    e.preventDefault();
                                    openManageModal(link.slug, link.url, 'delete');
                                }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              link for <span className="font-bold">{link.slug}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteLink(link.slug)}>
                              Yes, delete it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">You haven't created any links yet.</p>
          )}
        </CardContent>
      </Card>


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
      
      {/* Manage/Auth Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-center">
              {actionToPerform === 'update' ? 'Manage Link' : 'Admin Authentication'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
              {isAdminAuthenticated && actionToPerform === 'update' ? (
                 <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 border-4 border-primary border-solid border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg text-muted-foreground">Authentication successful. Updating link...</p>
                </div>
              ) : (
                <>
                  <p className="text-center text-muted-foreground">
                    {actionToPerform === 'update' 
                      ? <>The custom name <span className="font-bold text-primary">{slugToManage}</span> is already taken. Please authenticate to update the URL it points to.</>
                      : 'Please authenticate to proceed with deleting the link.'
                    }
                  </p>
                  <Form {...adminAuthForm}>
                    {authError && (
                        <Alert variant="destructive">
                          <AlertTitle>Authentication Failed</AlertTitle>
                          <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                      )}
                    <form onSubmit={adminAuthForm.handleSubmit(onAdminAuthSubmit)} className="space-y-4">
                      <FormField
                        control={adminAuthForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter admin username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={adminAuthForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter admin password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                       {actionToPerform === 'update' ? 'Authenticate and Update' : 'Authenticate'}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
