import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Sunrise, Users, Shield, Compass, Leaf,
  Clock, Monitor, ArrowRight, X, Calendar,
} from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem, scaleIn } from '@/lib/animations';
import { services } from '@/data/servicesData';

const iconMap = {
  Brain, Sunrise, Users, Shield, Compass, Leaf,
};

const cardAccents = [
  'from-coral-50 to-coral-100/40',
  'from-cream-50 to-cream-100/60',
  'from-coral-50/60 to-cream-50',
  'from-coral-50/40 to-cream-50',
  'from-coral-50 to-coral-50/30',
  'from-cream-100/60 to-coral-50/30',
];

function ServiceCard({ service, index, onExpand }) {
  const Icon = iconMap[service.icon] || Brain;
  const accent = cardAccents[index % cardAccents.length];

  return (
    <motion.article
      variants={staggerItem}
      className="group relative flex flex-col rounded-[1.5rem] bg-white border border-border-light shadow-level-1 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1.5 hover:border-coral-200"
      onClick={() => onExpand(service)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onExpand(service)}
      aria-label={`View details for ${service.title}`}
    >
      {/* Top gradient accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent.replace('from-', 'from-').replace('to-', 'to-')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }}
      />

      <div className="p-7 flex flex-col flex-1">
        {/* Icon + Badge row */}
        <div className="flex items-start justify-between mb-5">
          <motion.div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-level-1 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-coral" aria-hidden="true" />
          </motion.div>
          {service.badge && (
            <Badge variant={service.badge === 'New' ? 'coral' : 'primary'} className="shrink-0">
              {service.badge}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-body font-bold text-h3 text-text-dark mb-2 group-hover:text-coral transition-colors duration-300">
          {service.title}
        </h3>

        {/* Short desc */}
        <p className="text-body-sm text-text-gray leading-relaxed flex-1 mb-6">
          {service.shortDescription}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-label text-text-gray bg-off-white px-3 py-1.5 rounded-full border border-border-light">
              <Clock className="w-3 h-3 text-coral" />
              {service.duration}
            </span>
            <span className="flex items-center gap-1.5 text-label text-text-gray bg-off-white px-3 py-1.5 rounded-full border border-border-light">
              <Monitor className="w-3 h-3 text-coral" />
              {service.format[0]}
            </span>
          </div>
          <span className="text-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function ServiceModal({ service, onClose }) {
  const Icon = iconMap[service.icon] || Brain;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-modal="true"
      role="dialog"
      aria-label={service.title}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-level-3 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      >
        {/* Top accent */}
        <div className="h-1.5 w-full shrink-0" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />

        <div className="p-8 overflow-y-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-off-white hover:bg-border-light flex items-center justify-center text-text-gray hover:text-text-dark transition-colors"
            aria-label="Close service details"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-coral-50 flex items-center justify-center shadow-level-1 shrink-0">
              <Icon className="w-8 h-8 text-coral" />
            </div>
            <div>
              <h2 className="font-body font-bold text-h3 text-text-dark">{service.title}</h2>
              <p className="text-body-sm text-coral font-semibold mt-0.5">{service.duration}</p>
            </div>
          </div>

          <p className="text-body text-text-gray leading-relaxed mb-6">{service.fullDescription}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {service.format.map((f) => (
              <Badge key={f} variant="neutral">{f}</Badge>
            ))}
          </div>

          <Button fullWidth icon={Calendar} as={Link} to="/book" onClick={onClose}>
            Book This Service
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ServicesSection() {
  const [expanded, setExpanded] = useState(null);

  return (
    <Section id="services" bg="offwhite">
      <Heading
        align="center"
        subtitle="A selection of safe emotional spaces designed to support your unique path to healing and self-awareness."
      >
        Personalized Paths to Wellness
      </Heading>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} onExpand={setExpanded} />
        ))}
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <ServiceModal service={expanded} onClose={() => setExpanded(null)} />
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <motion.div
        className="mt-14 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-body text-text-gray mb-4">
          Not sure which path is right for you? Let's figure it out together.
        </p>
        <Button className="shadow-level-2" as={Link} to="/book">
          Begin with a Gentle Conversation →
        </Button>
      </motion.div>
    </Section>
  );
}

export default ServicesSection;
