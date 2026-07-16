import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { portfolioService, ClientProjectFinancial, PaymentInstallment, Expense } from '../services/portfolioService';
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
  Lock,
  Eye,
  Download
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

  // Bookkeeping and Ledger states
  const [clientProjects, setClientProjects] = useState<ClientProjectFinancial[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accountSubTab, setAccountSubTab] = useState<'ledger' | 'expenses' | 'invoice' | 'security'>('ledger');
  
  // Ledger operations
  const [selectedProject, setSelectedProject] = useState<ClientProjectFinancial | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProjectFinancial | null>(null);
  const [showViewLedgerModal, setShowViewLedgerModal] = useState(false);
  const [viewingLedger, setViewingLedger] = useState<ClientProjectFinancial | null>(null);
  
  // Excel form states
  const [ledgerDate, setLedgerDate] = useState(new Date().toISOString().split('T')[0]);
  const [ledgerClientName, setLedgerClientName] = useState('');
  const [ledgerServerAmount, setLedgerServerAmount] = useState('');
  const [ledgerRenewalDate, setLedgerRenewalDate] = useState('');
  const [ledgerInstallments, setLedgerInstallments] = useState<{ amount: string; date: string }[]>([]);
  const [ledgerClientNumber, setLedgerClientNumber] = useState('');
  const [ledgerBusinessCategory, setLedgerBusinessCategory] = useState('');
  const [ledgerRequirement, setLedgerRequirement] = useState('Website');
  const [ledgerAgreedAmount, setLedgerAgreedAmount] = useState('');
  const [ledgerAdvanceReceived, setLedgerAdvanceReceived] = useState('');
  const [ledgerAdvanceReceivedDate, setLedgerAdvanceReceivedDate] = useState('');
  const [ledgerExpectedClosureDate, setLedgerExpectedClosureDate] = useState('');
  const [ledgerProjectClosed, setLedgerProjectClosed] = useState<'Yes' | 'No'>('No');
  const [ledgerBalancePaymentReceived, setLedgerBalancePaymentReceived] = useState('');
  const [ledgerDomainAmount, setLedgerDomainAmount] = useState('');
  const [ledgerDomainName, setLedgerDomainName] = useState('');
  const [ledgerClientSatisfied, setLedgerClientSatisfied] = useState<'Yes' | 'No'>('Yes');
  const [ledgerReviewPosted, setLedgerReviewPosted] = useState<'Yes' | 'No'>('No');
  const [ledgerUpsellingPossibility, setLedgerUpsellingPossibility] = useState('');
  const [ledgerNextFollowUpDate, setLedgerNextFollowUpDate] = useState('');
  const [ledgerPaymentMode, setLedgerPaymentMode] = useState<'cheque' | 'cash' | 'UPI'>('UPI');

  // Expenses operations
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNote, setExpenseNote] = useState('');

  // Invoice generator state
  const [invoiceClientName, setInvoiceClientName] = useState('');
  const [invoiceClientAddress, setInvoiceClientAddress] = useState('');
  const [invoiceClientEmail, setInvoiceClientEmail] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`AML-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceItems, setInvoiceItems] = useState<{ id: string; description: string; quantity: number; rate: number }[]>([]);

  // Invoice payment remittance states
  const [invoicePaymentType, setInvoicePaymentType] = useState<'bank' | 'upi'>('bank');
  const [invoiceBankName, setInvoiceBankName] = useState('HDFC Bank Limited');
  const [invoiceAccountName, setInvoiceAccountName] = useState('Ascend Media Labs');
  const [invoiceAccountNumber, setInvoiceAccountNumber] = useState('50200067981245');
  const [invoiceIfscCode, setInvoiceIfscCode] = useState('HDFC0000456');
  const [invoiceUpiId, setInvoiceUpiId] = useState('reachus@ascendmedialabs.in');
  const [invoiceUpiName, setInvoiceUpiName] = useState('Ascend Media Labs');
  
  // New line item form
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemRate, setItemRate] = useState('');

  // Bookkeeping Filters
  const [ledgerStartDateFilter, setLedgerStartDateFilter] = useState('');
  const [ledgerEndDateFilter, setLedgerEndDateFilter] = useState('');
  const [expenseStartDateFilter, setExpenseStartDateFilter] = useState('');
  const [expenseEndDateFilter, setExpenseEndDateFilter] = useState('');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'brands' | 'inquiries' | 'settings' | 'account'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculatedBalanceDue = (Number(ledgerAgreedAmount) || 0) - (Number(ledgerAdvanceReceived) || 0) - ledgerInstallments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
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

      // Fetch bookkeeping datasets
      try {
        const clientProjList = await portfolioService.getClientProjects();
        const expList = await portfolioService.getExpenses();
        setClientProjects(clientProjList);
        setExpenses(expList);
      } catch (bkErr) {
        console.warn('Error fetching bookkeeping data:', bkErr);
      }
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

  // Client Project Ledger and Bookkeeping Operations
  const handleAddClientProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerClientName || !ledgerAgreedAmount) {
      alert('Please enter Client Name and Agreed Amount.');
      return;
    }
    setActionLoading(true);
    try {
      const agreed = Number(ledgerAgreedAmount) || 0;
      const adv = Number(ledgerAdvanceReceived) || 0;
      const domain = Number(ledgerDomainAmount) || 0;
      const server = Number(ledgerServerAmount) || 0;
      
      const parsedInstallments = ledgerInstallments.map(inst => ({
        amount: Number(inst.amount) || 0,
        date: inst.date || new Date().toISOString().split('T')[0]
      }));

      const totalInstallmentsReceived = parsedInstallments.reduce((sum, inst) => sum + inst.amount, 0);
      const balDue = agreed - adv - totalInstallmentsReceived;

      const newProj = await portfolioService.addClientProject({
        date: ledgerDate,
        clientName: ledgerClientName,
        clientNumber: ledgerClientNumber,
        businessCategory: ledgerBusinessCategory,
        requirement: ledgerRequirement,
        agreedAmount: agreed,
        advanceReceived: adv,
        advanceReceivedDate: ledgerAdvanceReceivedDate,
        expectedClosureDate: ledgerExpectedClosureDate,
        projectClosed: ledgerProjectClosed,
        balancePaymentReceived: totalInstallmentsReceived,
        installments: parsedInstallments,
        domainAmount: domain,
        domainName: ledgerDomainName,
        serverAmount: server,
        renewalDate: ledgerRenewalDate,
        balanceToBeReceived: balDue,
        clientSatisfied: ledgerClientSatisfied,
        reviewPosted: ledgerReviewPosted,
        upsellingPossibility: ledgerUpsellingPossibility,
        nextFollowUpDate: ledgerNextFollowUpDate,
        paymentMode: ledgerPaymentMode
      });

      setClientProjects([newProj, ...clientProjects]);
      setShowAddProjectModal(false);
      resetLedgerForm();
      setSuccess('Client project added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Error adding project: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateClientProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setActionLoading(true);
    try {
      const agreed = Number(ledgerAgreedAmount) || 0;
      const adv = Number(ledgerAdvanceReceived) || 0;
      const domain = Number(ledgerDomainAmount) || 0;
      const server = Number(ledgerServerAmount) || 0;
      
      const parsedInstallments = ledgerInstallments.map(inst => ({
        amount: Number(inst.amount) || 0,
        date: inst.date || new Date().toISOString().split('T')[0]
      }));

      const totalInstallmentsReceived = parsedInstallments.reduce((sum, inst) => sum + inst.amount, 0);
      const balDue = agreed - adv - totalInstallmentsReceived;

      const updateData: Partial<ClientProjectFinancial> = {
        date: ledgerDate,
        clientName: ledgerClientName,
        clientNumber: ledgerClientNumber,
        businessCategory: ledgerBusinessCategory,
        requirement: ledgerRequirement,
        agreedAmount: agreed,
        advanceReceived: adv,
        advanceReceivedDate: ledgerAdvanceReceivedDate,
        expectedClosureDate: ledgerExpectedClosureDate,
        projectClosed: ledgerProjectClosed,
        balancePaymentReceived: totalInstallmentsReceived,
        installments: parsedInstallments,
        domainAmount: domain,
        domainName: ledgerDomainName,
        serverAmount: server,
        renewalDate: ledgerRenewalDate,
        balanceToBeReceived: balDue,
        clientSatisfied: ledgerClientSatisfied,
        reviewPosted: ledgerReviewPosted,
        upsellingPossibility: ledgerUpsellingPossibility,
        nextFollowUpDate: ledgerNextFollowUpDate,
        paymentMode: ledgerPaymentMode
      };

      await portfolioService.updateClientProject(editingProject.id!, updateData);

      const updatedList = clientProjects.map(p => {
        if (p.id === editingProject.id) {
          return { ...p, ...updateData };
        }
        return p;
      });
      setClientProjects(updatedList);
      setShowEditProjectModal(false);
      setEditingProject(null);
      resetLedgerForm();
      setSuccess('Client project updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Error updating project: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addInstallmentField = () => {
    setLedgerInstallments([...ledgerInstallments, { amount: '', date: new Date().toISOString().split('T')[0] }]);
  };

  const updateInstallmentField = (index: number, key: 'amount' | 'date', value: string) => {
    const updated = ledgerInstallments.map((inst, i) => {
      if (i === index) {
        return { ...inst, [key]: value };
      }
      return inst;
    });
    setLedgerInstallments(updated);
  };

  const removeInstallmentField = (index: number) => {
    setLedgerInstallments(ledgerInstallments.filter((_, i) => i !== index));
  };

  const resetLedgerForm = () => {
    setLedgerDate(new Date().toISOString().split('T')[0]);
    setLedgerClientName('');
    setLedgerServerAmount('');
    setLedgerRenewalDate('');
    setLedgerInstallments([]);
    setLedgerClientNumber('');
    setLedgerBusinessCategory('');
    setLedgerRequirement('Website');
    setLedgerAgreedAmount('');
    setLedgerAdvanceReceived('');
    setLedgerAdvanceReceivedDate('');
    setLedgerExpectedClosureDate('');
    setLedgerProjectClosed('No');
    setLedgerBalancePaymentReceived('');
    setLedgerDomainAmount('');
    setLedgerDomainName('');
    setLedgerClientSatisfied('Yes');
    setLedgerReviewPosted('No');
    setLedgerUpsellingPossibility('');
    setLedgerNextFollowUpDate('');
    setLedgerPaymentMode('UPI');
  };

  const populateLedgerForm = (proj: ClientProjectFinancial) => {
    setLedgerDate(proj.date || '');
    setLedgerClientName(proj.clientName || '');
    setLedgerServerAmount(String(proj.serverAmount || ''));
    setLedgerRenewalDate(proj.renewalDate || '');
    if ((!proj.installments || proj.installments.length === 0) && proj.balancePaymentReceived && proj.balancePaymentReceived > 0) {
      setLedgerInstallments([{
        amount: String(proj.balancePaymentReceived),
        date: proj.date || new Date().toISOString().split('T')[0]
      }]);
    } else {
      setLedgerInstallments(
        (proj.installments || []).map(inst => ({
          amount: String(inst.amount || ''),
          date: inst.date || ''
        }))
      );
    }
    setLedgerClientNumber(proj.clientNumber || '');
    setLedgerBusinessCategory(proj.businessCategory || '');
    setLedgerRequirement(proj.requirement || 'Website');
    setLedgerAgreedAmount(String(proj.agreedAmount || ''));
    setLedgerAdvanceReceived(String(proj.advanceReceived || ''));
    setLedgerAdvanceReceivedDate(proj.advanceReceivedDate || '');
    setLedgerExpectedClosureDate(proj.expectedClosureDate || '');
    setLedgerProjectClosed(proj.projectClosed || 'No');
    setLedgerBalancePaymentReceived(String(proj.balancePaymentReceived || ''));
    setLedgerDomainAmount(String(proj.domainAmount || ''));
    setLedgerDomainName(proj.domainName || '');
    setLedgerClientSatisfied(proj.clientSatisfied || 'Yes');
    setLedgerReviewPosted(proj.reviewPosted || 'No');
    setLedgerUpsellingPossibility(proj.upsellingPossibility || '');
    setLedgerNextFollowUpDate(proj.nextFollowUpDate || '');
    setLedgerPaymentMode(proj.paymentMode || 'UPI');
  };

  const downloadCSV = (data: any[], filename: string, headersMap: { [key: string]: string }) => {
    const csvRows: string[] = [];
    
    // 1. Get header row
    const keys = Object.keys(headersMap);
    const headerRow = keys.map(key => `"${headersMap[key].replace(/"/g, '""')}"`).join(',');
    csvRows.push(headerRow);
    
    // 2. Add data rows
    data.forEach(item => {
      const row = keys.map(key => {
        let val = item[key];
        if (val === undefined || val === null) {
          val = '';
        } else if (Array.isArray(val)) {
          // Format installments array as string: eg. "₹1000 (2026-07-16), ₹2000 (2026-07-20)"
          val = val.map(inst => `₹${inst.amount} (${inst.date})`).join('; ');
        } else {
          val = String(val);
        }
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    // 3. Create blob & download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const projectHeaders = {
    date: 'Date Logged',
    clientName: 'Client Name',
    clientNumber: 'Client Number',
    businessCategory: 'Business Category',
    requirement: 'Project Requirement',
    agreedAmount: 'Agreed Amount (INR)',
    advanceReceived: 'Advance Received (INR)',
    advanceReceivedDate: 'Advance Received Date',
    balancePaymentReceived: 'Subsequent Installments Paid (INR)',
    installments: 'Subsequent Installments List',
    domainName: 'Domain Name',
    domainAmount: 'Domain Amount (INR)',
    serverAmount: 'Server Amount (INR)',
    renewalDate: 'Renewal Date',
    balanceToBeReceived: 'Balance Due (INR)',
    projectClosed: 'Project Closed',
    clientSatisfied: 'Client Satisfied',
    reviewPosted: 'Review Posted',
    expectedClosureDate: 'Expected Closure Date',
    nextFollowUpDate: 'Next Follow-Up Date',
    paymentMode: 'Payment Mode'
  };

  const expenseHeaders = {
    date: 'Date Logged',
    description: 'Expense Description',
    note: 'Category / Note',
    amount: 'Amount Paid (INR)'
  };

  const handleDeleteClientProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project ledger?')) return;
    setActionLoading(true);
    try {
      await portfolioService.deleteClientProject(id);
      setClientProjects(clientProjects.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      setSuccess('Project ledger deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Error deleting ledger: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription || !expenseAmount) return;
    setActionLoading(true);
    try {
      const amount = Number(expenseAmount);
      const newExp = await portfolioService.addExpense({
        description: expenseDescription,
        amount,
        date: expenseDate || new Date().toISOString().split('T')[0],
        note: expenseNote
      });

      setExpenses([newExp, ...expenses]);
      setShowAddExpenseModal(false);
      setExpenseDescription('');
      setExpenseAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setExpenseNote('');
      setSuccess('Expense added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Error adding expense: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setActionLoading(true);
    try {
      await portfolioService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
      setSuccess('Expense deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Error deleting expense: ' + err.message);
    } finally {
      setActionLoading(false);
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
    <div className="h-screen w-screen overflow-hidden bg-cream flex flex-col md:flex-row relative">
      {/* Sidebar Section */}
      <aside className="w-full md:w-64 h-auto md:h-full bg-white border-b md:border-b-0 md:border-r border-ink/5 flex flex-col justify-between shrink-0 z-20 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 select-none group">
            <div className="w-9 h-9 rounded-sm bg-maroon flex items-center justify-center text-white font-serif font-bold text-lg tracking-tighter shrink-0 transition-transform group-hover:scale-105 border border-maroon">
              A
            </div>
            <div>
              <p className="text-xs font-serif font-bold text-maroon uppercase tracking-wider leading-none">Ascend</p>
              <p className="text-[8px] uppercase tracking-widest text-ink/40 mt-1 leading-none font-semibold">Media Labs</p>
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
            href={window.location.hostname === 'localhost' ? '/' : 'https://ascendmedialabs.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink/60 hover:text-maroon hover:bg-cream/40 rounded-sm mt-4 border-t border-dashed border-ink/10"
          >
            <Globe size={16} />
            <span>View Live Website</span>
          </a>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-t border-ink/5 bg-cream/10 flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-full bg-maroon/10 border border-maroon/20 flex items-center justify-center font-bold text-maroon text-xs shrink-0">
            {user?.email ? user.email[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink/80 leading-none">Administrator</p>
            <p className="text-[9px] text-ink/40 mt-1.5 truncate font-mono">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-ink/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-ink/40">Portal</span>
            <span className="text-ink/20">/</span>
            <span className="text-xs uppercase tracking-widest font-bold text-maroon">{activeTab === 'brands' ? 'Partner Brands' : activeTab}</span>
          </div>

          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
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

            {/* Separator and Admin Info / Logout button */}
            <div className="flex items-center gap-3 border-l border-ink/10 pl-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-maroon/10 border border-maroon/20 flex items-center justify-center font-bold text-maroon text-xs shrink-0" title={user?.email || 'Admin'}>
                  {user?.email ? user.email[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden lg:block text-left shrink-0">
                  <p className="text-[10px] font-bold text-ink/80 leading-none">Admin</p>
                  <p className="text-[8px] text-ink/40 font-mono mt-0.5">{user?.email ? user.email.split('@')[0] : 'ascend'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 border border-maroon/25 hover:border-maroon text-maroon hover:bg-maroon/5 py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs ml-1"
                title="Sign Out of Portal"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
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
                  {/* Domain & Server Renewal Reminders (Upcoming in 30 Days) */}
                  {(() => {
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    const today = new Date();
                    today.setHours(0,0,0,0);

                    // Find upcoming renewals
                    const upcomingRenewals = clientProjects.filter(p => {
                      if (!p.renewalDate) return false;
                      const renDate = new Date(p.renewalDate);
                      return renDate >= today && renDate <= thirtyDaysFromNow;
                    });

                    if (upcomingRenewals.length === 0) return null;

                    return (
                      <div className="bg-amber-50 border border-amber-200/50 p-5 rounded-sm animate-fade-in flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertCircle size={16} className="shrink-0" />
                          <h4 className="text-xs uppercase tracking-widest font-bold">Upcoming Renewals (Next 30 Days)</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {upcomingRenewals.map((proj) => {
                            const diffTime = new Date(proj.renewalDate).getTime() - today.getTime();
                            const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                            return (
                              <div key={proj.id} className="bg-white p-3 border border-amber-100 rounded-sm shadow-xs flex justify-between items-center hover:shadow-sm transition-shadow">
                                <div className="truncate pr-2">
                                  <h5 className="text-xs font-bold text-ink/80 truncate" title={proj.domainName}>{proj.domainName || 'No Domain Name'}</h5>
                                  <p className="text-[9px] text-ink/50 mt-0.5 truncate">{proj.clientName}</p>
                                  <p className="text-[10px] text-ink/75 font-semibold mt-1">Cost: ₹{proj.serverAmount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[9px] font-bold text-amber-800 font-mono bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                    {daysRemaining === 0 ? 'Today' : `in ${daysRemaining} days`}
                                  </span>
                                  <p className="text-[9px] text-ink/40 font-mono mt-1.5">{proj.renewalDate}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

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
                      <input type="text" defaultValue="Visakhapatnam" disabled className="bg-cream/40 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/65 cursor-not-allowed" />
                    </div>
                    
                    <div className="bg-maroon/5 border border-maroon/10 p-4 rounded-sm text-xs text-maroon leading-relaxed flex gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>These configurations are pulled dynamically across the site. Direct edits to these global variables are disabled in this build.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CONFIDENTIAL ACCOUNT DETAILS */}
              {activeTab === 'account' && (() => {
                // Calculations for ledger (respecting date filters)
                const totalReceivables = clientProjects.reduce((sum, p) => {
                  if (ledgerStartDateFilter && p.date < ledgerStartDateFilter) return sum;
                  if (ledgerEndDateFilter && p.date > ledgerEndDateFilter) return sum;
                  return sum + p.agreedAmount;
                }, 0);

                const totalCollected = clientProjects.reduce((sum, p) => {
                  if (ledgerStartDateFilter && p.date < ledgerStartDateFilter) return sum;
                  if (ledgerEndDateFilter && p.date > ledgerEndDateFilter) return sum;
                  return sum + p.advanceReceived + p.balancePaymentReceived;
                }, 0);

                const totalBalanceDue = totalReceivables - totalCollected;

                const todayStr = new Date().toISOString().split('T')[0];
                const filteredLedgerIncome = clientProjects.reduce((sum, p) => {
                  let match = true;
                  if (ledgerStartDateFilter && p.date < ledgerStartDateFilter) match = false;
                  if (ledgerEndDateFilter && p.date > ledgerEndDateFilter) match = false;
                  if (!ledgerStartDateFilter && !ledgerEndDateFilter && p.date !== todayStr) match = false;
                  
                  if (match) {
                    return sum + p.advanceReceived + p.balancePaymentReceived;
                  }
                  return sum;
                }, 0);

                const filteredLedgerProjects = clientProjects.filter(p => {
                  const s = searchTerm.toLowerCase();
                  return (
                    p.clientName.toLowerCase().includes(s) ||
                    p.clientNumber.toLowerCase().includes(s) ||
                    p.requirement.toLowerCase().includes(s) ||
                    (p.businessCategory || '').toLowerCase().includes(s) ||
                    (p.domainName || '').toLowerCase().includes(s) ||
                    (p.renewalDate || '').toLowerCase().includes(s) ||
                    (p.paymentMode || '').toLowerCase().includes(s) ||
                    (p.projectClosed || '').toLowerCase().includes(s) ||
                    (p.clientSatisfied || '').toLowerCase().includes(s) ||
                    String(p.agreedAmount).includes(s) ||
                    String(p.advanceReceived).includes(s) ||
                    String(p.balanceToBeReceived).includes(s) ||
                    String(p.domainAmount).includes(s) ||
                    String(p.serverAmount).includes(s)
                  );
                });

                // Calculations for expenses
                const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
                const netProfit = totalCollected - totalExpenses;

                const filteredExpenses = expenses.filter(e => {
                  const s = searchTerm.toLowerCase();
                  const matchSearch = e.description.toLowerCase().includes(s) || 
                                      e.note.toLowerCase().includes(s) ||
                                      e.date.toLowerCase().includes(s) ||
                                      String(e.amount).includes(s);
                  if (expenseStartDateFilter && e.date < expenseStartDateFilter) return false;
                  if (expenseEndDateFilter && e.date > expenseEndDateFilter) return false;
                  return matchSearch;
                });

                // Invoice calculations
                const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

                return (
                  <div className="w-full flex flex-col gap-6 print-container">
                    {/* Sub navigation bar inside the Account Tab */}
                    <div className="flex gap-2 border-b border-ink/5 pb-2 select-none no-print">
                      {[
                        { id: 'ledger', name: 'Project Ledger' },
                        { id: 'expenses', name: 'Expenses' },
                        { id: 'invoice', name: 'Invoice Generator' },
                        { id: 'security', name: 'Security & Auth' }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setAccountSubTab(sub.id as any);
                            setSearchTerm('');
                          }}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                            accountSubTab === sub.id 
                              ? 'border-maroon text-maroon font-bold' 
                              : 'border-transparent text-ink/50 hover:text-maroon'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>

                    {/* SUB-TAB 1: PROJECT LEDGER */}
                    {accountSubTab === 'ledger' && (
                      <div className="flex flex-col gap-6 no-print">
                        {/* Financial Ledger Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total Receivables</span>
                            <span className="text-xl font-serif text-ink/80 font-semibold">₹{totalReceivables.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-ink/40 italic">Total agreed budget of projects</span>
                          </div>

                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total Collected</span>
                            <span className="text-xl font-serif text-green-700 font-semibold">₹{totalCollected.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-ink/40 italic">Advances + installments received</span>
                          </div>

                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Balance Due</span>
                            <span className="text-xl font-serif text-maroon font-semibold">₹{totalBalanceDue.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-ink/40 italic">Outstanding amount to collect</span>
                          </div>

                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">
                                {ledgerStartDateFilter || ledgerEndDateFilter ? 'Filtered Earnings' : "Today's Earnings"}
                              </span>
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                            <span className="text-xl font-serif text-ink/80 font-semibold">₹{filteredLedgerIncome.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-ink/40 italic">
                              {ledgerStartDateFilter || ledgerEndDateFilter ? 'Income in date range' : "Income logged today"}
                            </span>
                          </div>
                        </div>

                        {/* Monthly Cash Flow Chart */}
                        {(() => {
                          const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
                          
                          clientProjects.forEach(p => {
                            if (!p.date) return;
                            const month = p.date.substring(0, 7); // "YYYY-MM"
                            if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
                            monthlyData[month].income += p.advanceReceived + p.balancePaymentReceived;
                          });
                          
                          expenses.forEach(e => {
                            if (!e.date) return;
                            const month = e.date.substring(0, 7); // "YYYY-MM"
                            if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
                            monthlyData[month].expenses += e.amount;
                          });
                          
                          const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
                          if (sortedMonths.length === 0) return null;

                          // Find max value to scale chart heights
                          const maxVal = Math.max(
                            ...sortedMonths.map(m => Math.max(monthlyData[m].income, monthlyData[m].expenses)),
                            10000 // default minimum scale
                          );

                          return (
                            <div className="bg-white border border-ink/5 p-6 rounded-sm shadow-sm animate-fade-in">
                              <div className="flex items-center gap-2 mb-4 text-maroon">
                                <BarChart2 size={16} />
                                <h3 className="text-xs uppercase tracking-widest font-bold text-ink">Cash Flow Analysis (Last 6 Months)</h3>
                              </div>
                              <div className="flex justify-between items-end h-48 pt-6 border-b border-ink/10 px-2 gap-4">
                                {sortedMonths.map(m => {
                                  const data = monthlyData[m];
                                  const incomeHeight = (data.income / maxVal) * 100;
                                  const expenseHeight = (data.expenses / maxVal) * 100;
                                  
                                  // Format month label: "2026-07" -> "Jul 26"
                                  const [yr, mn] = m.split('-');
                                  const dateObj = new Date(Number(yr), Number(mn) - 1, 1);
                                  const monthLabel = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });

                                  return (
                                    <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                                        {/* Income Bar (Green) */}
                                        <div className="w-4 sm:w-6 flex flex-col justify-end h-full">
                                          <div 
                                            style={{ height: `${incomeHeight}%` }} 
                                            className="bg-emerald-600 rounded-t-xs hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
                                            title={`Collections: ₹${data.income.toLocaleString('en-IN')}`}
                                          />
                                        </div>
                                        {/* Expense Bar (Red) */}
                                        <div className="w-4 sm:w-6 flex flex-col justify-end h-full">
                                          <div 
                                            style={{ height: `${expenseHeight}%` }} 
                                            className="bg-maroon rounded-t-xs hover:bg-maroon/90 transition-all shadow-sm cursor-pointer"
                                            title={`Expenses: ₹${data.expenses.toLocaleString('en-IN')}`}
                                          />
                                        </div>
                                      </div>
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-ink/50 mt-1">{monthLabel}</span>
                                      
                                      {/* Tooltip on Hover */}
                                      <div className="absolute bottom-full mb-2 bg-ink text-white text-[9px] p-2 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg min-w-[120px] flex flex-col gap-0.5 border border-white/10 font-mono">
                                        <span className="font-bold border-b border-white/10 pb-0.5 mb-0.5 text-cream font-sans">{monthLabel}</span>
                                        <span className="text-emerald-400">In: ₹{data.income.toLocaleString('en-IN')}</span>
                                        <span className="text-red-400">Out: ₹{data.expenses.toLocaleString('en-IN')}</span>
                                        <span className="text-white border-t border-white/10 pt-0.5 mt-0.5">Net: ₹{(data.income - data.expenses).toLocaleString('en-IN')}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex gap-4 mt-3 justify-center text-[9px] font-bold uppercase tracking-wider text-ink/55">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
                                  <span>Income / Collections</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 bg-maroon rounded-xs"></span>
                                  <span>Expenses Logged</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Date filters and search toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-cream/20 p-4 rounded-sm border border-ink/5">
                          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-ink/40">Start Date</label>
                              <input 
                                type="date" 
                                value={ledgerStartDateFilter} 
                                onChange={(e) => setLedgerStartDateFilter(e.target.value)} 
                                className="bg-white border border-ink/10 rounded-sm py-1.5 px-2 text-xs text-ink/75 focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-ink/40">End Date</label>
                              <input 
                                type="date" 
                                value={ledgerEndDateFilter} 
                                onChange={(e) => setLedgerEndDateFilter(e.target.value)} 
                                className="bg-white border border-ink/10 rounded-sm py-1.5 px-2 text-xs text-ink/75 focus:outline-none"
                              />
                            </div>
                            {(ledgerStartDateFilter || ledgerEndDateFilter) && (
                              <button 
                                onClick={() => { setLedgerStartDateFilter(''); setLedgerEndDateFilter(''); }}
                                className="mt-4 text-[10px] text-maroon hover:underline font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Clear Filter
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto self-end">
                            <div className="relative w-full md:w-64">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                              <input 
                                type="text" 
                                placeholder="Search project or client..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-ink/10 rounded-sm pl-9 pr-4 py-2 text-xs text-ink/80 focus:outline-none focus:border-maroon w-full"
                              />
                            </div>
                            <button
                              onClick={() => downloadCSV(filteredLedgerProjects, 'projects_ledger.csv', projectHeaders)}
                              className="border border-green-600/40 hover:border-green-600 text-green-700 py-2 px-3.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-green-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                              title="Export filtered ledger to Excel"
                            >
                              <Download size={14} />
                              <span>Export Excel</span>
                            </button>
                            <button
                              onClick={() => setShowAddProjectModal(true)}
                              className="bg-maroon text-white py-2 px-4 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-maroon/90 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus size={14} />
                              <span>Add Project</span>
                            </button>
                          </div>
                        </div>

                        {/* Project Ledger Table */}
                        <div className="bg-white border border-ink/5 rounded-sm shadow-sm overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-full">
                            <thead>
                              <tr className="bg-cream/40 border-b border-ink/5">
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-14">S.No</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-28">Date Logged</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-60">Client Name</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-56">Project Name</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-32">Total Amount</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-32">Balance Due</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 w-32">End Date</th>
                                <th className="p-3 text-[9px] uppercase tracking-wider font-bold text-ink/50 text-right w-36">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                              {filteredLedgerProjects.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-xs text-ink/40 font-medium">
                                    No client ledger records found. Click "Add Project" to log your first client ledger.
                                  </td>
                                </tr>
                              ) : (
                                filteredLedgerProjects.map((p, index) => {
                                  return (
                                    <tr key={p.id} className="hover:bg-cream/10 transition-colors">
                                      <td className="p-3 text-xs text-ink/50 font-mono">{index + 1}</td>
                                      <td className="p-3 text-xs text-ink/70 font-mono">{p.date || 'N/A'}</td>
                                      <td className="p-3">
                                        <p className="text-xs font-bold text-ink/80 truncate" title={p.clientName}>{p.clientName}</p>
                                        <p className="text-[10px] text-ink/50 mt-0.5 truncate" title={`Contact: ${p.clientNumber}`}>
                                          Contact: {p.clientNumber || 'N/A'}
                                        </p>
                                      </td>
                                      <td className="p-3 text-xs text-ink/75 truncate font-semibold" title={p.requirement}>{p.requirement || 'N/A'}</td>
                                      <td className="p-3 text-xs font-bold font-mono text-ink/80">₹{(p.agreedAmount || 0).toLocaleString('en-IN')}</td>
                                      <td className="p-3 text-xs font-bold font-mono">
                                        <span className={p.balanceToBeReceived > 0 ? 'text-maroon' : 'text-green-700'}>
                                          ₹{(p.balanceToBeReceived || 0).toLocaleString('en-IN')}
                                        </span>
                                      </td>
                                      <td className="p-3 text-xs text-ink/60 font-mono">{p.expectedClosureDate || 'N/A'}</td>
                                      <td className="p-3 text-right">
                                        <div className="flex gap-2 justify-end">
                                          <button
                                            onClick={() => {
                                              setViewingLedger(p);
                                              setShowViewLedgerModal(true);
                                            }}
                                            className="border border-blue-500/20 hover:border-blue-500/50 text-blue-600 p-1.5 rounded-sm hover:bg-blue-500/5 transition-all cursor-pointer"
                                            title="View Full Details"
                                          >
                                            <Eye size={12} />
                                          </button>
                                          <button
                                            onClick={() => {
                                              populateLedgerForm(p);
                                              setEditingProject(p);
                                              setShowEditProjectModal(true);
                                            }}
                                            className="border border-maroon/20 hover:border-maroon/50 text-maroon p-1.5 rounded-sm hover:bg-maroon/5 transition-all cursor-pointer"
                                            title="Edit Ledger Item"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteClientProject(p.id!)}
                                            className="text-ink/30 hover:text-maroon p-1.5 transition-colors cursor-pointer"
                                            title="Delete Record"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: EXPENSES TRACKER */}
                    {accountSubTab === 'expenses' && (
                      <div className="flex flex-col gap-6 no-print">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total Ledger Collections</span>
                            <span className="text-xl font-serif text-green-700 font-semibold">₹{totalCollected.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total Expenses Logged</span>
                            <span className="text-xl font-serif text-maroon font-semibold">₹{totalExpenses.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="bg-white border border-ink/5 p-5 rounded-sm shadow-sm flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Net Profit</span>
                            <span className={`text-xl font-serif font-semibold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                              ₹{netProfit.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Expense filter toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-cream/20 p-4 rounded-sm border border-ink/5">
                          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-ink/40">From Date</label>
                              <input 
                                type="date" 
                                value={expenseStartDateFilter} 
                                onChange={(e) => setExpenseStartDateFilter(e.target.value)} 
                                className="bg-white border border-ink/10 rounded-sm py-1.5 px-2 text-xs text-ink/75 focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-ink/40">To Date</label>
                              <input 
                                type="date" 
                                value={expenseEndDateFilter} 
                                onChange={(e) => setExpenseEndDateFilter(e.target.value)} 
                                className="bg-white border border-ink/10 rounded-sm py-1.5 px-2 text-xs text-ink/75 focus:outline-none"
                              />
                            </div>
                            {(expenseStartDateFilter || expenseEndDateFilter) && (
                              <button 
                                onClick={() => { setExpenseStartDateFilter(''); setExpenseEndDateFilter(''); }}
                                className="mt-4 text-[10px] text-maroon hover:underline font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto self-end">
                            <div className="relative w-full md:w-64">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                              <input 
                                type="text" 
                                placeholder="Search expenses or categories..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-ink/10 rounded-sm pl-9 pr-4 py-2 text-xs text-ink/80 focus:outline-none w-full"
                              />
                            </div>
                            <button
                              onClick={() => downloadCSV(filteredExpenses, 'expenses_ledger.csv', expenseHeaders)}
                              className="border border-green-600/40 hover:border-green-600 text-green-700 py-2 px-3.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-green-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                              title="Export filtered expenses to Excel"
                            >
                              <Download size={14} />
                              <span>Export Excel</span>
                            </button>
                            <button
                              onClick={() => setShowAddExpenseModal(true)}
                              className="bg-maroon text-white py-2 px-4 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-maroon/90 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus size={14} />
                              <span>Log Expense</span>
                            </button>
                          </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="bg-white border border-ink/5 rounded-sm shadow-sm overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                              <tr className="bg-cream/40 border-b border-ink/5">
                                <th className="p-4 text-[10px] uppercase tracking-wider font-bold text-ink/50">Expense Description</th>
                                <th className="p-4 text-[10px] uppercase tracking-wider font-bold text-ink/50">Note</th>
                                <th className="p-4 text-[10px] uppercase tracking-wider font-bold text-ink/50">Date Logged</th>
                                <th className="p-4 text-[10px] uppercase tracking-wider font-bold text-ink/50">Amount Paid</th>
                                <th className="p-4 text-[10px] uppercase tracking-wider font-bold text-ink/50 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                              {filteredExpenses.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-xs text-ink/40 font-medium">
                                    No business expenses logged. Click "Log Expense" to record an expense.
                                  </td>
                                </tr>
                              ) : (
                                filteredExpenses.map((exp) => (
                                  <tr key={exp.id} className="hover:bg-cream/10 transition-colors">
                                    <td className="p-4 text-xs font-bold text-ink/80">{exp.description}</td>
                                    <td className="p-4">
                                      <span className="inline-block bg-maroon/5 text-maroon text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-maroon/10">
                                        {exp.note}
                                      </span>
                                    </td>
                                    <td className="p-4 text-xs text-ink/50 font-mono">{exp.date}</td>
                                    <td className="p-4 text-xs font-bold font-mono text-maroon">
                                      ₹{exp.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="flex gap-1.5 justify-end">
                                        <button
                                          onClick={() => downloadCSV([exp], `${exp.description.replace(/\s+/g, '_')}_expense.csv`, expenseHeaders)}
                                          className="border border-blue-500/20 hover:border-blue-500/50 text-blue-600 p-1.5 rounded-sm hover:bg-blue-500/5 transition-all cursor-pointer"
                                          title="Export this expense to Excel"
                                        >
                                          <Download size={12} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteExpense(exp.id!)}
                                          className="text-ink/30 hover:text-maroon p-1.5 transition-colors cursor-pointer"
                                          title="Delete Expense"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: INVOICE GENERATOR */}
                    {accountSubTab === 'invoice' && (
                      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
                        {/* Invoice Fields Form (Left Side) */}
                        <div className="w-full xl:w-2/5 bg-white border border-ink/5 p-6 rounded-sm shadow-sm flex flex-col gap-6 no-print">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2 mb-4">Invoice Information</h4>
                            
                            {/* Import from Ledger Option */}
                            {clientProjects.length > 0 && (
                              <div className="flex flex-col gap-1.5 mb-4 bg-cream/15 p-3 rounded-sm border border-ink/5 animate-fade-in">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-maroon">Quick Import from Ledger</label>
                                <select
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    const proj = clientProjects.find(p => p.id === val);
                                    if (proj) {
                                      setInvoiceClientName(proj.clientName);
                                      setInvoiceClientAddress(`Contact: ${proj.clientNumber || 'N/A'}\nDomain: ${proj.domainName || 'N/A'}`);
                                      // Pre-fill a main service billable item
                                      setInvoiceItems([
                                        {
                                          id: Math.random().toString(36).substring(2, 9),
                                          description: `${proj.requirement || 'Website Development'}`,
                                          quantity: 1,
                                          rate: proj.agreedAmount
                                        }
                                      ]);
                                    }
                                    e.target.value = ''; // Reset select value
                                  }}
                                  className="bg-white border border-ink/10 rounded-sm py-1.5 px-2 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                                >
                                  <option value="">-- Choose Project Ledger --</option>
                                  {clientProjects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.clientName} ({p.requirement || 'Project'}) - ₹{p.agreedAmount.toLocaleString('en-IN')}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-[8px] text-ink/40">Auto-populates client name, contact, domain info, and creates a project billable line item automatically.</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Invoice Number</label>
                                <input
                                  type="text"
                                  value={invoiceNumber}
                                  onChange={(e) => setInvoiceNumber(e.target.value)}
                                  placeholder="E.g., AML-204"
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Invoice Date</label>
                                <input
                                  type="date"
                                  value={invoiceDate}
                                  onChange={(e) => setInvoiceDate(e.target.value)}
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 mt-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Payment Due Date</label>
                                <input
                                  type="date"
                                  value={invoiceDueDate}
                                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-ink/5 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2 mb-4">Payment Remittance Details</h4>
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Remittance Type</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-1.5 text-xs text-ink/80 font-semibold cursor-pointer">
                                    <input
                                      type="radio"
                                      name="remittanceType"
                                      checked={invoicePaymentType === 'bank'}
                                      onChange={() => setInvoicePaymentType('bank')}
                                      className="accent-maroon"
                                    />
                                    <span>Bank Transfer</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs text-ink/80 font-semibold cursor-pointer">
                                    <input
                                      type="radio"
                                      name="remittanceType"
                                      checked={invoicePaymentType === 'upi'}
                                      onChange={() => setInvoicePaymentType('upi')}
                                      className="accent-maroon"
                                    />
                                    <span>UPI Pay</span>
                                  </label>
                                </div>
                              </div>

                              {invoicePaymentType === 'bank' ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Bank Name</label>
                                    <input
                                      type="text"
                                      value={invoiceBankName}
                                      onChange={(e) => setInvoiceBankName(e.target.value)}
                                      placeholder="HDFC Bank"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">A/C Name</label>
                                    <input
                                      type="text"
                                      value={invoiceAccountName}
                                      onChange={(e) => setInvoiceAccountName(e.target.value)}
                                      placeholder="Account Name"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">A/C Number</label>
                                    <input
                                      type="text"
                                      value={invoiceAccountNumber}
                                      onChange={(e) => setInvoiceAccountNumber(e.target.value)}
                                      placeholder="Account Number"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">IFSC Code</label>
                                    <input
                                      type="text"
                                      value={invoiceIfscCode}
                                      onChange={(e) => setInvoiceIfscCode(e.target.value)}
                                      placeholder="IFSC Code"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">UPI ID / VPA</label>
                                    <input
                                      type="text"
                                      value={invoiceUpiId}
                                      onChange={(e) => setInvoiceUpiId(e.target.value)}
                                      placeholder="reachus@vpa"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Payee Name</label>
                                    <input
                                      type="text"
                                      value={invoiceUpiName}
                                      onChange={(e) => setInvoiceUpiName(e.target.value)}
                                      placeholder="Payee Name"
                                      className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-ink/5 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2 mb-4">Client Billing Details</h4>
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Client Name / Business</label>
                                <input
                                  type="text"
                                  value={invoiceClientName}
                                  onChange={(e) => setInvoiceClientName(e.target.value)}
                                  placeholder="E.g., Desi Originals Private Ltd"
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Client Email</label>
                                <input
                                  type="email"
                                  value={invoiceClientEmail}
                                  onChange={(e) => setInvoiceClientEmail(e.target.value)}
                                  placeholder="E.g., finance@desioriginals.in"
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-ink/50">Client Address</label>
                                <textarea
                                  value={invoiceClientAddress}
                                  onChange={(e) => setInvoiceClientAddress(e.target.value)}
                                  placeholder="E.g., Jubilee Hills, Hyderabad"
                                  rows={2}
                                  className="bg-cream/20 border border-ink/10 rounded-sm py-2 px-3 text-xs text-ink/80 focus:outline-none resize-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/75 border-b border-ink/5 pb-2 mb-3">Add Billable Item</h4>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!itemDescription || !itemRate) return;
                                const item = {
                                  id: Math.random().toString(36).substr(2, 9),
                                  description: itemDescription,
                                  quantity: Number(itemQuantity) || 1,
                                  rate: Number(itemRate)
                                };
                                setInvoiceItems([...invoiceItems, item]);
                                setItemDescription('');
                                setItemQuantity('1');
                                setItemRate('');
                              }}
                              className="flex flex-col gap-3 bg-cream/10 p-3.5 rounded-sm border border-ink/5"
                            >
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] uppercase tracking-widest font-bold text-ink/50">Item Description</label>
                                <input
                                  type="text"
                                  value={itemDescription}
                                  onChange={(e) => setItemDescription(e.target.value)}
                                  placeholder="E.g., Website Development (Phase 1)"
                                  className="bg-white border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[8px] uppercase tracking-widest font-bold text-ink/50">Quantity</label>
                                  <input
                                    type="number"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                    placeholder="1"
                                    className="bg-white border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[8px] uppercase tracking-widest font-bold text-ink/50">Unit Rate (₹)</label>
                                  <input
                                    type="number"
                                    value={itemRate}
                                    onChange={(e) => setItemRate(e.target.value)}
                                    placeholder="Rate"
                                    className="bg-white border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="bg-maroon text-white py-1.5 px-3 rounded-sm text-[10px] uppercase font-bold tracking-wider hover:bg-maroon/90 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>Add Item</span>
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* Interactive Realtime Invoice Preview (Right Side) */}
                        <div className="w-full xl:w-3/5 flex flex-col gap-4">
                          <div className="flex justify-between items-center no-print">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Invoice Live Preview</span>
                            <button
                              onClick={() => window.print()}
                              disabled={invoiceItems.length === 0}
                              className="bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Globe size={13} />
                              <span>Print / Save PDF</span>
                            </button>
                          </div>

                          {/* Invoice Paper Document */}
                          <div id="printable-invoice-paper" className="w-full bg-white border border-ink/10 rounded-none shadow-lg p-10 font-sans text-ink/80 min-h-[750px] relative flex flex-col justify-between">
                            
                            <div>
                              {/* Header */}
                               <div className="flex justify-between items-start border-b border-ink/10 pb-6">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src="https://www.ascendmedialabs.com/assets/logo-main-CxjRq1zD.png" 
                                      alt="Ascend Media Labs Logo" 
                                      className="h-10 w-auto object-contain shrink-0"
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    <div>
                                      <h2 className="text-xl font-serif text-maroon font-bold tracking-wide leading-none uppercase">Ascend Media Labs</h2>
                                      <p className="text-[9px] uppercase tracking-widest text-ink/40 mt-1 leading-none">Creative Digital Media Agency</p>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-ink/50 leading-normal mt-4">
                                    <p>reachus@ascendmedialabs.in</p>
                                    <p>+91 7675852618</p>
                                    <p>Visakhapatnam</p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <h1 className="text-2xl font-serif font-semibold tracking-wider text-ink/70">INVOICE</h1>
                                  <div className="text-[10px] font-mono leading-normal mt-4">
                                    <p><strong className="text-ink/60 font-sans uppercase text-[8px] tracking-wider">Invoice #:</strong> {invoiceNumber || 'AML-XXXX'}</p>
                                    <p><strong className="text-ink/60 font-sans uppercase text-[8px] tracking-wider">Date:</strong> {invoiceDate}</p>
                                    {invoiceDueDate && <p><strong className="text-ink/60 font-sans uppercase text-[8px] tracking-wider text-maroon">Due Date:</strong> {invoiceDueDate}</p>}
                                  </div>
                                </div>
                              </div>

                              {/* Billed To / From */}
                              <div className="grid grid-cols-2 gap-4 py-8 text-xs">
                                <div>
                                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-ink/40 mb-2">Billed To</h4>
                                  <p className="font-bold text-ink/90">{invoiceClientName || 'Client Name / Business Name'}</p>
                                  {invoiceClientEmail && <p className="text-ink/50 mt-0.5">{invoiceClientEmail}</p>}
                                  {invoiceClientAddress && <p className="text-ink/50 whitespace-pre-line mt-1.5">{invoiceClientAddress}</p>}
                                </div>
                                
                                <div>
                                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-ink/40 mb-2">Payment Remittance</h4>
                                  <div className="text-ink/50 leading-relaxed">
                                    {invoicePaymentType === 'bank' ? (
                                      <>
                                        <p>Bank: {invoiceBankName}</p>
                                        <p>A/C Name: {invoiceAccountName}</p>
                                        <p>A/C Number: {invoiceAccountNumber}</p>
                                        <p>IFSC Code: {invoiceIfscCode}</p>
                                      </>
                                    ) : (
                                      <>
                                        <p>UPI ID: {invoiceUpiId}</p>
                                        <p>Payee Name: {invoiceUpiName}</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Billable Items Table */}
                              <table className="w-full text-left border-collapse text-xs mt-4">
                                <thead>
                                  <tr className="border-b-2 border-ink/80 text-[10px] uppercase font-bold text-ink/60">
                                    <th className="py-2">Item Description</th>
                                    <th className="py-2 text-center w-16">Qty</th>
                                    <th className="py-2 text-right w-24">Rate (₹)</th>
                                    <th className="py-2 text-right w-28">Amount (₹)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-ink/5">
                                  {invoiceItems.length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="py-6 text-center text-ink/30 italic">
                                        No items added yet. Please use the form on the left to add billing lines.
                                      </td>
                                    </tr>
                                  ) : (
                                    invoiceItems.map((item) => (
                                      <tr key={item.id} className="group">
                                        <td className="py-3 pr-4 font-medium text-ink/85 flex justify-between items-center">
                                          <span>{item.description}</span>
                                          <button
                                            onClick={() => setInvoiceItems(invoiceItems.filter(it => it.id !== item.id))}
                                            className="text-red-500 hover:underline text-[9px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity no-print cursor-pointer"
                                          >
                                            [Remove]
                                          </button>
                                        </td>
                                        <td className="py-3 text-center font-mono">{item.quantity}</td>
                                        <td className="py-3 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                                        <td className="py-3 text-right font-mono font-semibold">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Total and Sign-off */}
                            <div className="border-t border-ink/10 pt-6 mt-8 flex justify-between items-start">
                              <div className="w-1/2">
                                <h4 className="text-[8px] uppercase tracking-widest font-bold text-ink/40 mb-1">Notes & Terms</h4>
                                <p className="text-[9px] text-ink/45 leading-relaxed">
                                  1. Please pay within the specified due date.<br />
                                  2. Payments can be sent via Bank IMPS/UPI.<br />
                                  3. For queries, contact reachus@ascendmedialabs.in
                                </p>
                              </div>

                              <div className="w-1/3 flex flex-col gap-2.5 text-xs text-right">
                                <div className="flex justify-between items-center text-ink/50">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">₹{invoiceSubtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-ink/50 border-b border-ink/5 pb-2">
                                  <span>Tax / GST (0%):</span>
                                  <span className="font-mono">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-ink/90 font-mono">
                                  <span className="font-sans uppercase text-[10px] tracking-wider text-ink/50">Grand Total:</span>
                                  <span className="text-maroon">₹{invoiceSubtotal.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex flex-col items-end mt-8">
                                  <div className="h-10 w-24 border-b border-ink/20 relative">
                                    <span className="absolute bottom-1 right-2 text-[9px] font-serif italic text-ink/30">Ascend Labs</span>
                                  </div>
                                  <span className="text-[8px] uppercase tracking-widest text-ink/40 font-bold mt-1.5">Authorized Signatory</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: ORIGINAL SECURITY AND ACCOUNT SETTINGS */}
                    {accountSubTab === 'security' && (
                      <div className="bg-white border border-ink/5 p-8 rounded-sm shadow-sm max-w-2xl no-print">
                        <div className="flex items-center gap-2 mb-6 text-maroon border-b border-ink/5 pb-4">
                          <Lock size={18} />
                          <h3 className="text-base font-serif">Security settings</h3>
                        </div>

                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-4 bg-cream/40 p-4 rounded-sm border border-ink/5">
                            <div className="h-14 w-14 rounded-full bg-maroon text-white flex items-center justify-center font-serif text-xl font-bold uppercase shadow-sm">
                              {user?.email?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-ink/80">Administrator</h4>
                              <p className="text-xs text-ink/55">{user?.email || 'admin@ascendmedialabsinfo.com'}</p>
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
                );
              })()}
              
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

      {/* View Client Project Ledger Modal */}
      <AnimatePresence>
        {showViewLedgerModal && viewingLedger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewLedgerModal(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif">Project Ledger Details</h3>
                <button 
                  onClick={() => setShowViewLedgerModal(false)}
                  className="text-ink/40 hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Client Info Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Client Info</h4>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Date Logged</span>
                      <span className="text-xs text-ink/80 font-mono font-bold">{viewingLedger.date || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Client Name</span>
                      <span className="text-xs text-ink/80 font-bold">{viewingLedger.clientName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Client Number</span>
                      <span className="text-xs text-ink/80 font-mono">{viewingLedger.clientNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Business Category</span>
                      <span className="text-xs text-ink/80">{viewingLedger.businessCategory || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Project Name</span>
                      <span className="text-xs text-ink/80 font-semibold">{viewingLedger.requirement || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Financials Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Financials & Dates</h4>
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Agreed Amount</span>
                        <span className="text-xs text-ink/80 font-bold font-mono">₹{viewingLedger.agreedAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Payment Mode</span>
                        <span className="text-xs text-ink/85 font-mono font-bold uppercase">{viewingLedger.paymentMode || 'UPI'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Advance Received</span>
                        <span className="text-xs text-green-700 font-bold font-mono">₹{viewingLedger.advanceReceived.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Advance Date</span>
                        <span className="text-xs text-ink/80 font-mono">{viewingLedger.advanceReceivedDate || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Installments in View */}
                    {viewingLedger.installments && viewingLedger.installments.length > 0 && (
                      <div className="bg-cream/10 p-2.5 rounded-sm border border-ink/5">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-maroon block mb-1">Subsequent Payments</span>
                        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                          {viewingLedger.installments.map((inst, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-mono py-0.5 border-b border-ink/5 last:border-0">
                              <span className="text-ink/65">Installment {idx + 1}</span>
                              <span className="text-green-700 font-bold">₹{inst.amount.toLocaleString('en-IN')} ({inst.date})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Domain Name</span>
                        <span className="text-xs text-ink/80 font-semibold">{viewingLedger.domainName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Domain Amount</span>
                        <span className="text-xs text-ink/70 font-mono">₹{viewingLedger.domainAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Server Amount</span>
                        <span className="text-xs text-ink/70 font-mono">₹{viewingLedger.serverAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Renewal Date</span>
                        <span className="text-xs text-ink/80 font-mono">{viewingLedger.renewalDate || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-maroon block">Balance Due</span>
                        <span className="text-xs font-bold font-mono text-maroon">₹{viewingLedger.balanceToBeReceived.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Feedback Details */}
                <div className="md:col-span-2 flex flex-col gap-3 border-t border-ink/5 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Feedback, Upselling & Schedule</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Expected Closure</span>
                      <span className="text-xs text-ink/80 font-mono">{viewingLedger.expectedClosureDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Project Closed?</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${
                        viewingLedger.projectClosed === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{viewingLedger.projectClosed || 'No'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Client Satisfied?</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${
                        viewingLedger.clientSatisfied === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{viewingLedger.clientSatisfied || 'No'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Review Posted?</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${
                        viewingLedger.reviewPosted === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-ink/10 text-ink/60'
                      }`}>{viewingLedger.reviewPosted || 'No'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Next Follow-Up Date</span>
                      <span className="text-xs text-ink/80 font-mono">{viewingLedger.nextFollowUpDate || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-ink/40 block">Upselling comments</span>
                      <p className="text-xs text-ink/85 mt-0.5 whitespace-pre-wrap">{viewingLedger.upsellingPossibility || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end mt-6 border-t border-ink/5 pt-4">
                <button
                  type="button"
                  onClick={() => downloadCSV([viewingLedger], `${viewingLedger.clientName.replace(/\s+/g, '_')}_project_ledger.csv`, projectHeaders)}
                  className="border border-green-600/40 hover:border-green-600 text-green-700 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-green-50 transition-colors flex items-center gap-1.5 cursor-pointer animate-hover"
                  title="Export this project details to Excel"
                >
                  <Download size={12} />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewLedgerModal(false)}
                  className="border border-ink/10 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewLedgerModal(false);
                    populateLedgerForm(viewingLedger);
                    setEditingProject(viewingLedger);
                    setShowEditProjectModal(true);
                  }}
                  className="bg-maroon text-white px-5 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit size={12} />
                  <span>Edit Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Client Project Ledger Modal */}
      <AnimatePresence>
        {showAddProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowAddProjectModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif">Add Project Ledger Record</h3>
                <button 
                  onClick={() => setShowAddProjectModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddClientProject} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                  {/* General Client Details */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Client Info</h4>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Date</label>
                      <input
                        type="date"
                        value={ledgerDate}
                        onChange={(e) => setLedgerDate(e.target.value)}
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        required
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Name</label>
                      <input
                        type="text"
                        value={ledgerClientName}
                        onChange={(e) => setLedgerClientName(e.target.value)}
                        placeholder="E.g., Inizio Interiors Group"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        required
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Number</label>
                      <input
                        type="text"
                        value={ledgerClientNumber}
                        onChange={(e) => setLedgerClientNumber(e.target.value)}
                        placeholder="Phone Number"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Business Category</label>
                        <input
                          type="text"
                          value={ledgerBusinessCategory}
                          onChange={(e) => setLedgerBusinessCategory(e.target.value)}
                          placeholder="E.g., Real Estate"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Requirement</label>
                        <input
                          type="text"
                          value={ledgerRequirement}
                          onChange={(e) => setLedgerRequirement(e.target.value)}
                          placeholder="E.g., Website / SEO / Meta Ads"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          required
                          disabled={actionLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financials & Statuses */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Financials & Dates</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Agreed Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerAgreedAmount}
                          onChange={(e) => setLedgerAgreedAmount(e.target.value)}
                          placeholder="Agreed Budget"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          required
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Payment Mode</label>
                        <select
                          value={ledgerPaymentMode}
                          onChange={(e) => setLedgerPaymentMode(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="UPI">UPI</option>
                          <option value="cheque">Cheque</option>
                          <option value="cash">Cash</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Advance Received (₹)</label>
                        <input
                          type="number"
                          value={ledgerAdvanceReceived}
                          onChange={(e) => setLedgerAdvanceReceived(e.target.value)}
                          placeholder="Advance Amount"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Advance Date</label>
                        <input
                          type="date"
                          value={ledgerAdvanceReceivedDate}
                          onChange={(e) => setLedgerAdvanceReceivedDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    {/* Dynamic Installments List */}
                    <div className="flex flex-col gap-2 border border-ink/5 bg-cream/10 p-3 rounded-sm my-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-maroon">Subsequent Payments (Installments)</span>
                        <button
                          type="button"
                          onClick={addInstallmentField}
                          className="text-[9px] uppercase tracking-widest font-bold bg-maroon text-white px-2 py-0.5 rounded-sm hover:bg-maroon/90 cursor-pointer transition-colors"
                        >
                          + Add Payment
                        </button>
                      </div>

                      {ledgerInstallments.length === 0 ? (
                        <p className="text-[10px] text-ink/40 italic text-center py-1">No subsequent payments recorded.</p>
                      ) : (
                        <div className="flex flex-col gap-2 mt-1 max-h-36 overflow-y-auto pr-1">
                          {ledgerInstallments.map((inst, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="flex-1 flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase tracking-widest font-bold text-ink/45">Amount (₹)</label>
                                <input
                                  type="number"
                                  value={inst.amount}
                                  onChange={(e) => updateInstallmentField(idx, 'amount', e.target.value)}
                                  placeholder="Amount paid"
                                  className="bg-white border border-ink/10 rounded-sm py-1 px-2 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                                  disabled={actionLoading}
                                />
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase tracking-widest font-bold text-ink/45">Date Paid</label>
                                <input
                                  type="date"
                                  value={inst.date}
                                  onChange={(e) => updateInstallmentField(idx, 'date', e.target.value)}
                                  className="bg-white border border-ink/10 rounded-sm py-1 px-2 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                                  disabled={actionLoading}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeInstallmentField(idx)}
                                className="text-red-600 hover:text-red-800 text-[10px] mt-3 font-bold cursor-pointer hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Domain Name</label>
                        <input
                          type="text"
                          value={ledgerDomainName}
                          onChange={(e) => setLedgerDomainName(e.target.value)}
                          placeholder="e.g., example.com"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Domain Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerDomainAmount}
                          onChange={(e) => setLedgerDomainAmount(e.target.value)}
                          placeholder="Domain Cost"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Server Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerServerAmount}
                          onChange={(e) => setLedgerServerAmount(e.target.value)}
                          placeholder="Server Cost"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Renewal Date</label>
                        <input
                          type="date"
                          value={ledgerRenewalDate}
                          onChange={(e) => setLedgerRenewalDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Balance Due (₹) (Auto-calculated)</label>
                        <input
                          type="text"
                          value={`₹${calculatedBalanceDue.toLocaleString('en-IN')}`}
                          className="bg-cream/15 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/40 font-mono focus:outline-none cursor-not-allowed font-bold"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Expected Closure</label>
                        <input
                          type="date"
                          value={ledgerExpectedClosureDate}
                          onChange={(e) => setLedgerExpectedClosureDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Project Closed?</label>
                        <select
                          value={ledgerProjectClosed}
                          onChange={(e) => setLedgerProjectClosed(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/85 focus:outline-none focus:border-maroon font-bold"
                          disabled={actionLoading}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Feedback, Follow up, Upselling (Span 2) */}
                  <div className="md:col-span-2 flex flex-col gap-3 border-t border-ink/5 pt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Feedback & Upselling</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Satisfied?</label>
                        <select
                          value={ledgerClientSatisfied}
                          onChange={(e) => setLedgerClientSatisfied(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Review Posted?</label>
                        <select
                          value={ledgerReviewPosted}
                          onChange={(e) => setLedgerReviewPosted(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Next Follow-Up Date</label>
                        <input
                          type="date"
                          value={ledgerNextFollowUpDate}
                          onChange={(e) => setLedgerNextFollowUpDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Upselling Possibility / Comments</label>
                      <input
                        type="text"
                        value={ledgerUpsellingPossibility}
                        onChange={(e) => setLedgerUpsellingPossibility(e.target.value)}
                        placeholder="E.g., Client interested in brand logo design next month"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-ink/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Record</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Client Project Ledger Modal */}
      <AnimatePresence>
        {showEditProjectModal && editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowEditProjectModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif">Edit Project Ledger Record</h3>
                <button 
                  onClick={() => setShowEditProjectModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateClientProject} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                  {/* General Client Details */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Client Info</h4>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Date</label>
                      <input
                        type="date"
                        value={ledgerDate}
                        onChange={(e) => setLedgerDate(e.target.value)}
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        required
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Name</label>
                      <input
                        type="text"
                        value={ledgerClientName}
                        onChange={(e) => setLedgerClientName(e.target.value)}
                        placeholder="E.g., Inizio Interiors Group"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        required
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Number</label>
                      <input
                        type="text"
                        value={ledgerClientNumber}
                        onChange={(e) => setLedgerClientNumber(e.target.value)}
                        placeholder="Phone Number"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Business Category</label>
                        <input
                          type="text"
                          value={ledgerBusinessCategory}
                          onChange={(e) => setLedgerBusinessCategory(e.target.value)}
                          placeholder="E.g., Real Estate"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Requirement</label>
                        <input
                          type="text"
                          value={ledgerRequirement}
                          onChange={(e) => setLedgerRequirement(e.target.value)}
                          placeholder="E.g., Website / SEO / Meta Ads"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          required
                          disabled={actionLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financials & Statuses */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Financials & Dates</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Agreed Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerAgreedAmount}
                          onChange={(e) => setLedgerAgreedAmount(e.target.value)}
                          placeholder="Agreed Budget"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          required
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Payment Mode</label>
                        <select
                          value={ledgerPaymentMode}
                          onChange={(e) => setLedgerPaymentMode(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="UPI">UPI</option>
                          <option value="cheque">Cheque</option>
                          <option value="cash">Cash</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Advance Received (₹)</label>
                        <input
                          type="number"
                          value={ledgerAdvanceReceived}
                          onChange={(e) => setLedgerAdvanceReceived(e.target.value)}
                          placeholder="Advance Amount"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Advance Date</label>
                        <input
                          type="date"
                          value={ledgerAdvanceReceivedDate}
                          onChange={(e) => setLedgerAdvanceReceivedDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    {/* Dynamic Installments List */}
                    <div className="flex flex-col gap-2 border border-ink/5 bg-cream/10 p-3 rounded-sm my-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-maroon">Subsequent Payments (Installments)</span>
                        <button
                          type="button"
                          onClick={addInstallmentField}
                          className="text-[9px] uppercase tracking-widest font-bold bg-maroon text-white px-2 py-0.5 rounded-sm hover:bg-maroon/90 cursor-pointer transition-colors"
                        >
                          + Add Payment
                        </button>
                      </div>

                      {ledgerInstallments.length === 0 ? (
                        <p className="text-[10px] text-ink/40 italic text-center py-1">No subsequent payments recorded.</p>
                      ) : (
                        <div className="flex flex-col gap-2 mt-1 max-h-36 overflow-y-auto pr-1">
                          {ledgerInstallments.map((inst, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="flex-1 flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase tracking-widest font-bold text-ink/45">Amount (₹)</label>
                                <input
                                  type="number"
                                  value={inst.amount}
                                  onChange={(e) => updateInstallmentField(idx, 'amount', e.target.value)}
                                  placeholder="Amount paid"
                                  className="bg-white border border-ink/10 rounded-sm py-1 px-2 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                                  disabled={actionLoading}
                                />
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase tracking-widest font-bold text-ink/45">Date Paid</label>
                                <input
                                  type="date"
                                  value={inst.date}
                                  onChange={(e) => updateInstallmentField(idx, 'date', e.target.value)}
                                  className="bg-white border border-ink/10 rounded-sm py-1 px-2 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                                  disabled={actionLoading}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeInstallmentField(idx)}
                                className="text-red-600 hover:text-red-800 text-[10px] mt-3 font-bold cursor-pointer hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Domain Name</label>
                        <input
                          type="text"
                          value={ledgerDomainName}
                          onChange={(e) => setLedgerDomainName(e.target.value)}
                          placeholder="e.g., example.com"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Domain Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerDomainAmount}
                          onChange={(e) => setLedgerDomainAmount(e.target.value)}
                          placeholder="Domain Cost"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Server Amount (₹)</label>
                        <input
                          type="number"
                          value={ledgerServerAmount}
                          onChange={(e) => setLedgerServerAmount(e.target.value)}
                          placeholder="Server Cost"
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Renewal Date</label>
                        <input
                          type="date"
                          value={ledgerRenewalDate}
                          onChange={(e) => setLedgerRenewalDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Balance Due (₹) (Auto-calculated)</label>
                        <input
                          type="text"
                          value={`₹${calculatedBalanceDue.toLocaleString('en-IN')}`}
                          className="bg-cream/15 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/40 font-mono focus:outline-none cursor-not-allowed font-bold"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Expected Closure</label>
                        <input
                          type="date"
                          value={ledgerExpectedClosureDate}
                          onChange={(e) => setLedgerExpectedClosureDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Project Closed?</label>
                        <select
                          value={ledgerProjectClosed}
                          onChange={(e) => setLedgerProjectClosed(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/85 focus:outline-none focus:border-maroon font-bold"
                          disabled={actionLoading}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Feedback, Follow up, Upselling (Span 2) */}
                  <div className="md:col-span-2 flex flex-col gap-3 border-t border-ink/5 pt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon border-b border-ink/5 pb-1">Feedback & Upselling</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Client Satisfied?</label>
                        <select
                          value={ledgerClientSatisfied}
                          onChange={(e) => setLedgerClientSatisfied(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Review Posted?</label>
                        <select
                          value={ledgerReviewPosted}
                          onChange={(e) => setLedgerReviewPosted(e.target.value as any)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Next Follow-Up Date</label>
                        <input
                          type="date"
                          value={ledgerNextFollowUpDate}
                          onChange={(e) => setLedgerNextFollowUpDate(e.target.value)}
                          className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                          disabled={actionLoading}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-ink/60">Upselling Possibility / Comments</label>
                      <input
                        type="text"
                        value={ledgerUpsellingPossibility}
                        onChange={(e) => setLedgerUpsellingPossibility(e.target.value)}
                        placeholder="E.g., Client interested in brand logo design next month"
                        className="bg-cream/25 border border-ink/10 rounded-sm py-1.5 px-2.5 text-xs text-ink/80 focus:outline-none focus:border-maroon"
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-ink/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditProjectModal(false)}
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Update Record</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Business Expense Modal */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!actionLoading) setShowAddExpenseModal(false); }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl relative z-10 border border-ink/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif">Log Expense</h3>
                <button 
                  onClick={() => setShowAddExpenseModal(false)}
                  disabled={actionLoading}
                  className="text-ink/40 hover:text-ink cursor-pointer disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/75">Description</label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="E.g., Vercel Hosting Subscription"
                    className="w-full bg-cream/35 border border-ink/10 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-maroon transition-colors"
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/75">Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full bg-cream/35 border border-ink/10 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-maroon transition-colors"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-ink/75">Expense Date</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      required
                      className="w-full bg-cream/35 border border-ink/10 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-maroon transition-colors"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink/75">Expense Note</label>
                  <input
                    type="text"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    placeholder="E.g., Vercel subscription, developer salary, domain, etc."
                    className="w-full bg-cream/35 border border-ink/10 rounded-sm py-2 px-3 text-xs focus:outline-none focus:border-maroon transition-colors"
                    disabled={actionLoading}
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-ink/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
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
                        <span>Logging...</span>
                      </>
                    ) : (
                      <span>Save Expense</span>
                    )}
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
