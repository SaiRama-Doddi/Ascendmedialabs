import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Globe, ArrowRight } from 'lucide-react';
import { LOGO } from '../constants';

const Footer = () => {
  return (
    <footer className="bg-cream border-t border-ink/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            <img 
              src={LOGO} 
              alt="Ascend Media Labs" 
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-ink/60 leading-relaxed mb-6">
            Architecting the future of digital presence through refined design and strategic engineering.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-maroon hover:text-white transition-all">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-maroon hover:text-white transition-all">
              <Linkedin size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center hover:bg-maroon hover:text-white transition-all">
              <Globe size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-medium mb-6 text-maroon">Our Expertise</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="/services" className="text-sm text-ink/70 hover:text-maroon transition-colors">Web Development</Link></li>
            <li><Link to="/services" className="text-sm text-ink/70 hover:text-maroon transition-colors">Brand Identity</Link></li>
            <li><Link to="/services" className="text-sm text-ink/70 hover:text-maroon transition-colors">SEO Strategy</Link></li>
            <li><Link to="/services" className="text-sm text-ink/70 hover:text-maroon transition-colors">Maintenance</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-medium mb-6 text-maroon">Navigation</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="/" className="text-sm text-ink/70 hover:text-maroon transition-colors">Home</Link></li>
            <li><Link to="/services" className="text-sm text-ink/70 hover:text-maroon transition-colors">Services</Link></li>
            <li><Link to="/portfolio" className="text-sm text-ink/70 hover:text-maroon transition-colors">Portfolio</Link></li>
            <li><Link to="/about" className="text-sm text-ink/70 hover:text-maroon transition-colors">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-medium mb-6 text-maroon">Newsletter</h4>
          <p className="text-sm text-ink/60 mb-4">Receive curated insights on design and digital strategy.</p>
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-transparent border-b border-ink/20 py-2 pr-10 text-sm focus:outline-none focus:border-maroon transition-colors"
            />
            <button className="absolute right-0 bottom-2 text-ink/40 hover:text-maroon transition-colors">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-ink/5 pt-10">
        <p className="text-[10px] uppercase tracking-widest text-ink/40 font-medium">
          © 2024 ASCEND MEDIA LABS. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-8">
          <Link to="#" className="text-[10px] uppercase tracking-widest text-ink/40 font-medium hover:text-maroon">Privacy Policy</Link>
          <Link to="#" className="text-[10px] uppercase tracking-widest text-ink/40 font-medium hover:text-maroon">Terms of Service</Link>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-ink/40 font-medium italic">
          Bespoke Digital Atelier
        </p>
      </div>
    </footer>
  );
};

export default Footer;
