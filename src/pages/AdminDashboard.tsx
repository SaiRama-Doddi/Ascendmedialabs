import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { portfolioService } from '../services/portfolioService';
import { Project, Brand } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  Sparkles,
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Upload, 
  X, 
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  BarChart2,
  Calendar,
  Check,
  Image as ImageIcon,
  User,
  Lock
} from 'lucide-react';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted';
  createdAt: string;
}

// Helper to run database operations with a timeout to avoid hangs
function withTimeout<T>(promise: Promise<T>, ms: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out. Please verify your Firebase connection and Security Rules.')), ms)
    )
  ]);
}

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  // OTP state variables for confidential Account tab
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'brands' | 'inquiries' | 'settings' | 'account'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Brand form states
  const [brandName, setBrandName] = useState('');
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brandFileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
        loadAllData();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (brandLogoPreview) URL.revokeObjectURL(brandLogoPreview);
    };
  }, [imagePreview, brandLogoPreview]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all three datasets in parallel with a generous timeout (15 seconds)
      let projList: Project[] = [];
      let brandList: Brand[] = [];

      const [projResult, brandResult] = await withTimeout(
        Promise.all([
          portfolioService.getFirestoreProjectsOnly(),
          portfolioService.getFirestoreBrandsOnly(),
          fetchInquiries()
        ]),
        15000
      );

      projList = projResult;
      brandList = brandResult;

      // Handle migrations if either list is empty (database is brand new)
      if (projList.length === 0) {
        console.log('No Firestore projects found. Triggering automated migration...');
        try {
          await withTimeout(portfolioService.migrateProjects(), 8000);
          projList = await withTimeout(portfolioService.getFirestoreProjectsOnly(), 8000);
        } catch (migErr) {
          console.warn('Projects migration failed or timed out:', migErr);
        }
      }

      if (brandList.length === 0) {
        console.log('No Firestore brands found. Triggering automated migration...');
        try {
          await withTimeout(portfolioService.migrateBrands(), 8000);
          brandList = await withTimeout(portfolioService.getFirestoreBrandsOnly(), 8000);
        } catch (migErr) {
          console.warn('Brands migration failed or timed out:', migErr);
        }
      }

      setProjects(projList);
      setBrands(brandList);
    } catch (err: any) {
      console.warn('Sync failed:', err);
      
      const errMsg = err?.message || '';
      if (errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('insufficient')) {
        setError('Firebase Permission Denied. Please make sure you have updated the Security Rules in your Firestore Database "Rules" tab to allow public reads.');
      } else if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('timed out')) {
        setError('Connection to Firestore timed out. Please check your internet connection or verify your Firebase setup.');
      } else {
        setError(`Firebase Sync Error: ${errMsg || 'Connection failed'}. Showing offline fallback data.`);
      }

      // Fallbacks
      const pFallback = await portfolioService.getProjects();
      const bFallback = await portfolioService.getBrands();
      setProjects(pFallback);
      setBrands(bFallback);
    } finally {
      setLoading(false);
    }
  };

  // Trigger OTP dispatch via serverless function
  const handleTriggerOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setUserOtpInput('');
    setOtpError('');
    setOtpSentMessage('');
    setShowOtpModal(true);
    setSendingOtp(true);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: otp,
          email: 'ascendmedialabsinfo@gmail.com'
        })
      });

      if (response.ok) {
        setOtpSentMessage('A secure One-Time Password (OTP) has been sent to your administrator email.');
      } else {
        const data = await response.json().catch(() => ({}));
        console.warn('API OTP Send failed, using screen fallback:', data.error);
        setOtpSentMessage('Failed to deliver email. Using screen fallback.');
      }
    } catch (err) {
      console.warn('Network error sending OTP, using screen fallback:', err);
      setOtpSentMessage('Network error. Using screen fallback.');
    } finally {
      setSendingOtp(false);
    }
  };

  const fetchInquiries = async () => {
    const querySnapshot = await getDocs(collection(db, 'inquiries'));
    const list: Inquiry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        message: data.message || '',
        status: data.status || 'new',
        createdAt: data.createdAt || ''
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setInquiries(list);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (err) {
      setError('Failed to sign out.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB.');
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError('');
    }
  };

  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Brand logo must be under 2MB.');
        return;
      }
      setBrandLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBrandLogoPreview(previewUrl);
      setError('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setUrl('');
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetBrandForm = () => {
    setBrandName('');
    setBrandLogoFile(null);
    if (brandLogoPreview) URL.revokeObjectURL(brandLogoPreview);
    setBrandLogoPreview(null);
    if (brandFileInputRef.current) brandFileInputRef.current.value = '';
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !url || !imageFile) {
      setError('Please fill all fields and select an image.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      await withTimeout(portfolioService.addProject({ title, category, url }, imageFile), 10000);
      
      setSuccess('Project added successfully!');
      setShowAddModal(false);
      resetForm();
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to add project. Check Firebase Storage and Rules.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setTitle(project.title);
    setCategory(project.category);
    setUrl(project.url);
    setImagePreview(project.image);
    setShowEditModal(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    if (!title || !category || !url) {
      setError('Please fill in all text fields.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await withTimeout(
        portfolioService.updateProject(
          currentProject.id, 
          { title, category, url }, 
          imageFile || undefined, 
          currentProject.image
        ),
        10000
      );

      setSuccess('Project updated successfully!');
      setShowEditModal(false);
      resetForm();
      setCurrentProject(null);
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update project. Verify Firestore Rules.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await withTimeout(portfolioService.deleteProject(project.id, project.image), 8000);

      setSuccess('Project deleted successfully!');
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !brandLogoFile) {
      setError('Please fill brand name and select logo image.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await withTimeout(portfolioService.addBrand(brandName, brandLogoFile), 10000);

      setSuccess('Brand logo added successfully!');
      setShowAddBrandModal(false);
      resetBrandForm();
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to add brand.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!window.confirm(`Are you sure you want to delete brand logo for "${brand.name}"?`)) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await withTimeout(portfolioService.deleteBrand(brand.id, brand.logo), 8000);

      setSuccess('Brand deleted successfully!');
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkContacted = async (id: string) => {
    try {
      setActionLoading(true);
      await withTimeout(updateDoc(doc(db, 'inquiries', id), { status: 'contacted' }), 8000);
      setSuccess('Inquiry marked as contacted.');
      await fetchInquiries();
    } catch (err: any) {
      setError(err.message || 'Failed to update inquiry status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      setActionLoading(true);
      await withTimeout(deleteDoc(doc(db, 'inquiries', id)), 8000);
      setSuccess('Inquiry deleted successfully.');
      await fetchInquiries();
    } catch (err: any) {
      setError(err.message || 'Failed to delete inquiry.');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute stats for overview
  const totalProjects = projects.length;
  const totalBrands = brands.length;
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  
  // Categorize projects for chart analytics
  const categoriesMap: { [key: string]: number } = {};
  projects.forEach(p => {
    if (p.category) {
      const cat = p.category.split('/')[0].split('&')[0].trim();
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    }
  });
  
  const categoriesList = Object.keys(categoriesMap).map(name => ({
    name,
    count: categoriesMap[name],
    percentage: totalProjects > 0 ? Math.round((categoriesMap[name] / totalProjects) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Search filtering
  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row relative">
      {/* Sidebar Section */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-ink/5 flex flex-col justify-between shrink-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 select-none">
            <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <p className="text-sm font-bold text-maroon uppercase tracking-wide leading-none">Ascend</p>
              <p className="text-[9px] uppercase tracking-widest text-ink/40 mt-0.5 leading-none">Media Labs</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={16} /> },
              { id: 'projects', name: 'Projects', icon: <Briefcase size={16} /> },
              { id: 'brands', name: 'Partner Brands', icon: <Sparkles size={16} /> },
              { id: 'inquiries', name: 'Leads / Inquiries', icon: <Mail size={16} />, badge: newInquiries > 0 ? newInquiries : undefined },
              { id: 'account', name: 'Account', icon: <User size={16} /> },
              { id: 'settings', name: 'Settings', icon: <Settings size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'account') {
                    if (user?.email !== 'ascendmedialabsinfo@gmail.com') {
                      alert('Access Denied. Only the primary administrator account (ascendmedialabsinfo@gmail.com) is eligible to view the Account section.');
                      return;
                    }
                    if (!isOtpVerified) {
                      handleTriggerOtp();
                    } else {
                      setActiveTab('account');
                    }
                  } else {
                    setActiveTab(tab.id as any);
                    setSearchTerm('');
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-maroon/5 text-maroon border-l-2 border-maroon' 
                    : 'text-ink/60 hover:text-maroon hover:bg-cream/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.name}</span>
                </div>
                {tab.badge && (
                  <span className="bg-maroon text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink/60 hover:text-maroon hover:bg-cream/40 rounded-sm mt-4 border-t border-dashed border-ink/10"
          >
            <Globe size={16} />
            <span>View Live Website</span>
          </a>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-t border-ink/5 bg-cream/20">
          <div className="flex items-center gap-3 mb-4 truncate">
            <div className="w-9 h-9 rounded-full bg-cream-dark border border-ink/10 flex items-center justify-center font-bold text-maroon text-sm shrink-0">
              {user?.email ? user.email[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-ink leading-none">Administrator</p>
              <p className="text-[10px] text-ink/40 mt-1 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-ink/10 text-ink/75 hover:bg-ink hover:text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-ink/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-ink/40">Portal</span>
            <span className="text-ink/20">/</span>
            <span className="text-xs uppercase tracking-widest font-bold text-maroon">{activeTab === 'brands' ? 'Partner Brands' : activeTab}</span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search Input */}
            {(activeTab === 'projects' || activeTab === 'inquiries' || activeTab === 'brands') && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'brands' ? 'brands' : activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-maroon transition-colors"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
              </div>
            )}
            
            {activeTab === 'projects' && (
              <button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-maroon text-white px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-maroon/5"
              >
                <Plus size={13} />
                <span>Add Project</span>
              </button>
            )}

            {activeTab === 'brands' && (
              <button 
                onClick={() => {
                  resetBrandForm();
                  setShowAddBrandModal(true);
                }}
                className="bg-maroon text-white px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-maroon/5"
              >
                <Plus size={13} />
                <span>Add Brand logo</span>
              </button>
            )}
          </div>
        </header>

        {/* Workspace Content Area */}
        <div className="grow overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-700 text-xs p-4 rounded-sm mb-6"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-700 text-xs p-4 rounded-sm mb-6"
                >
                  <CheckCircle size={15} className="shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-ink/40">
              <RefreshCw size={28} className="animate-spin text-maroon" />
              <p className="text-xs uppercase tracking-widest font-bold">Synchronizing Datastore...</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Portfolio Projects', value: totalProjects, sub: 'Syncing with Firestore', color: 'text-maroon', icon: <Briefcase size={16} /> },
                      { label: 'Inquiries Received', value: totalInquiries, sub: 'Customer leads captured', color: 'text-ink', icon: <MessageSquare size={16} /> },
                      { label: 'Unread Lead Inquiries', value: newInquiries, sub: 'Awaiting administrator outreach', color: 'text-amber-600', icon: <Mail size={16} /> },
                      { label: 'Trusted Brands Listed', value: totalBrands, sub: 'Partner brand logos configured', color: 'text-emerald-700', icon: <Sparkles size={16} /> }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-sm border border-ink/5 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start text-ink/30 mb-2">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40">{stat.label}</span>
                          {stat.icon}
                        </div>
                        <div>
                          <p className={`text-2xl md:text-3xl font-serif font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-[10px] text-ink/40 mt-1 leading-tight">{stat.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Project Category Distribution chart */}
                    <div className="bg-white border border-ink/5 p-6 rounded-sm shadow-sm lg:col-span-7">
                      <div className="flex items-center gap-2 mb-6 text-maroon">
                        <BarChart2 size={16} />
                        <h3 className="text-sm uppercase tracking-widest font-bold text-ink">Project Category Distribution</h3>
                      </div>
                      
                      {categoriesList.length === 0 ? (
                        <div className="py-12 text-center text-xs text-ink/40 font-medium uppercase tracking-wider">
                          No category metrics available.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-5">
                          {categoriesList.map((cat, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-ink/80">
                                <span>{cat.name}</span>
                                <span className="text-maroon">{cat.count} ({cat.percentage}%)</span>
                              </div>
                              <div className="w-full bg-cream-dark/40 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cat.percentage}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full bg-maroon"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick view inquiries */}
                    <div className="bg-white border border-ink/5 p-6 rounded-sm shadow-sm lg:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-6 text-maroon">
                          <Mail size={16} />
                          <h3 className="text-sm uppercase tracking-widest font-bold text-ink">Recent Lead Inquiries</h3>
                        </div>
                        
                        {inquiries.length === 0 ? (
                          <div className="py-12 text-center text-xs text-ink/40 font-medium uppercase tracking-wider">
                            No inquiries received yet.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {inquiries.slice(0, 3).map((inq) => (
                              <div 
                                key={inq.id} 
                                onClick={() => setActiveTab('inquiries')}
                                className="p-3 border border-ink/5 hover:border-maroon/20 hover:bg-cream/10 rounded-sm cursor-pointer transition-all flex items-start justify-between gap-3"
                              >
                                <div className="truncate">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-ink leading-none">{inq.name}</h4>
                                    {inq.status === 'new' && (
                                      <span className="w-1.5 h-1.5 bg-maroon rounded-full shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-ink/50 mt-1 truncate">{inq.message}</p>
                                </div>
                                <span className="text-[9px] text-ink/35 shrink-0">
                                  {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {inquiries.length > 3 && (
                        <button 
                          onClick={() => setActiveTab('inquiries')}
                          className="w-full text-center text-[10px] uppercase tracking-wider font-bold text-maroon hover:underline mt-4 cursor-pointer pt-3 border-t border-ink/5"
                        >
                          View All {totalInquiries} Inquiries
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Directory Links Row */}
                  <div className="bg-white border border-ink/5 p-6 rounded-sm shadow-sm lg:col-span-12">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 text-maroon">
                        <Globe size={16} />
                        <h3 className="text-sm uppercase tracking-widest font-bold text-ink">Project Directory Links</h3>
                      </div>
                      <button onClick={() => setActiveTab('projects')} className="text-[10px] uppercase tracking-wider font-bold text-maroon hover:underline">Manage Projects</button>
                    </div>
                    {projects.length === 0 ? (
                      <div className="py-6 text-center text-xs text-ink/40 font-medium uppercase tracking-wider">No active project links in datastore.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {projects.map((project) => (
                          <a 
                            key={project.id}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border border-ink/5 hover:border-maroon/20 hover:bg-cream/10 rounded-sm flex items-center justify-between gap-3 group transition-all"
                          >
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-ink group-hover:text-maroon transition-colors truncate">{project.title}</h4>
                              <p className="text-[9px] uppercase tracking-wider font-semibold text-ink/45 mt-0.5 truncate">{project.category}</p>
                            </div>
                            <Globe size={12} className="text-ink/30 group-hover:text-maroon transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PROJECTS */}
              {activeTab === 'projects' && (
                <div>
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 border border-dashed border-ink/10 rounded-sm p-10 flex flex-col items-center justify-center gap-4">
                      <ImageIcon size={40} className="text-ink/20" />
                      <h3 className="text-base font-serif">No matching projects</h3>
                      <p className="text-xs text-ink/50">
                        Adjust your search query or click Add Project to upload a new asset.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-white border border-ink/5 rounded-sm shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-[16/10] overflow-hidden relative bg-cream-dark/30">
                            <img 
                              src={project.image} 
                              alt={project.title} 
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                onClick={() => openEditModal(project)}
                                className="bg-white text-ink p-2.5 rounded-full hover:bg-maroon hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-ink p-2.5 rounded-full hover:bg-maroon hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                title="Visit Live Site"
                              >
                                <Globe size={14} />
                              </a>
                              <button
                                onClick={() => handleDeleteProject(project)}
                                className="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-maroon">{project.category}</span>
                              <h3 className="text-base font-serif mt-0.5 text-ink leading-tight">{project.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-ink/40 mt-3 border-t border-ink/5 pt-2 truncate">
                              <Globe size={11} className="shrink-0" />
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-maroon truncate"
                              >
                                {project.url}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PARTNER BRANDS */}
              {activeTab === 'brands' && (
                <div>
                  {filteredBrands.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 border border-dashed border-ink/10 rounded-sm p-10 flex flex-col items-center justify-center gap-4">
                      <Sparkles size={40} className="text-ink/20" />
                      <h3 className="text-base font-serif">No matching brands</h3>
                      <p className="text-xs text-ink/50">
                        Adjust your search query or click Add Brand to upload a logo.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {filteredBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="bg-white border border-ink/5 rounded-sm p-4 shadow-sm flex flex-col items-center justify-between gap-4 group relative hover:shadow-md transition-shadow"
                        >
                          <div className="h-16 w-full flex items-center justify-center bg-cream-dark/10 p-2 rounded-sm overflow-hidden">
                            <img 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          <div className="text-center w-full">
                            <p className="text-xs font-bold text-ink/80 truncate">{brand.name}</p>
                          </div>

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteBrand(brand)}
                              className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors cursor-pointer shadow-sm"
                              title="Delete Brand Logo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LEADS / INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div>
                  {filteredInquiries.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 border border-dashed border-ink/10 rounded-sm p-10 flex flex-col items-center justify-center gap-4">
                      <Mail size={40} className="text-ink/20" />
                      <h3 className="text-base font-serif">No inquiries found</h3>
                      <p className="text-xs text-ink/50">
                        We couldn't find any contact form submissions matching your query.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredInquiries.map((inq) => (
                        <div 
                          key={inq.id}
                          className={`bg-white border rounded-sm p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                            inq.status === 'new' ? 'border-l-4 border-l-maroon border-ink/5' : 'border-ink/5'
                          }`}
                        >
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-base font-serif font-bold text-ink leading-none">{inq.name}</h3>
                              {inq.status === 'new' ? (
                                <span className="bg-maroon/10 text-maroon text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Unread</span>
                              ) : (
                                <span className="bg-ink/5 text-ink/50 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Contacted</span>
                              )}
                              <span className="text-[10px] text-ink/35 flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(inq.createdAt).toLocaleString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-ink/80 bg-cream/20 border border-ink/5 p-3 rounded-sm leading-relaxed mb-3">
                              "{inq.message}"
                            </p>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-ink/65 font-medium">
                              <div>Email: <a href={`mailto:${inq.email}`} className="text-maroon hover:underline font-semibold">{inq.email}</a></div>
                              <div>Phone: <a href={`tel:${inq.phone}`} className="text-maroon hover:underline font-semibold">{inq.phone}</a></div>
                            </div>
                          </div>

                          <div className="flex md:flex-col justify-end gap-2 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-ink/5">
                            {inq.status === 'new' && (
                              <button
                                onClick={() => handleMarkContacted(inq.id)}
                                className="w-full md:w-auto bg-maroon/5 hover:bg-maroon hover:text-white border border-maroon/15 text-maroon px-4 py-2 rounded-sm text-[10px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                title="Mark as Contacted"
                              >
                                <Check size={12} />
                                <span>Outreached</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="w-full md:w-auto bg-red-500/5 hover:bg-red-600 hover:text-white border border-red-500/10 text-red-600 px-4 py-2 rounded-sm text-[10px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-white border border-ink/5 p-8 rounded-sm shadow-sm max-w-2xl">
                  <div className="flex items-center gap-2 mb-6 text-maroon border-b border-ink/5 pb-4">
                    <Settings size={18} />
                    <h3 className="text-base font-serif">Agency Configuration Settings</h3>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Agency Name</label>
                        <input type="text" defaultValue="Ascend Media Labs" disabled className="bg-cream/40 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/65 cursor-not-allowed" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Official Phone</label>
                        <input type="text" defaultValue="+91 7675852618" disabled className="bg-cream/40 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/65 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Official Email</label>
                      <input type="text" defaultValue="reachus@ascendmedialabs.in" disabled className="bg-cream/40 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/65 cursor-not-allowed" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Studio Address</label>
                      <input type="text" defaultValue="Sagar Nagar, Rushikonda, Vizag" disabled className="bg-cream/40 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/65 cursor-not-allowed" />
                    </div>
                    
                    <div className="bg-maroon/5 border border-maroon/10 p-4 rounded-sm text-xs text-maroon leading-relaxed flex gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>These configurations are pulled dynamically across the site. Direct edits to these global variables are disabled in this build.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CONFIDENTIAL ACCOUNT DETAILS */}
              {activeTab === 'account' && (
                <div className="bg-white border border-ink/5 p-8 rounded-sm shadow-sm max-w-2xl">
                  <div className="flex items-center gap-2 mb-6 text-maroon border-b border-ink/5 pb-4">
                    <User size={18} />
                    <h3 className="text-base font-serif">Confidential Account Settings</h3>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 bg-cream/40 p-4 rounded-sm border border-ink/5">
                      <div className="h-14 w-14 rounded-full bg-maroon text-white flex items-center justify-center font-serif text-xl font-bold uppercase shadow-sm">
                        {user?.email?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink/80">Administrator</h4>
                        <p className="text-xs text-ink/55">{user?.email || 'admin@ascendmedialabs.com'}</p>
                        <span className="inline-block mt-1 bg-green-500/10 text-green-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          OTP Verified Session
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2">Firebase Authentication Security</h4>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Admin User ID</label>
                        <input type="text" value={user?.uid || 'Unknown'} readOnly className="bg-cream/20 border border-ink/5 rounded-sm py-2 px-3 text-xs text-ink/50 font-mono select-all focus:outline-none" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50">Last Login Time</label>
                        <input type="text" value={user?.metadata?.lastSignInTime || 'N/A'} readOnly className="bg-cream/20 border border-ink/5 rounded-sm py-2 px-3 text-xs text-ink/50 select-all focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2">Actions</h4>
                      <div className="flex gap-4">
                        <button
                          onClick={async () => {
                            if (window.confirm("Would you like to request a password reset email?")) {
                              try {
                                const { sendPasswordResetEmail } = await import('firebase/auth');
                                await sendPasswordResetEmail(auth, user.email);
                                alert(`Password reset email sent to ${user.email}!`);
                              } catch (migErr: any) {
                                alert(`Error: ${migErr.message}`);
                              }
                            }
                          }}
                          className="bg-maroon text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-maroon/90 transition-colors cursor-pointer"
                        >
                          Reset Password
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsOtpVerified(false);
                            setActiveTab('overview');
                          }}
                          className="bg-ink/5 text-ink/70 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-ink/10 transition-colors cursor-pointer border border-ink/10"
                        >
                          Lock Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>
      </main>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowAddModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif">Add New Project</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Inizio Interiors"
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Luxury Interior Design"
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Website URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Project Screenshot</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-ink/20 rounded-sm p-5 text-center bg-cream/20 hover:bg-cream/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {imagePreview ? (
                      <div className="aspect-[16/10] w-full max-h-32 overflow-hidden rounded-sm relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-ink/10 hover:bg-ink/40 transition-colors flex items-center justify-center">
                          <Upload size={20} className="text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-ink/30" />
                        <span className="text-xs text-ink/60">Click to upload screenshot image</span>
                        <span className="text-[9px] text-ink/40">PNG, JPG, JPEG under 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={actionLoading}
                    className="border border-ink/10 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-maroon text-white px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Save Project</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowEditModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif">Edit Project</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditProject} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Website URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Replace Screenshot (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-ink/20 rounded-sm p-5 text-center bg-cream/20 hover:bg-cream/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {imagePreview ? (
                      <div className="aspect-[16/10] w-full max-h-32 overflow-hidden rounded-sm relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-ink/10 hover:bg-ink/40 transition-colors flex items-center justify-center">
                          <Upload size={20} className="text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-ink/30" />
                        <span className="text-xs text-ink/60">Click to replace screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={actionLoading}
                    className="border border-ink/10 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-maroon text-white px-6 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Project</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Brand Modal */}
      <AnimatePresence>
        {showAddBrandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowAddBrandModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif">Add Partner Brand</h3>
                <button 
                  onClick={() => setShowAddBrandModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBrand} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="E.g., goMunchz"
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70">Brand Logo</label>
                  <div 
                    onClick={() => brandFileInputRef.current?.click()}
                    className="border border-dashed border-ink/20 rounded-sm p-4 text-center bg-cream/20 hover:bg-cream/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {brandLogoPreview ? (
                      <div className="h-16 w-full flex items-center justify-center rounded-sm relative overflow-hidden bg-cream-dark/10">
                        <img 
                          src={brandLogoPreview} 
                          alt="Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-ink/10 hover:bg-ink/40 transition-colors flex items-center justify-center">
                          <Upload size={16} className="text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-ink/30" />
                        <span className="text-[11px] text-ink/60">Click to upload brand logo</span>
                        <span className="text-[8px] text-ink/40">PNG, JPG under 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={brandFileInputRef}
                      onChange={handleBrandLogoChange}
                      accept="image/*"
                      className="hidden"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(false)}
                    disabled={actionLoading}
                    className="border border-ink/10 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-maroon text-white px-5 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Save Brand</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOtpModal(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5 text-center flex flex-col items-center"
            >
              <div className="flex justify-center mb-4 text-maroon">
                <Lock size={36} className="p-2.5 bg-maroon/5 rounded-full" />
              </div>
              
              <h3 className="text-lg font-serif mb-2">Confidential Verification</h3>
              <p className="text-xs text-ink/60 mb-6 leading-relaxed max-w-[280px]">
                To view your confidential account settings, please enter the 6-digit One-Time Password (OTP) sent to <strong className="text-ink/80">ascendmedialabsinfo@gmail.com</strong>.
              </p>

              {sendingOtp && (
                <div className="flex items-center justify-center gap-2 text-xs text-ink/50 mb-4 bg-cream/30 border border-ink/5 p-3 rounded-sm w-full">
                  <RefreshCw size={12} className="animate-spin text-maroon" />
                  <span>Sending secure OTP email...</span>
                </div>
              )}

              {otpSentMessage && !sendingOtp && (
                <div className={`w-full text-xs p-3 rounded-sm mb-4 text-center font-medium leading-relaxed ${
                  otpSentMessage.includes('sent') 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-700' 
                    : 'bg-maroon/5 border border-maroon/10 text-maroon'
                }`}>
                  {otpSentMessage}
                </div>
              )}

              {otpError && (
                <div className="w-full bg-red-500/10 border border-red-500/20 text-red-700 text-xs p-3 rounded-sm mb-4">
                  {otpError}
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userOtpInput === generatedOtp) {
                    setIsOtpVerified(true);
                    setShowOtpModal(false);
                    setActiveTab('account');
                  } else {
                    setOtpError('Invalid OTP. Please try again.');
                  }
                }} 
                className="w-full flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/50 text-center mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={userOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUserOtpInput(val);
                      setOtpError('');
                    }}
                    placeholder="E.g., 123456"
                    className="w-full bg-cream/40 border border-ink/10 rounded-sm py-3 px-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-maroon transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div className="w-full bg-maroon/5 border border-maroon/10 p-3 rounded-sm text-[10px] text-maroon text-left font-semibold leading-normal mb-2">
                  🔐 Developer DevTip:<br />
                  For testing verification, your secure OTP is: <span className="font-mono text-xs underline select-all">{generatedOtp}</span>
                </div>

                <div className="flex gap-3 justify-end mt-2 w-full">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="w-1/2 border border-ink/10 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-cream transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-maroon text-white py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-maroon/90 transition-colors cursor-pointer"
                  >
                    Verify & Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
