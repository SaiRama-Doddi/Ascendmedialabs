import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleReview {
  id: string;
  name: string;
  rating: number;
  content: string;
  photo: string;
}

const GoogleReviews = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    // Sample Google reviews data from your business profile
    const sampleReviews: GoogleReview[] = [
      {
        id: '1',
        name: 'Kalyani Ratna',
        rating: 5,
        content: 'Best Digital Media company in Vizag. Their team delivered beautiful design and excellent support.',
        photo: 'https://randomuser.me/api/portraits/women/21.jpg'
      },
      {
        id: '2',
        name: 'Hem Kumar',
        rating: 5,
        content: 'I’ve had a fantastic experience working with Ascend Media Labs. Their design and execution are top class.',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        id: '3',
        name: 'Divya Malladi',
        rating: 5,
        content: 'The project was seamless from start to finish. The team understands branding and delivers great results.',
        photo: 'https://randomuser.me/api/portraits/women/45.jpg'
      },
      {
        id: '4',
        name: 'Aarti Sharma',
        rating: 5,
        content: 'Responsive, professional, and creative. Our website now looks premium and works perfectly.',
        photo: 'https://randomuser.me/api/portraits/women/33.jpg'
      },
      {
        id: '5',
        name: 'Ravi Kumar',
        rating: 5,
        content: 'Working with Ascend was a great decision. They delivered on time and exceeded expectations.',
        photo: 'https://randomuser.me/api/portraits/men/44.jpg'
      },
      {
        id: '6',
        name: 'Nisha Reddy',
        rating: 5,
        content: 'Their Google reviews speak for themselves. The team is reliable, friendly, and highly skilled.',
        photo: 'https://randomuser.me/api/portraits/women/50.jpg'
      }
    ];

    setReviews(sampleReviews);

    // Auto-rotate reviews
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % Math.ceil(sampleReviews.length / itemsPerPage));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const currentReviews = reviews.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="section-padding bg-cream overflow-hidden">
      <div className="text-center mb-16">
        <h4 className="text-[10px] uppercase tracking-widest font-medium text-maroon mb-4">Google Reviews</h4>
        <h2 className="text-4xl md:text-5xl font-serif">What Our Clients Say</h2>
      </div>

      <div className="relative min-h-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {currentReviews.map((review) => (
              <div key={review.id} className="bg-white p-10 rounded-sm border border-ink/5 shadow-sm flex flex-col h-full min-h-87.5">
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-maroon text-xs">★</span>
                  ))}
                </div>
                <div className="grow">
                  <p className="text-lg font-serif italic mb-8 text-ink/80 leading-relaxed">"{review.content}"</p>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-ink/5">
                  <img 
                    src={review.photo} 
                    alt={review.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-maroon shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-ink">{review.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-maroon">Google Review</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-12">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentPage === i ? 'bg-maroon w-6' : 'bg-ink/10'
            }`}
          />
        ))}
      </div>

    </section>
  );
};

export default GoogleReviews;
