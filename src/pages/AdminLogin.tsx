import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      // Friendly messages for auth errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 relative py-20">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-maroon/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-maroon/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/40 backdrop-blur-md p-10 rounded-sm border border-ink/5 shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-maroon mb-2">Secure Portal</h4>
          <h1 className="text-3xl font-serif">Admin Login</h1>
          <p className="text-sm text-ink/60 mt-2">Manage the Ascend Media Labs website</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-700 text-xs p-4 rounded-sm mb-6"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ascendmedialabs.com"
                className="w-full bg-white/80 border border-ink/10 rounded-sm py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                required
                disabled={loading}
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-ink/70" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/80 border border-ink/10 rounded-sm py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                required
                disabled={loading}
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-maroon/20 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
