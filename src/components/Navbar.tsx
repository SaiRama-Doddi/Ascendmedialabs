import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOGO } from '../constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Edutech', path: '/edutech' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-cream/80 backdrop-blur-md py-2 shadow-sm' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 md:gap-3 group">
          <img 
            src={LOGO} 
            alt="Ascend Media Labs" 
            className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-12 md:h-16' : 'h-14 md:h-20'}`}
          />
          <div className="flex flex-col gap-0.5 transition-all duration-300">
            <span className="text-xl md:text-2xl font-bold text-maroon uppercase tracking-[0.06em] leading-none">Ascend</span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-ink/60 leading-none">Media Labs</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 relative">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onMouseEnter={() => setHoveredPath(link.path)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`relative px-3.5 py-2 text-xs uppercase tracking-widest font-medium transition-colors z-10 ${
                  isActive ? 'text-maroon' : 'text-ink/75 hover:text-maroon'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-maroon"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {hoveredPath === link.path && (
                  <motion.div
                    layoutId="navHoverPill"
                    className="absolute inset-0 bg-maroon/5 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
          <Link to="/contact" className="bg-maroon text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-sm ml-2">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-ink" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-cream border-t border-ink/5 shadow-xl md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm uppercase tracking-widest font-medium ${location.pathname === link.path ? 'text-maroon' : 'text-ink/70'}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="bg-maroon text-white px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-bold text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
