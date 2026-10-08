import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, Calendar, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { emailService } from '../services/emailService';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    if (!name || !email || !phone || !message) {
      setSubmitStatus('error');
      setStatusMessage('Please complete all fields before sending.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      // 1. Save lead in Firebase Firestore
      try {
        await addDoc(collection(db, 'inquiries'), {
          name,
          email,
          phone,
          message,
          status: 'new',
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreError) {
        console.warn('Firestore logging note:', firestoreError);
      }

      // 2. Send Email via EmailJS
      const emailRes = await emailService.sendInquiryEmail({
        name,
        email,
        phone,
        message,
        source: 'Website Contact Page',
      });

      if (emailRes.success) {
        setSubmitStatus('success');
        setStatusMessage('Your inquiry has been sent successfully! Our team will get back to you shortly.');
        formElement.reset();
      } else {
        // Fallback notification
        setSubmitStatus('success');
        setStatusMessage('Thank you! Your inquiry has been received.');
        formElement.reset();
      }
    } catch (error: any) {
      console.error('Inquiry dispatch error:', error);
      setSubmitStatus('error');
      setStatusMessage('Unable to send inquiry at the moment. Please call or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="text-base font-serif font-bold text-ink">
                <a href="tel:+917675852618" className="hover:text-maroon transition-colors">+91 76758 52618</a>
              </p>
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
              <p className="text-base font-serif">Visakhapatnam</p>
            </div>

            <div className="bg-white w-full p-8 rounded-sm border border-ink/5 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-maroon/5 rounded-full flex items-center justify-center text-maroon mb-6">
                <Calendar size={24} />
              </div>
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-ink/40 mb-2">30 Minute Strategy Call</h4>
              <p className="text-md text-ink/60 mb-4">Pick a time that works best for your project kickoff.</p>
              <a
                href="https://calendly.com/prasannaofficial1712/30min"
                target="_blank"
                rel="noreferrer"
                className="bg-maroon text-white px-6 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all"
              >
                Book Now
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-10 rounded-sm border border-ink/5 shadow-sm">
            <h3 className="text-3xl font-serif mb-8">Send a Message</h3>
            
            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm flex items-center gap-3 text-sm"
                >
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-sm flex items-center gap-3 text-sm"
                >
                  <AlertCircle size={18} className="text-red-600 shrink-0" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Name *</label>
                <input required name="name" type="text" placeholder="Your full name" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Email *</label>
                <input required name="email" type="email" placeholder="email@address.com" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Phone Number *</label>
                <input required name="phone" type="tel" placeholder="+91 98765 43210" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Message *</label>
                <textarea required name="message" rows={5} placeholder="How can we help you with your project?" className="bg-cream/50 border border-ink/10 p-4 rounded-sm focus:outline-none focus:border-maroon text-sm resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-maroon text-white py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 disabled:opacity-60 transition-all flex items-center justify-center gap-3 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      Send Message <Send size={16} />
                    </>
                  )}
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
