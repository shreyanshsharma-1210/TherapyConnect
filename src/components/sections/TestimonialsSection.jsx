import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useTestimonials } from '@/hooks/useTestimonials';

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'fill-coral text-coral' : 'text-border-light'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function AvatarPlaceholder({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'bg-coral-100 text-coral-700',
    'bg-cream-200 text-text-dark',
    'bg-coral-100 text-coral-500',
    'bg-green-100 text-green-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center font-bold text-body shrink-0`}>
      {initials}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <motion.article
      variants={staggerItem}
      className="flex flex-col bg-white rounded-[1.5rem] p-7 shadow-level-1 border border-border-light hover:shadow-level-2 hover:border-coral-100 transition-all duration-300 h-full"
    >
      {/* Quote icon */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-coral-200 fill-coral-50" aria-hidden="true" />
      </div>

      {/* Stars */}
      <div className="mb-4">
        <Stars count={testimonial.rating} />
      </div>

      {/* Quote text */}
      <blockquote className="text-body text-text-dark leading-relaxed flex-1 mb-6 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <AvatarPlaceholder name={testimonial.name} />
          <div>
            <p className="font-body font-semibold text-body-sm text-text-dark">{testimonial.name}</p>
            <p className="text-label text-text-gray">{testimonial.role}</p>
          </div>
        </div>
        {testimonial.verified && (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50/80 px-2.5 py-0.5 rounded-full border border-teal-100/40">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Verified Client
          </span>
        )}
      </div>
    </motion.article>
  );
}

function TestimonialsSection() {
  const { testimonials, loading } = useTestimonials();
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <Section id="testimonials" bg="cream" className="relative overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-coral-100/30 blur-3xl pointer-events-none" aria-hidden="true" />

      <Heading
        align="center"
        subtitle="Real stories from people who took that first brave step."
      >
        What Clients Are Saying
      </Heading>

      {/* Overall rating bar */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-level-1 border border-white max-w-lg mx-auto"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center sm:border-r sm:border-border-light sm:pr-6">
          <p className="font-display font-bold text-4xl text-coral leading-none">5.0</p>
          <Stars count={5} />
          <p className="text-label text-text-gray mt-1">Average Rating</p>
        </div>
        <div className="sm:pl-6 text-center">
          <p className="font-display font-bold text-4xl text-text-dark leading-none">98%</p>
          <p className="text-body-sm text-text-gray mt-1">Would recommend</p>
          <p className="text-label text-coral font-semibold mt-0.5">Based on 1,200+ sessions</p>
        </div>
      </motion.div>

      {/* Cards grid with animated page transition */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[1.5rem] bg-white border border-border-light shadow-level-1 p-7 animate-pulse">
              <div className="w-8 h-8 bg-cream-200 rounded-lg mb-4" />
              <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(j => <div key={j} className="w-4 h-4 bg-cream-200 rounded" />)}</div>
              <div className="space-y-2 mb-6"><div className="h-4 bg-cream-200 rounded w-full" /><div className="h-4 bg-cream-200 rounded w-5/6" /><div className="h-4 bg-cream-200 rounded w-4/6" /></div>
              <div className="flex items-center gap-3"><div className="w-12 h-12 bg-cream-200 rounded-full" /><div className="space-y-1"><div className="h-3 bg-cream-200 rounded w-24" /><div className="h-3 bg-cream-200 rounded w-16" /></div></div>
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <p className="text-center text-body text-text-gray py-12">No testimonials available yet.</p>
      ) : (
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        >
          {visible.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </motion.div>
      </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-gray hover:border-coral hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-level-1"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === page ? 'bg-coral scale-125' : 'bg-border-light hover:bg-coral-200'
                }`}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === page ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-gray hover:border-coral hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-level-1"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </Section>
  );
}

export default TestimonialsSection;
