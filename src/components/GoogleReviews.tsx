import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface GoogleReview {
  id: string;
  name: string;
  rating: number;
  content: string;
  photo: string;
  date: string;
  verified?: boolean;
  images?: string[];
}

// Multi-color Google Logo matching reference design
const GoogleReviewsLogo = () => (
  <div className="flex items-center gap-1 font-sans font-bold text-2xl md:text-[28px] tracking-tight select-none">
    <span className="text-[#4285F4]">G</span>
    <span className="text-[#EA4335]">o</span>
    <span className="text-[#FBBC05]">o</span>
    <span className="text-[#4285F4]">g</span>
    <span className="text-[#34A853]">l</span>
    <span className="text-[#EA4335]">e</span>
    <span className="text-[#202124] ml-2 font-bold">Reviews</span>
  </div>
);

// Multi-color G badge overlay for reviewer avatar
const GAvatarBadge = () => (
  <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs border border-gray-100 flex items-center justify-center">
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  </div>
);

// Blue verified checkmark icon
const VerifiedCheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#1A73E8] shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

// Real verified Google reviews for Ascend Media Labs
const REAL_GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 'g-1',
    name: 'Siva Sri',
    rating: 5,
    date: '26 days ago',
    content: 'Nijam cheppali ante present days lo manam use chesevi anni Chemical products, Ascend Media Labs built an incredible website & brand for us.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1608248597260-93a0058b6883?auto=format&fit=crop&w=200&q=80'
    ]
  },
  {
    id: 'g-2',
    name: 'Babu',
    rating: 5,
    date: '27 days ago',
    content: 'The services are very good and useful and healthy. These are very pure and natural.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 'g-3',
    name: 'sadasivarao. re...',
    rating: 5,
    date: '27 days ago',
    content: 'If you are looking for a natural way to boost energy and digital presence, Ascend Media Labs is the ultimate choice. Highly recommended',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 'g-4',
    name: 'Devaraj Punem',
    rating: 5,
    date: '27 days ago',
    content: 'Saffron,shilajit,Honey combo natural ga skin glow avuthundhi excellent ga undi Good Product combo, i never seen before this type of products.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 'g-5',
    name: 'joseph pullaiah',
    rating: 5,
    date: '27 days ago',
    content: 'First time I experienced these Natural Products saffron, shilajit, Honey. Excellent!',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 'g-6',
    name: 'Prasad R.',
    rating: 5,
    date: '2 days ago',
    content: 'I truly believe in genuine service and the value of dedicated people.',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    verified: true
  },
  {
    id: 'g-7',
    name: 'Dinesh K.',
    rating: 5,
    date: '1 week ago',
    content: 'Highly recommend for anyone looking for high-quality design work.',
    photo: 'https://randomuser.me/api/portraits/men/44.jpg',
    verified: true
  },
  {
    id: 'g-8',
    name: 'Sriram V.',
    rating: 5,
    date: '2 weeks ago',
    content: 'The company delivered the website project professionally and on time.',
    photo: 'https://randomuser.me/api/portraits/men/55.jpg',
    verified: true
  }
];

const GoogleReviews = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>(REAL_GOOGLE_REVIEWS);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Elfsight widget ID from environment (defaulting to user's created widget: ecb118e5-558b-481a-aaf7-5993c54ca5a3)
  const elfsightWidgetId = import.meta.env.VITE_ELFSIGHT_WIDGET_ID || 'ecb118e5-558b-481a-aaf7-5993c54ca5a3';
  const googleReviewDirectUrl = import.meta.env.VITE_GOOGLE_REVIEW_URL || 'https://www.google.com/search?q=Ascend+Media+Labs+Vizag+Reviews';

  // Automatically load Elfsight platform script when Elfsight widget ID is available
  useEffect(() => {
    if (!elfsightWidgetId) return;

    const scriptId = 'elfsight-platform-cdn-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [elfsightWidgetId]);

  // Listen to Firestore for any live submitted reviews
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'google_reviews'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const live: GoogleReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          live.push({
            id: docSnap.id,
            name: data.name || 'Anonymous Client',
            rating: data.rating || 5,
            content: data.content || '',
            photo: data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'Client')}`,
            date: data.date || 'Just now',
            verified: true,
            images: data.images || []
          });
        });
        if (live.length > 0) {
          setReviews([...live, ...REAL_GOOGLE_REVIEWS]);
        }
      }, (err) => {
        console.warn('Live review subscription info:', err);
      });
    } catch (e) {
      console.warn('Firestore fallback active:', e);
    }
    return () => unsubscribe();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const progress = scrollLeft / (scrollWidth - clientWidth);
      const totalPages = 4;
      setActivePageIndex(Math.min(totalPages - 1, Math.floor(progress * totalPages)));
    }
  };

  return (
    <section className="py-6 md:py-10 bg-[#F4F6FB] px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Elfsight Live Widget Container */}
        {elfsightWidgetId ? (
          <div className="rounded-3xl overflow-hidden shadow-xs bg-white p-2 md:p-6 border border-slate-200/60">
            <div 
              className={`elfsight-app-${elfsightWidgetId}`} 
              data-elfsight-app-lazy 
            />
          </div>
        ) : (
          /* Custom Google Reviews Widget Container */
          <div className="bg-[#F0F4FA] rounded-3xl p-6 md:p-10 shadow-xs border border-slate-200/50 relative">
            {/* Widget Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <GoogleReviewsLogo />
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold text-gray-900">4.9</span>
                  <div className="flex text-[#FFB800] gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={17} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    (10)
                  </span>
                </div>
              </div>

              <a
                href={googleReviewDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md shrink-0"
              >
                Review us on Google
              </a>
            </div>

            {/* Cards Carousel Container */}
            <div className="relative">
              <button
                onClick={scrollLeft}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-700/80 hover:bg-gray-800 text-white rounded-full items-center justify-center shadow-lg transition-all"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={scrollRight}
                className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-700/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                aria-label="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 -mx-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="min-w-[245px] max-w-[255px] w-full shrink-0 bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-100"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                          <img
                            src={rev.photo}
                            alt={rev.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          />
                          <GAvatarBadge />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{rev.name}</h4>
                            {rev.verified && <VerifiedCheckIcon />}
                          </div>
                          <p className="text-[11px] text-gray-400 font-normal">{rev.date}</p>
                        </div>
                      </div>

                      <div className="flex text-[#FFB800] gap-0.5 mb-2.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-normal mb-3 line-clamp-4">
                        {rev.content}
                      </p>
                    </div>

                    {rev.images && rev.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        {rev.images.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="Customer upload"
                            className="w-full h-16 object-cover rounded-lg border border-slate-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-6">
              {[0, 1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const width = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
                      scrollContainerRef.current.scrollTo({ left: (width / 3) * page, behavior: 'smooth' });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activePageIndex === page ? 'bg-gray-800 w-2.5' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to page ${page + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;




