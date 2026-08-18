import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PROJECTS, Project } from '../constants';
import { Link } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { ArrowRight } from 'lucide-react';

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  useEffect(() => {
    let active = true;
    portfolioService.getProjects().then((data) => {
      if (active) {
        setProjects(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pt-10">
      <section className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-maroon mb-4">Our Work</h4>
          <h1 className="text-4xl md:text-5xl font-serif mb-8">Recent <span className="text-maroon italic">Creations</span></h1>
          <p className="text-lg text-ink/60 max-w-2xl mx-auto leading-relaxed">
            Selected projects that define our commitment to digital excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer bg-white p-5 md:p-6 rounded-2xl border border-ink/10 shadow-md hover:shadow-2xl hover:border-maroon/20 transition-all duration-500"
            >
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                {/* Browser Header Bar */}
                <div className="bg-slate-900 rounded-t-xl px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="text-xs text-white/50 font-mono truncate max-w-[220px]">{project.url.replace('https://', '')}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-maroon px-2 py-0.5 rounded">Live Project</span>
                </div>

                {/* Full Uncropped Screenshot View - 100% width with zero cropping */}
                <div className="w-full rounded-b-xl overflow-hidden relative mb-4 bg-slate-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto block object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-maroon text-white text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                      Visit Live Website <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                <div className="px-1 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold text-maroon">{project.category}</span>
                    <h3 className="text-xl md:text-2xl font-serif mt-0.5 text-ink group-hover:text-maroon transition-colors leading-tight">{project.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-ink/40 group-hover:text-maroon flex items-center gap-1 transition-colors">
                    Visit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="bg-maroon text-white rounded-sm p-12 md:p-24 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-8">Have a vision in mind?</h2>
          <p className="text-lg text-white mb-12 max-w-xl mx-auto">Let's translate your ideas into a world-class digital experience.</p>
          <Link to="/contact" className="bg-white text-maroon px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:text-maroon/80 hover:bg-white/90 transition-all inline-block">
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
};

const ArrowUpRight = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
  </svg>
);

export default Portfolio;
