import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Search, Palette, Code2, Globe, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const Services = () => {
  return (
    <div className="pt-10">
      {/* Hero */}
      <section className="py-10 md:py-16 px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 bg-maroon/5 border border-maroon/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-maroon mb-8"
        >
          Expertise
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Our Specialized Digital <span className="text-maroon italic">Expertise</span></h1>
        <p className="text-lg text-ink/60 max-w-2xl mx-auto leading-relaxed mb-0">
          We bridge the gap between architectural precision and digital innovation, delivering bespoke solutions that define market leaders.
        </p>
      </section>

      {/* Main Services */}
      <section className="pt-0 pb-12 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-sm border border-ink/5 shadow-sm"
            >
              <div className="w-14 h-14 bg-maroon/5 rounded-sm flex items-center justify-center mb-8">
                {service.id === 'web-dev' && <Code2 className="text-maroon" size={28} />}
                {service.id === 'seo' && <Search className="text-maroon" size={28} />}
                {service.id === 'branding' && <Palette className="text-maroon" size={28} />}
              </div>
              <h3 className="text-2xl font-serif mb-6">{service.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed mb-8">{service.description}</p>
              <ul className="flex flex-col gap-4">
                {service.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink/80">
                    <CheckCircle2 size={16} className="text-maroon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="section-padding bg-cream-dark/20 border-y border-ink/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-serif mb-4">Add-ons & Support</h2>
            <p className="text-sm text-ink/60">Extending your digital capabilities with seamless infrastructure and communication tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Managed Hosting',
              desc: 'Enterprise-grade security and speed for your digital assets.',
              icon: <Globe className="text-maroon" />
            },
            {
              title: 'WhatsApp API',
              desc: 'Direct customer engagement workflows integrated into your site.',
              icon: <ShieldCheck className="text-maroon" />
            },
            {
              title: 'Custom Admin Panels',
              desc: 'Proprietary tools designed for your specific business scaling needs.',
              icon: <Clock className="text-maroon" />
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-sm border border-ink/5 flex items-start gap-6">
              <div className="w-12 h-12 bg-cream flex items-center justify-center rounded-sm shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-widest mb-2">{item.title}</h4>
                <p className="text-xs text-ink/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-16 px-6 md:px-12">
        <div className="bg-maroon rounded-sm p-12 md:p-24 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-serif mb-8">Ready to elevate your digital presence?</h2>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">Join the ranks of high-growth brands that trust Ascend Media Labs for their architectural digital strategy.</p>
          <Link to="/contact" className="bg-white text-maroon px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-cream transition-all inline-block">
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
