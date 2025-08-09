import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, limit, updateDoc, deleteDoc } from 'firebase/firestore';

const linksCollection = collection(db, 'links');

export type Link = {
  slug: string;
  url: string;
};

type SaveLinkResult = {
  success: boolean;
  error?: string;
  existingSlug?: string;
};


export async function saveLink(slug: string, url: string): Promise<SaveLinkResult> {
  try {
    const slugDocRef = doc(db, 'links', slug);
    const slugDocSnap = await getDoc(slugDocRef);

    if (slugDocSnap.exists()) {
      return { success: false, error: 'This custom name is already taken.' };
    }

    // Check if the URL has already been shortened with a different slug.
    const urlQuery = query(linksCollection, where('url', '==', url), limit(1));
    const urlQuerySnapshot = await getDocs(urlQuery);

    if (!urlQuerySnapshot.empty) {
      const existingDoc = urlQuerySnapshot.docs[0];
      return {
        success: false,
        error: 'This URL has already been shortened.',
        existingSlug: existingDoc.id,
      };
    }

    await setDoc(slugDocRef, { url });
    console.log(`Saved: ${slug} -> ${url}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving link: ", error);
    return { success: false, error: 'An error occurred while saving the link.' };
  }
}

type UpdateLinkResult = {
  success: boolean;
  error?: string;
};

export async function updateExistingLink(slug: string, newUrl: string): Promise<UpdateLinkResult> {
  try {
    const slugDocRef = doc(db, 'links', slug);
    
    // Optional: Check if the new URL is already shortened with another slug
    const urlQuery = query(linksCollection, where('url', '==', newUrl), limit(1));
    const urlQuerySnapshot = await getDocs(urlQuery);
    if (!urlQuerySnapshot.empty) {
        const existingDoc = urlQuerySnapshot.docs[0];
        if (existingDoc.id !== slug) {
            return {
                success: false,
                error: `This URL is already linked to the custom name: ${existingDoc.id}`,
            };
        }
    }
    
    await updateDoc(slugDocRef, { url: newUrl });
    console.log(`Updated: ${slug} -> ${newUrl}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating link: ", error);
    if ((error as any).code === 'not-found') {
       return { success: false, error: 'This custom name does not exist.' };
    }
    return { success: false, error: 'An error occurred while updating the link.' };
  }
}


export async function getLink(slug: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'links', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const url = docSnap.data().url;
      console.log(`Retrieved: ${slug} -> ${url}`);
      return url;
    } else {
      console.log(`No link found for slug: ${slug}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting link: ", error);
    return null;
  }
}

export async function getAllLinks(): Promise<Link[]> {
  try {
    const querySnapshot = await getDocs(linksCollection);
    const links: Link[] = [];
    querySnapshot.forEach((doc) => {
      links.push({ slug: doc.id, ...doc.data() } as Link);
    });
    console.log(`Retrieved ${links.length} links.`);
    return links.sort((a, b) => a.slug.localeCompare(b.slug)); // Sort alphabetically by slug
  } catch (error) {
    console.error("Error getting all links: ", error);
    return [];
  }
}

export async function deleteLink(slug: string): Promise<void> {
    try {
        const docRef = doc(db, 'links', slug);
        await deleteDoc(docRef);
        console.log(`Deleted link with slug: ${slug}`);
    } catch (error) {
        console.error("Error deleting link: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
