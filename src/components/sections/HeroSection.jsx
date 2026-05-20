import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Calendar, Shield, Star, CheckCircle2, 
  Users, Clock, Award, Heart, Sparkles 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { therapist } from '@/data/therapistData';

const floatAnim = {
  animate: { y: [0, -6, 0], rotate: [0, 0.5, 0] },
  transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
  style: { willChange: 'transform' },
};

const floatAnimDelayed = {
  animate: { y: [0, -5, 0], rotate: [0, -0.5, 0] },
  transition: { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 },
  style: { willChange: 'transform' },
};

// Static particle positions — computed once to avoid rerender thrash
const PARTICLE_POSITIONS = Array.from({ length: 4 }, (_, i) => ({
  x: [10, 25, 55, 75][i] + '%',
  y: [20, 60, 35, 80][i] + '%',
  duration: [8, 10, 9, 11][i],
  delay:    [0, 1.5, 3, 4.5][i],
}));

function StatPill({ icon: Icon, value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-level-1 border border-border-light min-w-[160px]"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="font-display font-bold text-lg text-text-dark leading-none">{value}</p>
        <p className="text-label text-text-gray mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

function HeroSection() {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const targetElement = document.getElementById('services');
    if (targetElement) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', '/#services');
    }
  };

  return (
    <section className="relative min-h-screen min-h-[100dvh] flex items-center overflow-hidden bg-white">
      {/* Background decorative glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[140px]" />
        
        {/* Subtle warm particles — positions are static to avoid rerender */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {PARTICLE_POSITIONS.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/10"
              style={{ left: p.x, top: p.y, willChange: 'transform, opacity' }}
              animate={{ 
                y: [0, -80], 
                opacity: [0, 0.5, 0],
              }}
              transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                delay: p.delay,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        {/* Subtle organic texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
          }}
        />
      </div>

      <div className="relative w-full max-w-container mx-auto px-4 md:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen lg:min-h-0 lg:py-28">

          {/* ── Left Column ─── */}
          <motion.div
            variants={staggerContainer(0.11, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {/* Soft identity badge */}
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md text-accent-dark border border-accent/20 text-label font-semibold px-5 py-2.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Counselling Psychologist · NLP Practitioner · Pranic Healer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display font-bold text-[2.75rem] md:text-5xl lg:text-[3.8rem] text-text-dark leading-[1.1] tracking-tight mb-5"
            >
              Healing the ache of <br />
              <span className="text-accent-dark">loneliness</span> with <br />
              compassionate care.
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={staggerItem}
              className="text-body-lg text-text-gray max-w-lg leading-relaxed mb-10"
            >
              Step into a safe emotional space where your story is heard, 
              your feelings are seen, and your healing journey begins with 
              a gentle, human-centered approach.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="shadow-level-2 px-10" as={Link} to="/book">
                Begin Your Healing Journey
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="text-text-dark hover:text-accent-dark cursor-pointer"
                onClick={handleExploreClick}
              >
                Explore Safe Spaces
              </Button>
            </motion.div>

            {/* Quote snippet */}
            <motion.div
              variants={staggerItem}
              className="border-l-2 border-accent/30 pl-6 py-1 italic text-body-sm text-text-gray max-w-sm"
            >
              "Within every solitude lies the seed of belonging. We just need a safe space to let it bloom."
            </motion.div>
          </motion.div>

          {/* ── Right Column ─── */}
          <div className="relative flex items-center justify-center">
            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              className="relative w-full max-w-md"
            >
              {/* Profile card */}
              <div className="relative bg-white rounded-[2rem] shadow-level-3 overflow-hidden border border-white/80 p-8">
                {/* Card top gradient strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-dark to-accent" />

                {/* Avatar placeholder with warm tones */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 via-accent/5 to-white flex items-center justify-center shadow-level-2 border-4 border-white">
                  <span className="font-display font-bold text-4xl text-accent-dark">CS</span>
                </div>

                <div className="text-center mb-6">
                  <h2 className="font-display font-bold text-h3 text-text-dark mb-1">{therapist.name}</h2>
                  <p className="text-body-sm text-accent-dark font-semibold">Counselling Psychologist</p>
                  <p className="text-label text-text-gray mt-1">Healing · Self-Awareness · Connection</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {['Loneliness', 'Interconnectedness', 'Wellness'].map((tag) => (
                    <span
                      key={tag}
                      className="text-label px-3 py-1 rounded-full bg-accent/5 text-accent-dark border border-accent/10 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Availability */}
                <div className="flex items-center justify-center gap-2 text-body-sm text-text-gray bg-off-white rounded-xl px-4 py-3 border border-accent/10">
                  <Heart className="w-4 h-4 text-accent shrink-0" />
                  <span>Available for safe conversations</span>
                </div>

                </div>
              <motion.div
                className="absolute -top-4 -right-1 bg-accent text-white text-label font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1 z-20"
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <Sparkles className="w-3 h-3" />
                Holistic Care
              </motion.div>
            </motion.div>

            {/* Floating stat pills */}
            <div className="absolute -left-4 top-10 hidden xl:block">
              <motion.div {...floatAnim}>
                <StatPill icon={Heart} value="1,500+" label="Hearts Healed" delay={0.6} />
              </motion.div>
            </div>
            <div className="absolute -right-8 bottom-48 hidden xl:block z-10">
              <motion.div {...floatAnimDelayed}>
                <StatPill icon={Sparkles} value="99%" label="Growth Rate" delay={0.75} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-label text-text-gray"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span>Discover Calm</span>
        <motion.div
          className="w-5 h-8 border-2 border-accent/30 rounded-full flex items-start justify-center pt-1.5"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-2 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
