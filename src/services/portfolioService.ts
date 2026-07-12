import { db, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { PROJECTS, Project, TRUSTED_BRANDS, Brand } from '../constants';

const PROJECTS_COLLECTION = 'projects';
const BRANDS_COLLECTION = 'brands';

// Helper to check if a URL is from Firebase Storage
const isFirebaseStorageUrl = (url: string) => {
  return url.includes('firebasestorage.googleapis.com');
};

// Helper to get reference from Firebase Storage URL
const getStorageRefFromUrl = (url: string) => {
  const decodedUrl = decodeURIComponent(url);
  const parts = decodedUrl.split('/o/');
  if (parts.length > 1) {
    const path = parts[1].split('?')[0];
    return ref(storage, path);
  }
  throw new Error('Invalid Firebase Storage URL');
};

// Helper to resolve migrated dev paths to their actual imported production assets
const resolveProjectImage = (imagePath: string, projectId: string): string => {
  if (!imagePath) return '';
  // If it's a firebase storage URL or full http URL, use it directly
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Otherwise, find the original project import in PROJECTS
  const original = PROJECTS.find(p => p.id === projectId);
  if (original) {
    return original.image;
  }
  return imagePath;
};

// Helper to resolve migrated dev paths to their actual imported brand logo assets
const resolveBrandLogo = (logoPath: string, brandId: string): string => {
  if (!logoPath) return '';
  if (logoPath.startsWith('http') || logoPath.startsWith('blob:') || logoPath.startsWith('data:')) {
    return logoPath;
  }
  const original = TRUSTED_BRANDS.find(b => b.id === brandId);
  if (original) {
    return original.logo;
  }
  return logoPath;
};

export const portfolioService = {
  // Fetch all projects from Firestore, falling back to constants.ts if empty/error
  async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      const firestoreProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreProjects.push({
          id: doc.id,
          title: data.title || '',
          category: data.category || '',
          image: resolveProjectImage(data.image || '', doc.id),
          url: data.url || ''
        });
      });

      if (firestoreProjects.length > 0) {
        return firestoreProjects;
      }
      
      console.log('No projects in Firestore, falling back to static projects');
      return PROJECTS;
    } catch (error) {
      console.error('Error fetching projects from Firestore:', error);
      return PROJECTS;
    }
  },

  // Get raw Firestore projects (returns empty array if none, used for migration detection)
  async getFirestoreProjectsOnly(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    const firestoreProjects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      firestoreProjects.push({
        id: doc.id,
        title: data.title || '',
        category: data.category || '',
        image: resolveProjectImage(data.image || '', doc.id),
        url: data.url || ''
      });
    });
    return firestoreProjects;
  },

  // One-time migration of static projects to Firestore
  async migrateProjects(): Promise<void> {
    for (const project of PROJECTS) {
      const docRef = doc(db, PROJECTS_COLLECTION, project.id);
      await setDoc(docRef, {
        title: project.title,
        category: project.category,
        image: project.image,
        url: project.url,
        createdAt: new Date().toISOString()
      });
    }
  },

  // Fetch all brand logos from Firestore, falling back to constants.ts if empty/error
  async getBrands(): Promise<Brand[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BRANDS_COLLECTION));
      const firestoreBrands: Brand[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreBrands.push({
          id: doc.id,
          name: data.name || '',
          logo: resolveBrandLogo(data.logo || '', doc.id)
        });
      });

      if (firestoreBrands.length > 0) {
        return firestoreBrands;
      }
      return TRUSTED_BRANDS;
    } catch (error) {
      console.error('Error fetching brands from Firestore:', error);
      return TRUSTED_BRANDS;
    }
  },

  // Get raw Firestore brands (returns empty array if none, used for migration detection)
  async getFirestoreBrandsOnly(): Promise<Brand[]> {
    const querySnapshot = await getDocs(collection(db, BRANDS_COLLECTION));
    const firestoreBrands: Brand[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      firestoreBrands.push({
        id: doc.id,
        name: data.name || '',
        logo: resolveBrandLogo(data.logo || '', doc.id)
      });
    });
    return firestoreBrands;
  },

  // One-time migration of static brands to Firestore
  async migrateBrands(): Promise<void> {
    for (const brand of TRUSTED_BRANDS) {
      const docRef = doc(db, BRANDS_COLLECTION, brand.id);
      await setDoc(docRef, {
        name: brand.name,
        logo: brand.logo,
        createdAt: new Date().toISOString()
      });
    }
  },

  // Add a new brand logo
  async addBrand(name: string, logoFile: File): Promise<Brand> {
    // 1. Upload logo to Firebase Storage
    const storageRef = ref(storage, `brands/${Date.now()}_${logoFile.name}`);
    const uploadResult = await uploadBytes(storageRef, logoFile);
    const logoUrl = await getDownloadURL(uploadResult.ref);

    // 2. Save metadata to Firestore
    const docRef = await addDoc(collection(db, BRANDS_COLLECTION), {
      name,
      logo: logoUrl,
      createdAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      name,
      logo: logoUrl
    };
  },

  // Delete a brand logo
  async deleteBrand(id: string, logoUrl?: string): Promise<void> {
    // 1. Delete metadata from Firestore
    const docRef = doc(db, BRANDS_COLLECTION, id);
    await deleteDoc(docRef);

    // 2. Delete file from Storage if hosted on Firebase
    if (logoUrl && isFirebaseStorageUrl(logoUrl)) {
      try {
        const fileRef = getStorageRefFromUrl(logoUrl);
        await deleteObject(fileRef);
      } catch (e) {
        console.error('Failed to delete brand logo from storage during deletion:', e);
      }
    }
  },

  // Add a new project
  async addProject(
    projectData: Omit<Project, 'id' | 'image'>, 
    imageFile: File
  ): Promise<Project> {
    // 1. Upload image to Firebase Storage
    const storageRef = ref(storage, `portfolio/${Date.now()}_${imageFile.name}`);
    const uploadResult = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Save metadata to Firestore
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      title: projectData.title,
      category: projectData.category,
      url: projectData.url,
      image: imageUrl,
      createdAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      ...projectData,
      image: imageUrl
    };
  },

  // Update an existing project
  async updateProject(
    id: string, 
    projectData: Partial<Omit<Project, 'id'>>, 
    imageFile?: File,
    oldImageUrl?: string
  ): Promise<void> {
    const updateData: any = { ...projectData };

    // 1. Handle image upload if a new file is provided
    if (imageFile) {
      const storageRef = ref(storage, `portfolio/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      updateData.image = imageUrl;

      // Clean up old image if it was hosted on Firebase Storage
      if (oldImageUrl && isFirebaseStorageUrl(oldImageUrl)) {
        try {
          const oldRef = getStorageRefFromUrl(oldImageUrl);
          await deleteObject(oldRef);
        } catch (e) {
          console.error('Failed to delete old image from storage:', e);
        }
      }
    }

    // 2. Update metadata in Firestore
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, updateData);
  },

  // Delete a project
  async deleteProject(id: string, imageUrl?: string): Promise<void> {
    // 1. Delete metadata from Firestore
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);

    // 2. Delete file from Storage if hosted on Firebase
    if (imageUrl && isFirebaseStorageUrl(imageUrl)) {
      try {
        const fileRef = getStorageRefFromUrl(imageUrl);
        await deleteObject(fileRef);
      } catch (e) {
        console.error('Failed to delete image from storage during project deletion:', e);
      }
    }
  }
};
