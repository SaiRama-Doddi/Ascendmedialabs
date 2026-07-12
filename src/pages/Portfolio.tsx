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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer bg-white p-4 rounded-xl border border-ink/5 shadow-sm hover:shadow-lg hover:border-maroon/10 transition-all duration-500"
            >
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-[16/10] overflow-hidden rounded-lg bg-cream-dark/20 relative mb-4">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-maroon text-white text-[10px] uppercase tracking-widest font-bold px-4.5 py-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5">
                      Visit Website <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-maroon">{project.category}</span>
                  <h3 className="text-xl font-serif mt-1 text-ink group-hover:text-maroon transition-colors leading-tight">{project.title}</h3>
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
