'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2, Edit, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { deleteLink, updateLink } from '@/app/actions';
import { Link } from '@/lib/db';
import { signOut } from 'next-auth/react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function AdminDashboardClient({ 
  initialLinks, 
  totalLinks, 
  page, 
  origin 
}: { 
  initialLinks: Link[], 
  totalLinks: number, 
  page: number, 
  origin: string 
}) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [slugToUpdate, setSlugToUpdate] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The link has been copied.',
    });
  };

  const handleDelete = async (slug: string) => {
    try {
      const result = await deleteLink(slug);
      if (result.success) {
        toast({ title: 'Success', description: 'Link deleted successfully' });
        setLinks(links.filter(l => l.slug !== slug));
        router.refresh();
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
    try {
      const result = await updateLink(slugToUpdate, newUrl);
      if (result.success) {
        toast({ title: 'Success', description: 'Link updated successfully' });
        setLinks(links.map(l => l.slug === slugToUpdate ? { ...l, url: newUrl } : l));
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
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Manage all your shortened links ({totalLinks} total)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardHeader>
        <CardContent>
          {links.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Custom Name</TableHead>
                    <TableHead>Short Link</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.slug}>
                      <TableCell className="font-medium">{link.slug}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                          <a href={`${origin}/${link.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate max-w-[150px] inline-block">{`${origin}/${link.slug}`}</a>
                          <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(`${origin}/${link.slug}`)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.url}</a>
                      </TableCell>
                      <TableCell className="text-center">{link.clickCount || 0}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
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
                                  This action cannot be undone. This will permanently delete the
                                  link for <span className="font-bold">{link.slug}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(link.slug)}>
                                  Yes, delete it
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center mt-6">
                 <Button 
                   variant="outline" 
                   disabled={page <= 1}
                   onClick={() => router.push(`/admin?page=${page - 1}`)}
                 >
                   Previous Page
                 </Button>
                 <span className="text-sm text-muted-foreground">Page {page}</span>
                 <Button 
                   variant="outline" 
                   disabled={links.length < 20}
                   onClick={() => router.push(`/admin?page=${page + 1}`)}
                 >
                   Next Page
                 </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground p-8">No links found.</p>
          )}
        </CardContent>
      </Card>

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
