import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Calendar, Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const message = formData.get('message')?.toString() || '';

    const text = encodeURIComponent(`New lead from website:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`);
    const whatsappNumber = '917675852618';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${text}`;

    window.open(whatsappUrl, '_blank');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="pt-20">
      <section className="section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-serif mb-6">Let's Build Something <span className="text-maroon italic">Remarkable</span> Together.</h1>
          <p className="text-base md:text-lg text-ink/60 max-w-2xl leading-relaxed">
            Whether you're looking to redefine your digital presence or scale your media reach, our studio is ready to collaborate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 flex flex-col gap-6 items-center">
            <div className="bg-white w-full p-8 rounded-sm border border-ink/5 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-maroon/5 rounded-full flex items-center justify-center text-maroon mb-6">
                <Phone size={20} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-ink/40 mb-2">Direct Line</h4>
              <p className="text-base font-serif">7675852618</p>
            </div>

            <div className="bg-white w-full p-8 rounded-sm border border-ink/5 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-maroon/5 rounded-full flex items-center justify-center text-maroon mb-6">
                <Mail size={20} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-ink/40 mb-2">Official Email</h4>
              <p className="text-base font-serif">reachus@ascendmedialabs.in</p>
            </div>

            <div className="bg-white w-full p-8 rounded-sm border border-ink/5 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-maroon/5 rounded-full flex items-center justify-center text-maroon mb-6">
                <MapPin size={20} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-ink/40 mb-2">Studio Address</h4>
              <p className="text-base font-serif">Sagar Nagar, Rushikonda, Vizag</p>
            </div>

            <div className="bg-white w-full p-8 rounded-sm border border-ink/5 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-maroon/5 rounded-full flex items-center justify-center text-maroon mb-6">
                <Calendar size={24} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-ink/40 mb-2">30 Minute Strategy Call</h4>
              <p className="text-md text-ink/60 mb-4">Pick a time that works best for your project kickoff.</p>
              <button className="bg-maroon text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all">Book Now</button>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-10 rounded-sm border border-ink/5 shadow-sm">
            <h3 className="text-3xl font-serif mb-8">Send a Message</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Name</label>
                <input name="name" type="text" placeholder="Your full name" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Email</label>
                <input name="email" type="email" placeholder="email@address.com" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Phone Number</label>
                <input name="phone" type="tel" placeholder="+91" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Message</label>
                <textarea name="message" rows={5} placeholder="How can we help you?" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-maroon text-white py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all flex items-center justify-center gap-3">
                  Submit via WhatsApp <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>


      </section>
    </div>
  );
};

export default Contact;
