export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  url: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  photo: string;
}

import logoMain from './assets/images/logo-main.png';
import about1 from './assets/images/about1.png';
import webImage from './assets/images/web.jpeg';
import seoImage from './assets/images/seo.jpeg';
import brandingImage from './assets/images/branding.jpeg';

export const LOGO = logoMain;
export const ABOUT_IMAGE = about1;
export const WEB_IMAGE = webImage;
export const SEO_IMAGE = seoImage;
export const BRANDING_IMAGE = brandingImage;

export const SERVICES: Service[] = [
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Bespoke websites built with clean code, performance-first architecture, and high-end aesthetic appeal.',
    icon: 'Code2',
    features: ['React & Next.js Ecosystems', 'E-commerce Architecture', 'CMS Integration']
  },
  {
    id: 'seo',
    title: 'SEO Optimization',
    description: 'Strategic search engine optimization to place your brand at the forefront of digital discovery.',
    icon: 'Search',
    features: ['Technical Site Audits', 'Keyword Intelligence', 'Content Strategy']
  },
  {
    id: 'branding',
    title: 'Branding & Design',
    description: 'Crafting iconic logos, premium UI/UX interfaces, and comprehensive brand kits that resonate with your audience.',
    icon: 'Palette',
    features: ['Visual Identity Design', 'Typography Systems', 'UI/UX Interface Design']
  }
];

import inizioImage from './assets/inizio.png';
import desiImage from './assets/desi.png';
import gomunchzImage from './assets/gomunchz.png';
import khushiImage from './assets/khushi.png';
import royalStandardImage from './assets/images/royal-standard-pub.png';

export const PROJECTS: Project[] = [
  {
    id: 'royal-standard-pub',
    title: 'The Royal Standard Pub',
    category: 'QR Scanner & Website',
    image: royalStandardImage,
    url: 'https://www.royalstandardpub.co.uk/'
  },
  {
    id: 'inizio',
    title: 'Inizio Interiors',
    category: 'Luxury Interior Design',
    image: inizioImage,
    url: 'https://www.iniziointeriors.com/'
  },
  {
    id: 'desi-originals',
    title: 'Desi Originals',
    category: 'Farm Fresh Food',
    image: desiImage,
    url: 'https://www.desioriginals.in/'
  },
  {
    id: 'go-munchz',
    title: 'Go Munchz',
    category: 'Healthy Snacking',
    image: gomunchzImage,
    url: 'https://www.gomunchz.com/'
  },
  {
    id: 'khushi-box',
    title: 'Khushi Box',
    category: 'Bespoke Gifting',
    image: khushiImage,
    url: 'https://www.khushibox.in/'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Hem Kumar',
    role: 'CEO',
    company: 'Inizio Interiors',
    content: 'Ascend transformed our outdated website into a powerhouse. The design is stunning and the growth was immediate.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Tharun',
    role: 'Founder',
    company: 'Desi Originals',
    content: 'Their eye for branding is unmatched. They understood our vision and translated it into a visual identity that feels world-class.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/men/44.jpg'
  },
  {
    id: '3',
    name: 'Hem Kumar',
    role: 'Director',
    company: 'Go Munchz',
    content: 'Efficiency and quality. Ascend delivered our app ahead of schedule without cutting any corners on design or performance.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: '4',
    name: 'Kavya',
    role: 'Founder',
    company: 'Khushi Box',
    content: 'The attention to detail in their UI/UX work is incredible. Our conversion rates have doubled since the redesign.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/women/25.jpg'
  },
  {
    id: '5',
    name: 'Ananya R.',
    role: 'Marketing Head',
    company: 'Eco Eats',
    content: 'Professional, creative, and highly responsive. They captured our brand essence perfectly in the new digital identity.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/women/85.jpg'
  },
  {
    id: '6',
    name: 'Vikram S.',
    role: 'CEO',
    company: 'Tech Pulse',
    content: 'A truly world-class digital agency. Their technical expertise combined with their design sense is a rare find.',
    rating: 5,
    photo: 'https://randomuser.me/api/portraits/men/76.jpg'
  }
];
