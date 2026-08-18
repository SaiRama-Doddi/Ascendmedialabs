import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Target, Zap, Sparkles, Star, Rocket, Gem, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECTS, Project, WEB_IMAGE, SEO_IMAGE, BRANDING_IMAGE, TRUSTED_BRANDS, Brand } from '../constants';
import GoogleReviews from '../components/GoogleReviews';
import { portfolioService } from '../services/portfolioService';
import heroBuilding from '../assets/images/hero-building.png';
import maroonLeaves from '../assets/images/maroon-leaves.png';

const Home = () => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [brands, setBrands] = useState<Brand[]>(TRUSTED_BRANDS);

  useEffect(() => {
    let active = true;
    portfolioService.getProjects().then((data) => {
      if (active) {
        setProjects(data);
      }
    });
    portfolioService.getBrands().then((data) => {
      if (active) {
        setBrands(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pt-16 md:pt-24">
      {/* Ultra-Premium Hero Section */}
      <section className="relative pt-12 pb-10 md:pt-16 md:pb-14 px-6 md:px-12 overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#F8F3EC] to-cream">
        {/* Ambient Background Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-maroon/15 rounded-full mix-blend-multiply"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-400/20 rounded-full mix-blend-multiply"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center">
          {/* Main Hero Split Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Floating Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md border border-maroon/15 rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-maroon mb-6"
              >
                <Sparkles size={14} className="text-amber-600 animate-pulse" />
                <span>Digital Atelier & Tech Engineering</span>
                <span className="w-1.5 h-1.5 rounded-full bg-maroon"></span>
              </motion.div>

              {/* Hero Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.15] mb-6 text-ink tracking-tight"
              >
                We Architect <span className="text-maroon italic relative">Digital Experiences<span className="absolute bottom-0 left-0 w-full h-[3px] bg-maroon/20 rounded"></span></span> <br />
                <span>That Scale Modern Brands</span>
              </motion.h1>

              {/* Hero Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-base text-ink/75 max-w-2xl mb-8 leading-relaxed font-normal"
              >
                Bespoke web engineering, high-conversion branding, SEO growth strategy, and practical IT & Edutech programs built for high-growth businesses.
              </motion.p>

              {/* Hero Call To Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6 lg:mb-0"
              >
                <Link
                  to="/contact"
                  className="w-full sm:w-auto bg-maroon text-white px-9 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-xl shadow-maroon/25 hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Start Your Project <ArrowRight size={14} />
                </Link>
                
                <Link
                  to="/edutech"
                  className="w-full sm:w-auto bg-white/95 border border-maroon/20 text-maroon px-9 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Explore Edutech & Courses <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* Right Graphic Column */}
            <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
              {/* Outer Decorative Circles and lines in background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-none z-0 opacity-80">
                <svg className="w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="250" r="220" stroke="#B45F52" strokeWidth="1" strokeOpacity="0.08" />
                  <circle cx="250" cy="250" r="180" stroke="#B45F52" strokeWidth="1" strokeOpacity="0.05" strokeDasharray="4 4" />
                  <path d="M50 450 C 150 350, 350 350, 450 450" stroke="#B45F52" strokeWidth="1" strokeOpacity="0.1" fill="none" />
                </svg>
              </div>

              {/* Main Circular Mask Graphic */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="relative w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full overflow-hidden border border-maroon/15 shadow-2xl z-10 bg-cream"
              >
                <img 
                  src={heroBuilding} 
                  alt="Modern Architecture Block" 
                  className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-[2000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-maroon/5 via-transparent to-amber-500/5 mix-blend-overlay pointer-events-none"></div>
              </motion.div>

              {/* Red Watercolor Leaves Overlay */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute bottom-[-20px] right-[-10px] sm:right-[-20px] w-48 sm:w-64 z-20 pointer-events-none mix-blend-multiply opacity-90"
              >
                <img 
                  src={maroonLeaves} 
                  alt="Maroon decorative branch" 
                  className="w-full h-auto object-contain"
                />
              </motion.div>

              {/* Floating Scalable Growth Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, x: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 80 }}
                className="absolute top-12 right-0 sm:right-4 w-44 sm:w-52 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/90 shadow-xl z-30 text-left flex flex-col gap-2.5"
              >
                <div className="w-9 h-9 rounded-full bg-maroon flex items-center justify-center text-white shadow-md shadow-maroon/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-ink/40 leading-none mb-1">Foundations</p>
                  <h5 className="text-[11px] sm:text-xs font-bold text-ink leading-tight">Building Digital Foundations for <span className="text-maroon">Scalable Growth</span></h5>
                </div>
                <div className="w-5 h-[2px] bg-maroon/30 rounded-full mt-0.5"></div>
              </motion.div>

            </div>
          </div>

          {/* Floating Trust Badges Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 p-6 md:p-8 lg:p-10 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-xl lg:divide-x divide-ink/10"
          >
            {[
              { title: '60+ Projects', subtitle: 'Delivered Worldwide', icon: <Rocket className="w-6 h-6 text-maroon" /> },
              { title: <>5.0 <span className="text-maroon font-sans">★</span> Rating</>, subtitle: 'Verified Google Profile', icon: <Star className="w-6 h-6 text-maroon" /> },
              { title: '₹5K Onwards', subtitle: 'Transparent Pricing', icon: <Gem className="w-6 h-6 text-maroon" /> },
              { title: '100% Speed', subtitle: 'SEO & Tech Performance', icon: <Zap className="w-6 h-6 text-maroon" /> }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center px-4 py-2">
                <div className="w-14 h-14 rounded-full bg-maroon/5 border border-maroon/15 flex items-center justify-center mb-4 mx-auto transition-transform duration-300 hover:scale-110">
                  {item.icon}
                </div>
                <h4 className="text-lg md:text-xl font-bold text-ink leading-tight mb-2">{item.title}</h4>
                <p className="text-[10px] uppercase tracking-widest font-bold text-maroon/80 mt-0.5">{item.subtitle}</p>
                <div className="w-7 h-[2px] bg-maroon/30 rounded-full mt-3.5 mx-auto"></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="section-padding">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="max-w-xl">
            <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-2">Our Expertise</h4>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">Tailored Digital Solutions for Modern Brands</h2>
          </div>
          <Link to="/services" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink/60 hover:text-maroon transition-colors group">
            Explore All Services <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Web Development',
              desc: 'High-performance, custom-coded websites that prioritize speed, security, and scalability for your brand.',
              icon: <Zap className="transition-colors duration-300" />,
              image: WEB_IMAGE
            },
            {
              title: 'SEO Optimization',
              desc: 'Dominating search results with data-driven strategies that increase organic traffic and customer conversion.',
              icon: <Target className="transition-colors duration-300" />,
              image: SEO_IMAGE
            },
            {
              title: 'Branding & Design',
              desc: 'Crafting iconic logos, premium UI/UX interfaces, and comprehensive brand kits that resonate with your audience.',
              icon: <Palette className="transition-colors duration-300" />,
              image: BRANDING_IMAGE
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/80 shadow-sm hover:shadow-2xl hover:border-maroon/25 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Animated Top Glow Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-maroon/0 to-transparent group-hover:via-maroon/40 transition-all duration-500"></div>

              <div className="w-12 h-12 bg-maroon/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-maroon group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-2xl font-serif mb-3 text-maroon group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
              <p className="text-sm text-ink/65 leading-relaxed mb-6">{item.desc}</p>
              <div className="aspect-4/3 overflow-hidden rounded-xl mb-2 bg-cream-dark/10 p-2">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="bg-maroon text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end md:justify-between mb-8 gap-4">
            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#FDFBD4] mb-2">Selected Works</h4>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight">Our Portfolio</h2>
            </div>
            <Link to="/portfolio" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-white/70 hover:text-[#FDFBD4] transition-colors group">
              View All Projects <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {projects.slice(0, 4).map((project, i) => (
              <motion.div
                key={project.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group cursor-pointer bg-white/[0.04] backdrop-blur-lg p-4 md:p-6 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                  {/* Premium Browser Header Bar */}
                  <div className="bg-slate-950/80 rounded-t-xl px-4 py-2.5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <span className="text-xs text-white/50 truncate max-w-[220px] font-mono">{project.url.replace('https://', '')}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#FDFBD4] bg-white/10 px-2 py-0.5 rounded">Live</span>
                  </div>

                  {/* Full Uncropped Screenshot Display - 100% width with zero side or vertical cropping */}
                  <div className="w-full rounded-b-xl overflow-hidden relative bg-slate-900">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-auto block object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-white text-maroon text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                        Visit Live Website <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Category */}
                  <div className="mt-4 px-1 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-serif group-hover:text-[#FDFBD4] transition-colors leading-tight">{project.title}</h3>
                      <p className="text-xs uppercase tracking-widest font-semibold text-[#FDFBD4]/80 mt-1">{project.category}</p>
                    </div>
                    <span className="text-xs font-bold text-white/50 group-hover:text-[#FDFBD4] flex items-center gap-1 transition-colors">
                      View <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviews />

      {/* CTA Section */}
      <section className="py-6 md:py-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-maroon rounded-sm p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif mb-6 relative z-10">Ready to elevate your digital presence?</h2>
          <p className="text-base text-white/80 mb-8 max-w-xl mx-auto relative z-10">Let's discuss how we can build something extraordinary together.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/contact" className="bg-white text-maroon px-8 py-3.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-all">
              Start Your Project
            </Link>
            <Link to="/contact" className="border border-white/30 text-white px-8 py-3.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-all">
              Book a Call
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Brands Section */}
      <section className="section-padding bg-cream">
        <div className="text-center mb-10">
          <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-2">Trusted By</h4>
          <h2 className="text-3xl md:text-4xl font-serif">Our Trusted Brands</h2>
        </div>
        
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-8 md:gap-12 py-4"
            animate={{ x: ['0%', '-100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {brands.map((brand, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center justify-center gap-3 min-w-[180px] md:min-w-[220px]">
                <div className="h-16 md:h-20 flex items-center justify-center">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                  />
                </div>
                <p className="text-sm md:text-base font-medium text-ink/70 text-center">{brand.name}</p>
              </div>
            ))}
            {brands.map((brand, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 flex flex-col items-center justify-center gap-3 min-w-[180px] md:min-w-[220px]">
                <div className="h-16 md:h-20 flex items-center justify-center">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                  />
                </div>
                <p className="text-sm md:text-base font-medium text-ink/70 text-center">{brand.name}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const Palette = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.688-1.688h1.91c3.151 0 5.624-2.535 5.624-5.625C22 6.139 17.518 2 12 2z"/>
  </svg>
);

export default Home;
