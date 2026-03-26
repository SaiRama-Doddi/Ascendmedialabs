import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Target, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';

const About = () => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 bg-maroon/5 border border-maroon/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-maroon mb-8"
            >
              Our Story
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-serif mb-6">About <span className="text-maroon italic">Ascend</span></h1>
            <p className="text-lg text-ink/60 leading-relaxed mb-8">
              We are a digital atelier dedicated to the craft of high-performance experiences. Founded on friendship, sustained by excellence.
              Our team combines strategy, design, and engineering to create websites and campaigns that look beautiful and work hard.
              We don’t chase trends; we build systems that adapt, scale, and stand the test of time.
              Every project is guided by a client-led process, transparent communication, and measurable outcomes.
              When you partner with us, you get both boutique craftsmanship and product-led impact.
            </p>
            <div className="flex gap-12 border-t border-ink/5 pt-8">
              <div>
                <div className="text-4xl font-serif text-maroon mb-1">02</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Founding Partners</div>
              </div>
              <div>
                <div className="text-4xl font-serif text-maroon mb-1">100%</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Client Retention</div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-[4/5] bg-transparent rounded-sm overflow-hidden relative">
                <img src="/src/assets/images/about1.png" alt="Team" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
             <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-maroon/10 rounded-sm -z-10"></div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="section-padding bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <img src="/src/assets/images/about1.png" alt="Collaboration" className="rounded-sm shadow-2xl" referrerPolicy="no-referrer" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-serif mb-8">A Partnership of Purpose</h2>
            <p className="text-ink/60 leading-relaxed mb-6">
              Ascend Media Labs was born from a simple realization between two friends: the digital landscape had become unnecessarily complex. We saw a gap between bloated agencies and uninspired freelancers.
            </p>
            <p className="text-ink/60 leading-relaxed mb-8">
              We founded this agency to return to the basics of elite craftsmanship. Our foundation is built on absolute transparency, relentless performance, and the belief that the best work comes from long-term, high-trust partnerships.
            </p>
            <Link to="/contact" className="bg-maroon text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all inline-block">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="section-padding bg-cream">
        <div className="text-center mb-12">
          <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-4">Client Testimonials</h4>
          <h2 className="text-4xl md:text-5xl font-serif">Trusted by brands that scale</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.slice(0, 4).map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-sm border border-ink/10 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-maroon" />
                <div>
                  <h4 className="text-sm font-semibold">{t.name}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-ink/50">{t.role}, {t.company}</p>
                </div>
              </div>
              <p className="text-sm text-ink/70 leading-relaxed">“{t.content}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Expertise */}
      <section className="section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 underline decoration-maroon decoration-2 underline-offset-8">Our Core Expertise</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-maroon/5 p-12 rounded-sm border border-maroon/10">
            <Zap className="text-maroon mb-8" size={32} />
            <h3 className="text-3xl font-serif mb-6">Branding & Identity</h3>
            <p className="text-ink/60 leading-relaxed mb-8">
              We define the soul of your business. Our branding process is an editorial journey that uncovers your unique voice and translates it into a visual language that commands respect.
            </p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-white border border-ink/5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink/60">Strategy</span>
              <span className="px-3 py-1 bg-white border border-ink/5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink/60">Visual Systems</span>
            </div>
          </div>
          <div className="bg-maroon p-12 rounded-sm text-white flex flex-col justify-center items-center text-center">
            <Target className="text-white mb-8" size={48} />
            <h3 className="text-3xl font-serif mb-6">Digital Experiences</h3>
            <p className="text-white/70 leading-relaxed">
              Immersive, fluid, and intentional interactions that keep users engaged and drive conversion.
            </p>
          </div>
          <div className="bg-white p-12 rounded-sm border border-ink/5 shadow-sm">
            <Code2 className="text-maroon mb-8" size={32} />
            <h3 className="text-3xl font-serif mb-6">Precision Web Labs</h3>
            <p className="text-ink/60 leading-relaxed">
              Websites built for performance, speed, and longevity. We focus on the code that powers the vision.
            </p>
          </div>
          <div className="bg-cream-dark/30 p-12 rounded-sm border border-ink/5 flex flex-col justify-center">
            <h3 className="text-3xl font-serif mb-6">Simplicity over Sophistication</h3>
            <p className="text-ink/60 leading-relaxed">
              We believe that true luxury is found in the removal of the unnecessary. Our work is clean, functional, and built to last beyond the current trend cycle.
            </p>
          </div>
        </div>
      </section>

      {/* Built for long term */}
      <section className="section-padding text-center py-12">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-serif mb-6 leading-[0.8] tracking-tighter"
        >
          Built for the <span className="text-maroon italic">long term</span>
        </motion.h2>
        <p className="text-lg text-ink/60 max-w-2xl mx-auto mb-12">
          We don't just deliver projects; we cultivate growth. If you are looking for an agency that values performance over buzzwords, let's talk.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/contact" className="bg-maroon text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all">
            Start a Conversation
          </Link>
          <Link to="/portfolio" className="border border-ink/10 px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-ink hover:text-white transition-all">
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
