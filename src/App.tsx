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
import { FaWhatsapp, FaArrowUp } from 'react-icons/fa';

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.004 2.002c-5.522 0-10 4.477-10 10 0 1.766.461 3.507 1.333 5.015L2 22l4.892-1.297a9.957 9.957 0 0 0 2.879.43h.002c5.522 0 10-4.477 10-10s-4.478-10-9.769-10zm5.502 14.034c-.24.674-1.402 1.283-1.96 1.361-.51.071-1.16.107-3.007-.689a10.29 10.29 0 0 1-5.29-5.46c-.577-1.376-.746-2.499-.736-2.622.01-.13.064-.19.139-.289.072-.093.16-.21.237-.268.073-.056.16-.077.214-.093.058-.017.124-.021.19-.021.07 0 .18 0 .27.01.087.01.374.136.806.504.438.373 1.053 1.005 1.145 1.089.093.081.16.18.255.3.094.12.049.22-.041.35-.089.13-.27.354-.38.475-.1.11-.202.22-.065.429.137.21.607.994 1.3 1.606.896.775 1.645 1.058 1.871 1.17.233.112.37.098.507-.06.138-.16.587-.687.74-.924.154-.235.316-.19.533-.115.217.075 1.36.64 1.593.757.23.118.384.176.44.273.057.1.057.585-.184 1.26z"/>
  </svg>
);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const handleWhatsApp = () => {
  const phoneNumber = '+917675852618';
  const message = encodeURIComponent(
    'Hi! I’d like to book a free consultation about interior design services.'
  );
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="grow">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
              <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button
            onClick={handleWhatsApp}
            className="fixed bottom-24 right-4 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-transform duration-300 z-40 cursor-pointer"
            aria-label="Chat on WhatsApp"
          >
            <FaWhatsapp className="w-9 h-9" />
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="h-12 w-12 rounded-full bg-maroon text-white shadow-xl hover:bg-maroon/90 transition-all flex items-center justify-center"
          >
            <FaArrowUp className="w-5 h-5" />
          </button>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
