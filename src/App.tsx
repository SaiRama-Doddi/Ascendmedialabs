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
import { FaWhatsapp, FaArrowUp, FaPhone } from 'react-icons/fa';

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
    "Hi, would you like to know more about the services for Ascend Media Labs?"
  );
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};

const handlePhoneCall = () => {
  window.location.href = 'tel:+917675852618';
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
            <Routes location={location}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
              <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <motion.button
            onClick={handlePhoneCall}
            className="bg-blue-600 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-300 z-40 cursor-pointer relative overflow-hidden"
            aria-label="Call us"
            title="Call: +91 7675852618"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -8, 0]
            }}
            transition={{ 
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <FaPhone size={20} />
            </motion.div>
          </motion.button>
          <div className="relative">
            <button
              onClick={handleWhatsApp}
              className="bg-green-500 text-white h-16 w-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 z-40 cursor-pointer"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
            >
              <FaWhatsapp size={32} />
            </button>
            <motion.div 
              className="absolute right-full mr-3 bottom-1/2 translate-y-1/2 whitespace-nowrap bg-white text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                pointerEvents: 'none',
              }}
            >
              <span>Hi, how can we help you today?</span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </motion.div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="h-14 w-14 rounded-full bg-maroon text-white shadow-xl hover:bg-maroon/90 hover:scale-110 transition-all duration-300 flex items-center justify-center"
            title="Back to top"
          >
            <FaArrowUp size={20} />
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
