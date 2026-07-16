import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc
} from 'firebase/firestore';
import { PROJECTS, Project, TRUSTED_BRANDS, Brand } from '../constants';

export interface PaymentInstallment {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export interface ClientInstallment {
  amount: number;
  date: string;
}

export interface ClientProjectFinancial {
  id?: string;
  date: string;
  clientName: string;
  clientNumber: string;
  businessCategory: string;
  requirement: string;
  agreedAmount: number;
  advanceReceived: number;
  advanceReceivedDate: string;
  expectedClosureDate: string;
  projectClosed: 'Yes' | 'No';
  balancePaymentReceived: number;
  installments?: ClientInstallment[];
  domainAmount: number;
  domainName?: string;
  serverAmount: number;
  renewalDate: string;
  balanceToBeReceived: number;
  clientSatisfied: 'Yes' | 'No';
  reviewPosted: 'Yes' | 'No';
  upsellingPossibility: string;
  nextFollowUpDate: string;
  paymentMode: 'cheque' | 'cash' | 'UPI';
  createdAt: string;
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

const PROJECTS_COLLECTION = 'projects';
const BRANDS_COLLECTION = 'brands';
const CLIENT_FINANCIALS_COLLECTION = 'client_financials';
const EXPENSES_COLLECTION = 'expenses';

// Helper to upload files directly to Cloudinary using Unsigned Uploads
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName.includes('YOUR_CLOUDINARY') || uploadPreset.includes('YOUR_CLOUDINARY')) {
    throw new Error('Cloudinary credentials are not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment variables (local .env or Vercel settings).');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary. Please verify that your Cloudinary Upload Preset is configured as "Unsigned".');
  }

  const data = await response.json();
  return data.secure_url;
};

// Helper to check if a URL is from Firebase Storage (for legacy checks if needed)
const isFirebaseStorageUrl = (url: string) => {
  return url.includes('firebasestorage.googleapis.com');
};

// Helper to resolve migrated dev paths to their actual imported production assets
const resolveProjectImage = (imagePath: string, projectId: string): string => {
  if (!imagePath) return '';
  // If it's a firebase storage URL or Cloudinary URL or full http URL, use it directly
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

  // Add a new brand logo using Cloudinary
  async addBrand(name: string, logoFile: File): Promise<Brand> {
    // 1. Upload logo to Cloudinary
    const logoUrl = await uploadToCloudinary(logoFile);

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
    // Delete metadata from Firestore
    const docRef = doc(db, BRANDS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Add a new project using Cloudinary
  async addProject(
    projectData: Omit<Project, 'id' | 'image'>, 
    imageFile: File
  ): Promise<Project> {
    // 1. Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(imageFile);

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
      const imageUrl = await uploadToCloudinary(imageFile);
      updateData.image = imageUrl;
    }

    // 2. Update metadata in Firestore
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, updateData);
  },

  // Delete a project
  async deleteProject(id: string, imageUrl?: string): Promise<void> {
    // Delete metadata from Firestore
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Client Financials Ledgers
  async getClientProjects(): Promise<ClientProjectFinancial[]> {
    try {
      const querySnapshot = await getDocs(collection(db, CLIENT_FINANCIALS_COLLECTION));
      const list: ClientProjectFinancial[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          date: data.date || '',
          clientName: data.clientName || '',
          clientNumber: data.clientNumber || '',
          businessCategory: data.businessCategory || '',
          requirement: data.requirement || '',
          agreedAmount: Number(data.agreedAmount) || 0,
          advanceReceived: Number(data.advanceReceived) || 0,
          advanceReceivedDate: data.advanceReceivedDate || '',
          expectedClosureDate: data.expectedClosureDate || '',
          projectClosed: data.projectClosed || 'No',
          balancePaymentReceived: Number(data.balancePaymentReceived) || 0,
          installments: data.installments || [],
          domainAmount: Number(data.domainAmount) || 0,
          domainName: data.domainName || '',
          serverAmount: Number(data.serverAmount) || 0,
          renewalDate: data.renewalDate || '',
          balanceToBeReceived: Number(data.balanceToBeReceived) || 0,
          clientSatisfied: data.clientSatisfied || 'No',
          reviewPosted: data.reviewPosted || 'No',
          upsellingPossibility: data.upsellingPossibility || '',
          nextFollowUpDate: data.nextFollowUpDate || '',
          paymentMode: data.paymentMode || 'UPI',
          createdAt: data.createdAt || ''
        });
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Error fetching client financials:', e);
      return [];
    }
  },

  async addClientProject(project: Omit<ClientProjectFinancial, 'id' | 'createdAt'>): Promise<ClientProjectFinancial> {
    const newProject = {
      ...project,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, CLIENT_FINANCIALS_COLLECTION), newProject);
    return {
      id: docRef.id,
      ...newProject
    };
  },

  async updateClientProject(id: string, data: Partial<Omit<ClientProjectFinancial, 'id'>>): Promise<void> {
    const docRef = doc(db, CLIENT_FINANCIALS_COLLECTION, id);
    await updateDoc(docRef, data);
  },

  async deleteClientProject(id: string): Promise<void> {
    const docRef = doc(db, CLIENT_FINANCIALS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Expenses Tracker
  async getExpenses(): Promise<Expense[]> {
    try {
      const querySnapshot = await getDocs(collection(db, EXPENSES_COLLECTION));
      const list: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          description: data.description || '',
          amount: Number(data.amount) || 0,
          date: data.date || '',
          note: data.note || data.category || '',
          createdAt: data.createdAt || ''
        });
      });
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error fetching expenses:', e);
      return [];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const newExpense = {
      ...expense,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), newExpense);
    return {
      id: docRef.id,
      ...newExpense
    };
  },

  async deleteExpense(id: string): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
