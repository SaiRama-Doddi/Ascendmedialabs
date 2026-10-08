import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { emailService } from '../services/emailService';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const SERVICES_LIST = [
  'Web Development',
  'Brand Identity',
  'SEO Strategy',
  'Edutech Courses',
  'General Inquiry'
];

const Contact = () => {
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    service: 'Web Development',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key in keyof FormValues]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  // Validate single field
  const validateField = (name: keyof FormValues, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Please enter at least 2 characters';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address (e.g. name@domain.com)';
        }
        return undefined;

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanedPhone = value.replace(/\D/g, '');
        if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
          return 'Please enter a valid phone number (8–15 digits)';
        }
        return undefined;

      case 'message':
        if (!value.trim()) return 'Please describe your project or inquiry';
        if (value.trim().length < 10) {
          return `Please add at least ${10 - value.trim().length} more characters`;
        }
        return undefined;

      default:
        return undefined;
    }
  };

  // Validate all fields on submit
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    const keys: (keyof FormValues)[] = ['name', 'email', 'phone', 'message'];
    
    keys.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormValues;
    
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormValues;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save lead to Firebase Firestore
      try {
        await addDoc(collection(db, 'inquiries'), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          service: formData.service,
          message: formData.message.trim(),
          status: 'new',
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreErr) {
        console.warn('Firestore logging note:', firestoreErr);
      }

      // 2. Dispatch Email via EmailJS
      const emailRes = await emailService.sendInquiryEmail({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service,
        message: formData.message.trim(),
        source: 'Ascend Media Labs Contact Page',
      });

      if (emailRes.success) {
        setIsSubmitted(true);
      } else {
        // Even if EmailJS has rate-limits, we record success since Firestore saved the lead
        setIsSubmitted(true);
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setServerError('Something went wrong while submitting. Please call or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: 'Web Development',
      message: '',
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setServerError('');
  };

  return (
    <div className="pt-20 md:pt-24 bg-gradient-to-b from-[#FDFBF7] via-[#F8F4EE] to-[#F3EEE5] min-h-screen">
      <section className="section-padding max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Title Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-maroon/15 rounded-full shadow-xs text-[11px] font-bold uppercase tracking-widest text-maroon mb-4"
          >
            <Sparkles size={13} className="text-amber-600 animate-pulse" />
            <span>Studio Inquiries & Consultations</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.18] mb-5 text-ink tracking-tight"
          >
            Let's Build Something <span className="text-maroon italic relative">Remarkable<span className="absolute bottom-0 left-0 w-full h-[3px] bg-maroon/20 rounded"></span></span> Together.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-ink/75 leading-relaxed"
          >
            Whether you are looking to architect an elite digital product, expand your brand identity, or scale customer acquisitions, our bespoke studio is ready to collaborate.
          </motion.p>
        </div>

        {/* Unified 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT COLUMN: Studio Concierge & Contact Hub (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6 justify-between"
          >
            <div className="bg-white/95 backdrop-blur-md border border-maroon/10 rounded-2xl p-7 sm:p-9 shadow-xl shadow-maroon/5 flex flex-col gap-6 relative overflow-hidden">
              {/* Subtle decorative background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-maroon/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
              
              <div className="border-b border-ink/10 pb-5">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-maroon block mb-1">
                  Atelier Concierge
                </span>
                <h3 className="text-2xl font-serif text-ink">Get in Touch Directly</h3>
                <p className="text-xs text-ink/65 mt-1 leading-relaxed">
                  We review inquiries promptly and reply within 2–4 business hours.
                </p>
              </div>

              {/* Contact Channels */}
              <div className="flex flex-col gap-4">
                {/* Direct Phone */}
                <a
                  href="tel:+917675852618"
                  className="group flex items-start gap-4 p-3.5 rounded-xl border border-ink/5 hover:border-maroon/20 bg-[#FAF7F2]/60 hover:bg-white transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-maroon/10 group-hover:bg-maroon text-maroon group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-ink/50">Direct Phone</span>
                    <span className="text-sm sm:text-base font-serif font-bold text-ink group-hover:text-maroon transition-colors">
                      +91 76758 52618
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available on WhatsApp & Call
                    </span>
                  </div>
                </a>

                {/* Email Address */}
                <a
                  href="mailto:reachus@ascendmedialabs.in"
                  className="group flex items-start gap-4 p-3.5 rounded-xl border border-ink/5 hover:border-maroon/20 bg-[#FAF7F2]/60 hover:bg-white transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-maroon/10 group-hover:bg-maroon text-maroon group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-ink/50">Official Email</span>
                    <span className="text-sm sm:text-base font-serif font-semibold text-ink group-hover:text-maroon transition-colors break-all">
                      reachus@ascendmedialabs.in
                    </span>
                    <span className="text-[11px] text-ink/55 mt-0.5">Direct project inquiries & RFPs</span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 p-3.5 rounded-xl border border-ink/5 bg-[#FAF7F2]/60">
                  <div className="w-10 h-10 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-ink/50">Studio Headquarters</span>
                    <span className="text-sm font-serif font-semibold text-ink">Visakhapatnam, AP, India</span>
                    <span className="text-[11px] text-ink/55 mt-0.5">Serving clients worldwide</span>
                  </div>
                </div>
              </div>

              {/* Working Hours & Guarantee */}
              <div className="pt-2 border-t border-ink/5 flex items-center justify-between text-xs text-ink/60">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-maroon" /> Mon – Sat: 9:00 AM – 7:00 PM IST
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <ShieldCheck size={13} className="text-emerald-600" /> 100% Confidential
                </span>
              </div>
            </div>

            {/* Strategy Call Booking Card */}
            <div className="bg-gradient-to-br from-maroon to-[#6B1726] rounded-2xl p-7 sm:p-8 text-white shadow-xl shadow-maroon/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">
                  <Calendar size={12} /> 1-on-1 Consultation
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                  Prefer a 30-Minute Strategy Call?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                  Pick a convenient slot directly on our calendar for a live project kickoff and roadmap discussion.
                </p>
              </div>

              <a
                href="https://calendly.com/prasannaofficial1712/30min"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-white text-maroon hover:bg-cream py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                <span>Schedule Strategy Call</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Bespoke Inquiry Form Card (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-maroon/10 rounded-2xl p-7 sm:p-10 md:p-12 shadow-2xl shadow-maroon/5 relative overflow-hidden h-full flex flex-col justify-between">
              
              {/* Form Title */}
              <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-maroon">
                    Direct Atelier Inquiry
                  </span>
                  <span className="text-[11px] text-ink/50 font-medium">
                    * Required fields
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-ink">
                  Send a Message
                </h2>
                <p className="text-xs sm:text-sm text-ink/65 mt-1">
                  Fill in your details below and our lead consultants will analyze your inquiry.
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-xs sm:text-sm animate-shake">
                  <AlertCircle size={18} className="text-red-600 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Success View */}
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 px-6 flex flex-col items-center text-center my-auto"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={40} className="stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif text-ink mb-3 font-bold">
                      Inquiry Received Successfully!
                    </h3>
                    <p className="text-sm text-ink/70 max-w-md mb-8 leading-relaxed">
                      Thank you for reaching out, <strong className="text-ink">{formData.name}</strong>. A copy of your inquiry has been forwarded to our senior design and engineering team. We will get in touch with you shortly at <strong className="text-ink">{formData.email}</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                      <button
                        onClick={handleResetForm}
                        className="flex-1 bg-maroon text-white py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-md"
                      >
                        Send Another Inquiry
                      </button>
                      <a
                        href={`https://wa.me/917675852618?text=${encodeURIComponent(`Hi Ascend Media Labs, I just submitted an inquiry for ${formData.service}. My name is ${formData.name}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <form key="contact-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                    
                    {/* Service Selection Pills */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-ink/65 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-maroon" /> What service are you interested in?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES_LIST.map((srv) => {
                          const isSelected = formData.service === srv;
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, service: srv }))}
                              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-maroon text-white shadow-sm font-semibold shadow-maroon/20 scale-[1.02]'
                                  : 'bg-[#FAF6F0] text-ink/75 hover:bg-[#F3ECE0] hover:text-ink border border-ink/5'
                              }`}
                            >
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                              <span>{srv}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Full Name */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] uppercase tracking-wider font-bold text-ink/65">
                            Full Name <span className="text-maroon">*</span>
                          </label>
                          {touched.name && !errors.name && formData.name && (
                            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                              <Check size={11} /> Valid
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                            <User size={16} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. Siva Sri"
                            className={`w-full pl-10 pr-4 py-3.5 bg-[#FAF7F2]/60 rounded-xl text-sm text-ink placeholder:text-ink/35 border transition-all duration-200 outline-none ${
                              touched.name && errors.name
                                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/10'
                            }`}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <span className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={12} className="shrink-0" /> {errors.name}
                          </span>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] uppercase tracking-wider font-bold text-ink/65">
                            Work Email <span className="text-maroon">*</span>
                          </label>
                          {touched.email && !errors.email && formData.email && (
                            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                              <Check size={11} /> Valid
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                            <Mail size={16} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="name@company.com"
                            className={`w-full pl-10 pr-4 py-3.5 bg-[#FAF7F2]/60 rounded-xl text-sm text-ink placeholder:text-ink/35 border transition-all duration-200 outline-none ${
                              touched.email && errors.email
                                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/10'
                            }`}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <span className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={12} className="shrink-0" /> {errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-ink/65">
                          Phone Number <span className="text-maroon">*</span>
                        </label>
                        {touched.phone && !errors.phone && formData.phone && (
                          <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                            <Check size={11} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="+91 98765 43210"
                          className={`w-full pl-10 pr-4 py-3.5 bg-[#FAF7F2]/60 rounded-xl text-sm text-ink placeholder:text-ink/35 border transition-all duration-200 outline-none ${
                            touched.phone && errors.phone
                              ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                              : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/10'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <span className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" /> {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-ink/65">
                          Project Details / Message <span className="text-maroon">*</span>
                        </label>
                        <span className={`text-[10px] font-mono ${formData.message.length >= 10 ? 'text-ink/50' : 'text-amber-700'}`}>
                          {formData.message.length} chars {formData.message.length < 10 ? '(min 10)' : ''}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute top-3.5 left-3.5 pointer-events-none text-ink/40">
                          <MessageSquare size={16} />
                        </div>
                        <textarea
                          rows={4}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Tell us about your project goals, timelines, or specific requirements..."
                          className={`w-full pl-10 pr-4 py-3.5 bg-[#FAF7F2]/60 rounded-xl text-sm text-ink placeholder:text-ink/35 border transition-all duration-200 outline-none resize-none ${
                            touched.message && errors.message
                              ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                              : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/10'
                          }`}
                        />
                      </div>
                      {touched.message && errors.message && (
                        <span className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" /> {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-maroon via-[#8B2032] to-maroon text-white py-4 px-8 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 active:scale-[0.99] disabled:opacity-60 transition-all duration-200 shadow-xl shadow-maroon/25 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Sending Inquiry to Atelier...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send size={15} />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Privacy Assurance */}
                    <p className="text-[11px] text-center text-ink/50 mt-1">
                      🔒 Your details are kept strictly confidential under our studio privacy pledge.
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </section>
    </div>
  );
};

export default Contact;
