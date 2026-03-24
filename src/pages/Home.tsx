import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Play, Users, Target, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECTS, TESTIMONIALS } from '../constants';
import webDevImg from '../assets/webdevelopment.png';
import seoImg from '../assets/seo.png';
import brandImg from '../assets/brandingdesign.png';

const Home = () => {
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const totalPages = Math.ceil(TESTIMONIALS.length / 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonialPage((prev) => (prev + 1) % totalPages);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalPages]);

  const currentTestimonials = TESTIMONIALS.slice(
    currentTestimonialPage * 3,
    (currentTestimonialPage + 1) * 3
  );
  return (
    <div className="pt-10">
      {/* Hero Section */}
      <section className="py-10 md:py-14 px-6 md:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 bg-maroon/5 border border-maroon/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-maroon mb-8"
        >
          Digital Atelier
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-serif leading-tight md:leading-snug mb-8 max-w-5xl"
        >
          We Build Digital <span className="text-maroon italic">Experiences</span><br />
          <span className="block mt-2">to Grow Your Business</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-ink/60 max-w-2xl mb-12 leading-relaxed"
        >
          Modern websites, branding, and growth solutions tailored for your success. We blend editorial aesthetics with functional precision.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-0"
        >
          <Link to="/contact" className="bg-maroon text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-lg shadow-maroon/20">
            Get Started
          </Link>
          <Link to="/portfolio" className="group border border-ink/10 px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-ink hover:text-white transition-all flex items-center justify-center gap-2">
            View Projects <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={14} />
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-cream-dark/30 py-12 border-y border-ink/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Projects Delivered', value: '60+' },
            { label: 'Starting Price', value: '₹5K' },
            { label: 'Responsive Design', value: '100%' },
            { label: 'Expert Support', value: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-serif text-maroon mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-ink/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Expertise Section */}
      <section className="section-padding">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-4">Our Expertise</h4>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">Tailored Digital Solutions for Modern Brands</h2>
          </div>
          <Link to="/services" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink/60 hover:text-maroon transition-colors group">
            Explore All Services <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Web Development',
              desc: 'High-performance, custom-coded websites that prioritize speed, security, and scalability for your brand.',
              icon: <Zap className="transition-colors duration-300" />,
              image: webDevImg
            },
            {
              title: 'SEO Optimization',
              desc: 'Dominating search results with data-driven strategies that increase organic traffic and customer conversion.',
              icon: <Target className="transition-colors duration-300" />,
              image: seoImg
            },
            {
              title: 'Branding & Design',
              desc: 'Crafting iconic logos, premium UI/UX interfaces, and comprehensive brand kits that resonate with your audience.',
              icon: <Palette className="transition-colors duration-300" />,
              image: brandImg
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-sm border border-ink/5 shadow-sm group"
            >
              <div className="w-12 h-12 bg-maroon/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-maroon group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed mb-8">{item.desc}</p>
              <div className="aspect-video overflow-hidden rounded-sm mb-4 bg-white">
                <img src={item.image} alt={item.title} className="w-full h-full object-contain object-center transition-all duration-500" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="bg-ink text-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-4">Selected Works</h4>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">Our Portfolio</h2>
            </div>
            <Link to="/portfolio" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-maroon transition-colors group">
              View All Projects <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {PROJECTS.slice(0, 4).map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm mb-0">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-contain object-center transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-2xl font-serif mb-0 group-hover:text-maroon transition-colors">{project.title}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">{project.category}</p>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-cream overflow-hidden">
        <div className="text-center mb-16">
          <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-4">Client Love</h4>
          <h2 className="text-4xl md:text-5xl font-serif">What They Say</h2>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonialPage}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {currentTestimonials.map((t) => (
                <div key={t.id} className="bg-white p-10 rounded-sm border border-ink/5 shadow-sm flex flex-col h-full min-h-[350px]">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-maroon text-xs">★</span>
                    ))}
                  </div>
                  <div className="flex-grow">
                    <p className="text-lg font-serif italic mb-8 text-ink/80 leading-relaxed">"{t.content}"</p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-ink/5">
                    <div className="w-12 h-12 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-ink">{t.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-ink/40">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTestimonialPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentTestimonialPage === i ? 'bg-maroon w-6' : 'bg-ink/10'
              }`}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="bg-maroon rounded-sm p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif mb-8 relative z-10">Ready to elevate your digital presence?</h2>
          <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto relative z-10">Let's discuss how we can build something extraordinary together.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <Link to="/contact" className="bg-white text-maroon px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-all">
              Start Your Project
            </Link>
            <Link to="/contact" className="border border-white/30 text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-all">
              Book a Call
            </Link>
          </div>
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
