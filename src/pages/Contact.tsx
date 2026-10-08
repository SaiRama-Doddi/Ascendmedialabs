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
    
    // Strict phone number typing restriction (digits and leading + only)
    if (fieldName === 'phone') {
      let sanitized = value.replace(/[^\d+]/g, '');
      if (sanitized.startsWith('+')) {
        sanitized = '+' + sanitized.slice(1).replace(/\+/g, '');
      } else {
        sanitized = sanitized.replace(/\+/g, '');
      }
      if (sanitized.length > 15) {
        sanitized = sanitized.slice(0, 15);
      }
      setFormData((prev) => ({ ...prev, phone: sanitized }));
      if (touched.phone) {
        const error = validateField('phone', sanitized);
        setErrors((prev) => ({ ...prev, phone: error }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation, control keys, numbers and single +
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
    if (allowedControlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (e.key === '+' && (formData.phone.length === 0 || !formData.phone.includes('+'))) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
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
    <div className="pt-20 md:pt-24 pb-6 md:pb-8 bg-gradient-to-b from-[#FDFBF7] via-[#F8F4EE] to-[#F3EEE5] min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Unified 2-Column Responsive Layout Fitting Full Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Studio Concierge & Strategy Call (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 flex flex-col gap-4 justify-between"
          >
            {/* Direct Studio Channels Card */}
            <div className="bg-white/95 backdrop-blur-md border border-maroon/10 rounded-2xl p-5 sm:p-6 shadow-lg shadow-maroon/5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-maroon/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
              
              <div className="border-b border-ink/10 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-maroon block mb-0.5">
                    Studio Atelier
                  </span>
                  <h3 className="text-xl font-serif text-ink font-bold">Contact Concierge</h3>
                </div>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Support
                </div>
              </div>

              {/* Contact Channels */}
              <div className="flex flex-col gap-3">
                {/* Direct Phone */}
                <a
                  href="tel:+917675852618"
                  className="group flex items-center gap-3.5 p-3 rounded-xl border border-ink/5 hover:border-maroon/20 bg-[#FAF7F2]/60 hover:bg-white transition-all duration-200 hover:shadow-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-maroon/10 group-hover:bg-maroon text-maroon group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-ink/50">Direct Phone / WhatsApp</span>
                    <span className="text-sm font-sans font-bold tracking-tight text-ink group-hover:text-maroon transition-colors mt-0.5">
                      +91 76758 52618
                    </span>
                  </div>
                </a>

                {/* Email Address */}
                <a
                  href="mailto:reachus@ascendmedialabs.in"
                  className="group flex items-center gap-3.5 p-3 rounded-xl border border-ink/5 hover:border-maroon/20 bg-[#FAF7F2]/60 hover:bg-white transition-all duration-200 hover:shadow-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-maroon/10 group-hover:bg-maroon text-maroon group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-ink/50">Official Email</span>
                    <span className="text-sm font-sans font-semibold text-ink group-hover:text-maroon transition-colors break-all mt-0.5">
                      reachus@ascendmedialabs.in
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl border border-ink/5 bg-[#FAF7F2]/60">
                  <div className="w-9 h-9 rounded-lg bg-maroon/10 text-maroon flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-ink/50">Studio Headquarters</span>
                    <span className="text-xs font-sans font-semibold text-ink mt-0.5">Visakhapatnam, AP, India</span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="pt-2 border-t border-ink/5 flex items-center justify-between text-[11px] text-ink/60">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-maroon" /> Mon – Sat: 9:00 AM – 7:00 PM
                </span>
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <ShieldCheck size={12} className="text-emerald-600" /> Confidential
                </span>
              </div>
            </div>

            {/* Strategy Call Booking Card */}
            <div className="bg-gradient-to-br from-maroon via-[#7B192A] to-[#60111F] rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-maroon/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-2">
                  <Calendar size={11} /> 1-on-1 Strategy Session
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-1.5 leading-snug">
                  Prefer a 30-Minute Call?
                </h3>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  Book a direct roadmap session on our calendar with our technical lead.
                </p>
              </div>

              <a
                href="https://calendly.com/prasannaofficial1712/30min"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-white text-maroon hover:bg-cream py-3 rounded-xl text-[11px] uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                <span>Book Strategy Call</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Compact Bespoke Inquiry Form Card (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-maroon/10 rounded-2xl p-6 sm:p-7 md:p-8 shadow-2xl shadow-maroon/5 relative overflow-hidden h-full flex flex-col justify-between">
              
              {/* Form Title */}
              <div className="mb-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-maroon">
                    Direct Atelier Inquiry
                  </span>
                  <span className="text-[10px] text-ink/50 font-medium">
                    * Required fields
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-ink font-bold">
                  Send a Message
                </h2>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2.5 text-xs animate-shake">
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
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
                    className="py-8 px-4 flex flex-col items-center text-center my-auto"
                  >
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                      <CheckCircle2 size={32} className="stroke-[2.5]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif text-ink mb-2 font-bold">
                      Inquiry Received Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-ink/70 max-w-md mb-6 leading-relaxed">
                      Thank you, <strong className="text-ink">{formData.name}</strong>. Our lead consultant will review your inquiry and connect with you at <strong className="text-ink">{formData.email}</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                      <button
                        onClick={handleResetForm}
                        className="flex-1 bg-maroon text-white py-3 px-5 rounded-xl text-[11px] uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-md cursor-pointer"
                      >
                        New Inquiry
                      </button>
                      <a
                        href={`https://wa.me/917675852618?text=${encodeURIComponent(`Hi Ascend Media Labs, I just submitted an inquiry for ${formData.service}. My name is ${formData.name}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl text-[11px] uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <form key="contact-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    
                    {/* Service Selection Pills */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-ink/65 flex items-center gap-1">
                        <Sparkles size={11} className="text-maroon" /> Select Service
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICES_LIST.map((srv) => {
                          const isSelected = formData.service === srv;
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, service: srv }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-maroon text-white shadow-xs font-semibold'
                                  : 'bg-[#FAF6F0] text-ink/75 hover:bg-[#F3ECE0] hover:text-ink border border-ink/5'
                              }`}
                            >
                              {isSelected && <Check size={11} className="stroke-[3]" />}
                              <span>{srv}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* Full Name */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-ink/65">
                            Full Name <span className="text-maroon">*</span>
                          </label>
                          {touched.name && !errors.name && formData.name && (
                            <span className="text-emerald-600 text-[9px] font-bold flex items-center gap-0.5">
                              <Check size={10} /> Valid
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink/40">
                            <User size={15} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Your name"
                            className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2]/60 rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink/35 border transition-all outline-none ${
                              touched.name && errors.name
                                ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-1 focus:ring-maroon/20'
                            }`}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <span className="text-[10px] text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} className="shrink-0" /> {errors.name}
                          </span>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-ink/65">
                            Work Email <span className="text-maroon">*</span>
                          </label>
                          {touched.email && !errors.email && formData.email && (
                            <span className="text-emerald-600 text-[9px] font-bold flex items-center gap-0.5">
                              <Check size={10} /> Valid
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink/40">
                            <Mail size={15} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="email@address.com"
                            className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2]/60 rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink/35 border transition-all outline-none ${
                              touched.email && errors.email
                                ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                                : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-1 focus:ring-maroon/20'
                            }`}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <span className="text-[10px] text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} className="shrink-0" /> {errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Number (Strictly Digits Only) */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-ink/65">
                          Phone Number <span className="text-maroon">*</span>
                        </label>
                        {touched.phone && !errors.phone && formData.phone && (
                          <span className="text-emerald-600 text-[9px] font-bold flex items-center gap-0.5">
                            <Check size={10} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink/40">
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel"
                          inputMode="tel"
                          pattern="[0-9+]*"
                          maxLength={15}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onKeyDown={handlePhoneKeyDown}
                          onBlur={handleBlur}
                          placeholder="+91 98765 43210 (digits only)"
                          className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2]/60 rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink/35 border font-sans transition-all outline-none ${
                            touched.phone && errors.phone
                              ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                              : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-1 focus:ring-maroon/20'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <span className="text-[10px] text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} className="shrink-0" /> {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-ink/65">
                          Message <span className="text-maroon">*</span>
                        </label>
                        <span className={`text-[9px] font-mono ${formData.message.length >= 10 ? 'text-ink/50' : 'text-amber-700'}`}>
                          {formData.message.length} chars {formData.message.length < 10 ? '(min 10)' : ''}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute top-2.5 left-3 pointer-events-none text-ink/40">
                          <MessageSquare size={15} />
                        </div>
                        <textarea
                          rows={3}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="How can we help you?"
                          className={`w-full pl-9 pr-3 py-2 bg-[#FAF7F2]/60 rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink/35 border transition-all outline-none resize-none ${
                            touched.message && errors.message
                              ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                              : 'border-ink/15 focus:border-maroon focus:bg-white focus:ring-1 focus:ring-maroon/20'
                          }`}
                        />
                      </div>
                      {touched.message && errors.message && (
                        <span className="text-[10px] text-red-600 flex items-center gap-1">
                          <AlertCircle size={10} className="shrink-0" /> {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-maroon via-[#8B2032] to-maroon text-white py-3.5 px-6 rounded-xl text-[11px] uppercase tracking-[0.2em] font-bold hover:brightness-110 active:scale-[0.99] disabled:opacity-60 transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-white" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send size={14} />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-ink/45">
                      🔒 Guaranteed 100% confidential. Replies sent within 2–4 hours.
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
