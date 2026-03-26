import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import { motion, AnimatePresence } from 'motion/react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
              <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <a
            href="https://wa.me/919999999999?text=Hello%20Ascend%20Media%20Labs!%20I%20am%20interested%20in%20your%20services"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp chat"
            className="h-12 w-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center ring-2 ring-white ring-offset-2 ring-offset-slate-100"
          >
            <span className="text-2xl">💬</span>
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="h-12 w-12 rounded-full bg-maroon text-white shadow-xl hover:bg-maroon/90 transition-all"
          >
            ↑
          </button>
        </div>

        <Footer />
      </div>
    </Router>
  );
}
