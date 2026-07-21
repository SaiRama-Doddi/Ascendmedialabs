import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  BrainCircuit, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Palette, 
  Database, 
  Search, 
  Clock, 
  Award, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  BookOpen, 
  Laptop, 
  UserCheck, 
  MessageSquare,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Course {
  id: string;
  title: string;
  category: 'web' | 'ai' | 'cloud' | 'cyber' | 'core';
  description: string;
  duration: string;
  level: string;
  mode: string;
  icon: React.ReactNode;
  popular?: boolean;
  topics: string[];
}

const COURSES: Course[] = [
  {
    id: 'frontend-web',
    title: 'Frontend Web Engineering',
    category: 'web',
    description: 'Master frontend architecture from scratch. Build pixel-perfect interfaces using HTML5, CSS3, ES6 JavaScript, React 19, and Tailwind CSS.',
    duration: '12 Weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online Live & Classroom',
    icon: <Code2 size={24} className="text-[#4285F4]" />,
    popular: true,
    topics: ['HTML5 Semantic Elements & SEO', 'CSS3 Flexbox, Grid & Animations', 'Modern ES6+ JavaScript & APIs', 'React 19 Hooks & State Management', 'Tailwind CSS & Responsive Layouts', 'Git, GitHub & Netlify/Vercel Deployment']
  },
  {
    id: 'backend-web',
    title: 'Backend Web Engineering',
    category: 'web',
    description: 'Build scalable, secure servers and API gateways. Master Node.js, Express, middleware engineering, JWT authentication, and server setups.',
    duration: '12 Weeks',
    level: 'Intermediate',
    mode: 'Online Live',
    icon: <Cpu size={24} className="text-[#EA4335]" />,
    topics: ['Node.js Event Loop & File Systems', 'Express Server & RESTful APIs', 'JWT & Secure User Authentication', 'Middlewares, Cors & Error Handling', 'Postman Testing & API Documentation', 'Heroku, Render & AWS EC2 Deployments']
  },
  {
    id: 'database-systems',
    title: 'Database Systems & SQL Engineering',
    category: 'core',
    description: 'Master relational and document database architectures. Learn schema design, index optimization, SQL scripting, and MongoDB aggregations.',
    duration: '8 Weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online Live',
    icon: <Database size={24} className="text-[#FBBC05]" />,
    topics: ['Relational DBs (PostgreSQL & MySQL)', 'SQL Queries, Joins & Subqueries', 'NoSQL DBs (MongoDB Document Model)', 'Indexes, Performance Tuning & Views', 'Transactions, ACID Properties & Security', 'Database Backup, Restore & Scaling']
  },
  {
    id: 'fullstack-web',
    title: 'Full-Stack Web Engineering',
    category: 'web',
    description: 'Master modern full-stack development. Integrate client frontends with backend APIs and cloud deployment pipelines in one program.',
    duration: '16 Weeks',
    level: 'Beginner to Advanced',
    mode: 'Online Live & Classroom',
    icon: <Code2 size={24} className="text-[#4285F4]" />,
    popular: true,
    topics: ['React 19 & TypeScript', 'Next.js 15 App Router', 'Node.js & Express API', 'MongoDB & PostgreSQL', 'Tailwind CSS & Motion', 'Vercel & AWS Deployment']
  },
  {
    id: 'python-ai',
    title: 'Python, AI & Data Science',
    category: 'ai',
    description: 'Dive deep into Artificial Intelligence, Machine Learning models, Neural Networks, and Generative AI application development with Python.',
    duration: '16 Weeks',
    level: 'Intermediate',
    mode: 'Online Live',
    icon: <BrainCircuit size={24} className="text-[#34A853]" />,
    popular: true,
    topics: ['Python Data Stack (Pandas/NumPy)', 'Machine Learning Algorithms', 'Deep Learning & PyTorch', 'Generative AI & LLM APIs', 'Computer Vision & NLP', 'Model Deployment & MLOps']
  },
  {
    id: 'java-fullstack',
    title: 'Java Full Stack & Microservices',
    category: 'core',
    description: 'Build enterprise-grade software architecture using Java 21, Spring Boot 3, Microservices, and scalable RESTful API design.',
    duration: '16 Weeks',
    level: 'Intermediate to Advanced',
    mode: 'Classroom & Online',
    icon: <Cpu size={24} className="text-[#EA4335]" />,
    topics: ['Java 21 Core & Multithreading', 'Spring Boot 3 & Spring Security', 'Hibernate & JPA Persistence', 'Microservices & Docker', 'Apache Kafka & Redis', 'System Design & REST APIs']
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Computing & DevOps',
    category: 'cloud',
    description: 'Learn infrastructure as code, container orchestration, and continuous integration/continuous deployment across AWS and Azure cloud.',
    duration: '12 Weeks',
    level: 'Intermediate',
    mode: 'Online Live',
    icon: <Cloud size={24} className="text-[#FBBC05]" />,
    topics: ['AWS Core Services (EC2, S3, RDS)', 'Docker & Containerization', 'Kubernetes Cluster Ops', 'Terraform Infrastructure', 'CI/CD Pipelines (GitHub Actions)', 'Linux Admin & Bash Scripting']
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security & Ethical Hacking',
    category: 'cyber',
    description: 'Master offensive and defensive security strategies, network penetration testing, web app vulnerability assessment, and threat response.',
    duration: '12 Weeks',
    level: 'Beginner to Intermediate',
    mode: 'Classroom & Online',
    icon: <ShieldCheck size={24} className="text-[#4285F4]" />,
    topics: ['Network Security & Wireshark', 'Web App Security (OWASP Top 10)', 'Metasploit & Penetration Testing', 'SOC Operations & Incident Handling', 'Cryptography & Linux Security', 'CEH Exam Preparation']
  },
  {
    id: 'dsa-system-design',
    title: 'Data Structures & Algorithms (DSA)',
    category: 'core',
    description: 'Crack top tech company coding interviews. Master problem solving with DSA patterns and High-Level / Low-Level System Design.',
    duration: '10 Weeks',
    level: 'All Levels',
    mode: 'Online Live',
    icon: <Database size={24} className="text-[#34A853]" />,
    popular: true,
    topics: ['Arrays, HashMaps & Two Pointers', 'Trees, Graphs & BFS/DFS', 'Dynamic Programming Patterns', '300+ LeetCode Solved Problems', 'Low-Level System Design (LLD)', 'High-Level System Design (HLD)']
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design & Frontend Art',
    category: 'web',
    description: 'Learn modern visual design, wireframing, prototyping in Figma, user research, and converting designs into perfect interfaces.',
    duration: '10 Weeks',
    level: 'Beginner',
    mode: 'Classroom & Online',
    icon: <Palette size={24} className="text-[#EA4335]" />,
    topics: ['Figma Design Masterclass', 'Wireframing & User Flows', 'Design Systems & Tokens', 'Micro-Animations & Interaction', 'Responsive UI Layouts', 'HTML5/CSS3 & React Styling']
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics & Business Intelligence',
    category: 'ai',
    description: 'Transform raw data into actionable business insights using Advanced SQL, Power BI, Python for Data Analysis, and Excel modeling.',
    duration: '10 Weeks',
    level: 'Beginner',
    mode: 'Online Live',
    icon: <Database size={24} className="text-[#FBBC05]" />,
    topics: ['Advanced SQL Querying', 'Power BI Dashboarding', 'Python Data Cleaning', 'Excel Data Modeling', 'Statistical Analysis', 'Business Insight Reporting']
  }
];

const Edutech = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Registration form states
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].title);
  const [qualification, setQualification] = useState('B.Tech / Degree Student');
  const [batchMode, setBatchMode] = useState('Online Live');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const registrationFormRef = useRef<HTMLDivElement>(null);

  const filteredCourses = COURSES.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleWhatsAppEnquiry = (courseTitle?: string) => {
    const targetCourse = courseTitle || selectedCourse;
    const whatsappNum = '+917675852618';
    const text = encodeURIComponent(
      `Hi Ascend Media Labs (Edutech), I am interested in joining the "${targetCourse}" course. Please share syllabus, fees, and batch timing details.`
    );
    window.open(`https://wa.me/${whatsappNum}?text=${text}`, '_blank');
  };

  const handleCourseRegisterClick = (courseTitle: string) => {
    setSelectedCourse(courseTitle);
    if (registrationFormRef.current) {
      registrationFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !email || !phone) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'edutech_registrations'), {
        studentName,
        email,
        phone,
        selectedCourse,
        qualification,
        batchMode,
        message,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore offline fallback:', err);
    }

    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setStudentName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="pt-24 bg-cream">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-maroon/5 border border-maroon/15 rounded-full text-xs uppercase tracking-widest font-bold text-maroon mb-6"
        >
          <Sparkles size={14} />
          Ascend Edutech — Computer Science Academy
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-serif leading-tight mb-6 max-w-4xl mx-auto"
        >
          Master Software Engineering & <span className="text-maroon italic">Tech Skills</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-ink/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Project-driven Computer Science programs engineered by industry developers. Learn Full Stack, AI, Cloud Computing, Cyber Security & DSA with 100% placement guidance.
        </motion.p>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12"
        >
          {[
            { icon: <Laptop size={16} className="text-maroon" />, label: 'Live Real-World Agency Projects' },
            { icon: <UserCheck size={16} className="text-maroon" />, label: '1-on-1 Mentor Guidance' },
            { icon: <Award size={16} className="text-maroon" />, label: 'Industry Certification & Internships' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-ink/10 shadow-2xs text-xs font-semibold text-ink/80">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button
            onClick={() => {
              if (registrationFormRef.current) {
                registrationFormRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-maroon text-white px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-maroon/90 transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2"
          >
            Register For Course <ArrowRight size={14} />
          </button>
          
          <button
            onClick={() => handleWhatsAppEnquiry()}
            className="bg-[#25D366] text-white px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={18} />
            Quick WhatsApp Enquiry
          </button>
        </motion.div>
      </section>

      {/* Courses Catalog Section */}
      <section className="py-12 md:py-16 bg-cream-dark/30 border-y border-ink/5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-maroon mb-2">Our Curriculum</h4>
            <h2 className="text-3xl md:text-4xl font-serif">Explore Computer Science Courses</h2>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search courses, skills (e.g. React, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-ink/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-ink focus:outline-none focus:border-maroon shadow-2xs"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
              {[
                { id: 'all', label: 'All Courses' },
                { id: 'web', label: 'Web Dev & UI' },
                { id: 'ai', label: 'AI & Data' },
                { id: 'cloud', label: 'Cloud & DevOps' },
                { id: 'cyber', label: 'Cyber Security' },
                { id: 'core', label: 'Core CS & Java' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all border ${
                    selectedCategory === tab.id
                      ? 'bg-maroon text-white border-maroon shadow-xs'
                      : 'bg-white text-ink/70 border-ink/10 hover:border-maroon/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -6 }}
                className="bg-white p-6 md:p-7 rounded-lg border border-ink/10 shadow-sm flex flex-col justify-between hover:border-maroon/30 transition-all relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-cream rounded-lg border border-ink/5">
                      {course.icon}
                    </div>
                    {course.popular && (
                      <span className="bg-maroon/10 text-maroon text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        ★ Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-serif text-ink mb-2 group-hover:text-maroon transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-ink/65 leading-relaxed mb-5">
                    {course.description}
                  </p>

                  {/* Meta Badges */}
                  <div className="flex items-center gap-3 text-[11px] text-ink/60 mb-5 pb-4 border-b border-ink/5 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-maroon" />
                      <span>{course.duration}</span>
                    </div>
                    <span>•</span>
                    <div>{course.level}</div>
                  </div>

                  {/* Syllabus Key Topics */}
                  <div className="mb-6">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-maroon mb-2.5">Key Syllabus:</h4>
                    <ul className="grid grid-cols-1 gap-1.5">
                      {course.topics.map((topic, i) => (
                        <li key={i} className="text-xs text-ink/80 flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-ink/5 flex items-center gap-2.5">
                  <button
                    onClick={() => handleCourseRegisterClick(course.title)}
                    className="flex-1 bg-maroon text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-sm hover:bg-maroon/90 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    Register
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => handleWhatsAppEnquiry(course.title)}
                    className="bg-[#25D366] text-white p-2.5 rounded-sm hover:bg-[#20bd5a] transition-all"
                    title="Enquire on WhatsApp"
                  >
                    <FaWhatsapp size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Registration Form Section */}
      <section ref={registrationFormRef} className="py-14 md:py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 md:p-12 border border-ink/10 shadow-xl relative overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-maroon bg-maroon/5 px-3 py-1 rounded-full border border-maroon/10">
              Admission Registration
            </span>
            <h2 className="text-3xl md:text-4xl font-serif mt-3 mb-2">Register For Tech Courses</h2>
            <p className="text-xs md:text-sm text-ink/60">Fill out your details to enroll or receive full course syllabus & fee structure.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center bg-emerald-50 rounded-lg border border-emerald-200 p-6"
            >
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Registration Submitted Successfully!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto mb-6">
                Thank you, <span className="font-bold">{studentName}</span>! Our counselor will reach out to you shortly on WhatsApp/Email with batch schedule details.
              </p>
              <button
                onClick={() => handleWhatsAppEnquiry()}
                className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-[#20bd5a] transition-all"
              >
                <FaWhatsapp size={16} />
                Connect Instantly on WhatsApp
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    Full Name <span className="text-maroon">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Varma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    Email Address <span className="text-maroon">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    WhatsApp / Phone Number <span className="text-maroon">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    Select Course <span className="text-maroon">*</span>
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  >
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    Qualification / Status
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  >
                    <option value="B.Tech / Degree Student">B.Tech / Degree Student</option>
                    <option value="MCA / M.Tech Student">MCA / M.Tech Student</option>
                    <option value="Fresh Graduate (Job Seeking)">Fresh Graduate (Job Seeking)</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                    Preferred Batch Mode
                  </label>
                  <select
                    value={batchMode}
                    onChange={(e) => setBatchMode(e.target.value)}
                    className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                  >
                    <option value="Online Live">Online Live (Interactive Interactive Sessions)</option>
                    <option value="Classroom Training">Classroom Training (Offline Vizag Center)</option>
                    <option value="Hybrid (Classroom + Online)">Hybrid (Classroom + Online)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
                  Additional Message / Questions
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention any specific goals, batch timings preferred, or questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-cream-dark/20 border border-ink/15 rounded-sm py-3 px-4 text-sm focus:outline-none focus:border-maroon transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-maroon text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-sm hover:bg-maroon/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={15} />
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppEnquiry()}
                  className="w-full sm:w-auto bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-sm hover:bg-[#20bd5a] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={18} />
                  Register via WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Edutech;
