import React from 'react';
import { motion } from 'motion/react';
import { PROJECTS } from '../constants';
import { Link } from 'react-router-dom';

const Portfolio = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="block aspect-[16/10] overflow-hidden rounded-sm mb-8 bg-transparent">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </a>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif mb-3 group-hover:text-maroon transition-colors">
                    <a href={project.url} target="_blank" rel="noopener noreferrer">{project.title}</a>
                  </h3>
                  <p className="text-xs uppercase tracking-widest font-bold text-maroon">{project.category}</p>
                </div>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white text-maroon flex items-center justify-center border border-ink/10 hover:bg-white/90 hover:text-maroon transition-all">
                   <ArrowUpRight size={20} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="bg-ink text-white rounded-sm p-12 md:p-24 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-8">Have a vision in mind?</h2>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto">Let's translate your ideas into a world-class digital experience.</p>
          <Link to="/contact" className="bg-maroon text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all inline-block">
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
