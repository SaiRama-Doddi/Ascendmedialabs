import React from 'react';
import { motion } from 'motion/react';
import { Target, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ABOUT_IMAGE, BRANDING_IMAGE } from '../constants';
import GoogleReviews from '../components/GoogleReviews';

const About = () => {
  return (
    <div className="pt-24 bg-cream">
      {/* Hero */}
      <section className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-maroon/5 border border-maroon/15 rounded-full text-xs uppercase tracking-widest font-bold text-maroon mb-6 animate-pulse"
            >
              <Heart size={14} className="text-maroon" />
              Our Creative Journey
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
              About <span className="text-maroon italic">Ascend</span>
            </h1>
            <p className="text-base md:text-lg text-ink/75 leading-relaxed mb-8 text-justify">
              We are a digital atelier dedicated to the craft of high-performance digital products and software engineering. Founded on friendship and sustained by our commitment to engineering excellence, our team combines custom creative strategy, editorial-grade design, and modern frontend architecture to deliver websites that look breathtaking and load instantly.
            </p>
            <p className="text-base md:text-lg text-ink/75 leading-relaxed mb-8 text-justify">
              Every system we engineer is built to adapt and scale, ensuring your business stays ahead of modern web standards. We value boutique craftsmanship, absolute transparency, and measurable business outcomes above all else.
            </p>
            <div className="flex gap-12 border-t border-ink/10 pt-6">
              <div>
                <div className="text-4xl md:text-5xl font-serif text-maroon font-bold mb-1">02</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Founding Partners</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif text-maroon font-bold mb-1">100%</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Client Retention</div>
              </div>
            </div>
          </div>
          <div className="relative group">
            {/* Elegant luxury double border frame */}
            <div className="absolute inset-0 border border-maroon/20 translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <div className="aspect-[4/5] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-white/40">
              <img 
                src={ABOUT_IMAGE} 
                alt="Team" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="section-padding bg-white border-y border-ink/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute inset-0 border border-maroon/20 -translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"></div>
            <div className="aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-white/40">
              <img 
                src={BRANDING_IMAGE} 
                alt="Collaboration" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                referrerPolicy="no-referrer" 
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">A Partnership of Purpose</h2>
            <p className="text-base text-ink/75 leading-relaxed mb-6 text-justify">
              Ascend Media Labs was born from a simple realization between two engineers: the digital design landscape had become unnecessarily complex and bloated. We saw a massive gap between large-scale agencies that charge exorbitant fees and freelancers who struggle to deliver robust systems.
            </p>
            <p className="text-base text-ink/75 leading-relaxed mb-8 text-justify">
              We founded this agency to return to the basics of elite craftsmanship. Our foundation is built on absolute transparency, performance optimization, and the belief that the best work comes from long-term, high-trust partnerships.
            </p>
            <Link to="/contact" className="bg-maroon text-white px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 hover:scale-[1.02] shadow-lg shadow-maroon/20 transition-all inline-block">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviews />

      {/* Core Expertise */}
      <section className="section-padding">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif mb-2 leading-tight">Our Core Expertise</h2>
          <p className="text-xs uppercase tracking-widest font-bold text-maroon">Engineered to elevate modern brands</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/80 shadow-xs hover:border-maroon/20 hover:shadow-2xl transition-all duration-500">
            <Zap className="text-maroon mb-6" size={32} />
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-maroon">Branding & Identity</h3>
            <p className="text-sm text-ink/70 leading-relaxed mb-6 text-justify">
              We define the visual and strategic direction of your business. Our branding workflow is a collaborative editorial journey that uncovers your unique business voice and translates it into a cohesive identity system that commands customer trust.
            </p>
            <div className="flex gap-3">
              <span className="px-3.5 py-1 bg-cream-dark/20 border border-ink/5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink/60">Strategy</span>
              <span className="px-3.5 py-1 bg-cream-dark/20 border border-ink/5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink/60">Visual Systems</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-maroon to-[#a25246] p-8 md:p-12 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-center">
            <Target className="text-[#FDFBD4] mb-6 animate-pulse" size={40} />
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#FDFBD4]">Digital Experiences</h3>
            <p className="text-sm text-white/85 leading-relaxed text-justify">
              We focus on creating immersive, responsive, and performance-optimized user interactions that guide your visitors, maintain user engagement, and convert leads into long-term loyal clients.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/80 shadow-xs hover:border-maroon/20 hover:shadow-2xl transition-all duration-500">
            <Code2 className="text-maroon mb-6" size={32} />
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-maroon">Precision Web Labs</h3>
            <p className="text-sm text-ink/70 leading-relaxed text-justify font-normal">
              High-performance web architecture built for blazing speed, robust security, and technical sustainability. We write clean, optimized TypeScript code that powers the vision without bloat.
            </p>
          </div>

          <div className="bg-cream-dark/20 p-8 md:p-12 rounded-2xl border border-ink/5 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-ink">Simplicity over Sophistication</h3>
            <p className="text-sm text-ink/70 leading-relaxed text-justify">
              We believe that absolute clarity outperforms complex decorations. Our web applications are engineered cleanly, highlighting your product features and scaling effortlessly beyond trend cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Built for long term */}
      <section className="section-padding text-center py-12 md:py-16">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-serif mb-6 leading-tight text-ink"
        >
          Built for the <span className="text-maroon italic">long term</span>
        </motion.h2>
        <p className="text-base md:text-lg text-ink/70 max-w-xl mx-auto mb-10 text-justify md:text-center leading-relaxed">
          We don't just deliver static templates; we build long-term high-trust partnerships. If you are looking for an agency that values technical performance over buzzwords, let's connect.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/contact" className="bg-maroon text-white px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 hover:scale-[1.02] shadow-lg shadow-maroon/20 transition-all text-center">
            Start a Conversation
          </Link>
          <Link to="/portfolio" className="bg-white border border-ink/10 text-ink px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-ink hover:text-white hover:scale-[1.02] shadow-xs transition-all text-center">
            View Portfolio
          </Link>
        </div>
      </section>
    </div>
  );
};

const Code2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
  </svg>
);

export default About;
