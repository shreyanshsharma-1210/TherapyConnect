import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Shield, Star, Heart, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';

function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32 bg-accent-dark">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/40 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-accent/30 blur-[60px]" />

        {/* Subtle organic texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
          }}
        />
      </div>

      {/* Floating elements */}
      {[
        { Icon: Heart,    size: 'w-16 h-16', pos: 'top-10 left-[8%]',      delay: 0   },
        { Icon: Sparkles, size: 'w-8 h-8',   pos: 'top-1/4 right-[12%]',   delay: 0.5 },
        { Icon: Heart,    size: 'w-12 h-12', pos: 'bottom-16 left-[15%]',  delay: 1   },
        { Icon: Sparkles, size: 'w-6 h-6',   pos: 'bottom-1/4 right-[8%]', delay: 0.8 },
      ].map(({ Icon, size, pos, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} text-white/10`}
          style={{ willChange: 'transform' }}
          animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay }}
          aria-hidden="true"
        >
          <Icon className={size} />
        </motion.div>
      ))}

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Trust badge */}
          <motion.div variants={staggerItem} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-label font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Join 1,500+ hearts on their path to healing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={staggerItem}
            className="font-display font-bold text-[2.5rem] md:text-5xl text-white leading-tight mb-6"
          >
            Ready to Begin Your
            <br />
            <span className="text-secondary">Healing Journey?</span>
          </motion.h2>

          {/* Supporting text */}
          <motion.p
            variants={staggerItem}
            className="text-body-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Your first step doesn&rsquo;t have to be big. A gentle 15-minute conversation is all it
            takes to see if we feel connected — no pressure, just a safe space.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              as={Link}
              to="/book"
            >
              Start a Conversation
            </Button>
            <Button
              size="lg"
              icon={Phone}
              variant="ghost"
              as="a"
              href="tel:+919039705759"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/60"
            >
              Call for Reassurance
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-6 text-body-sm text-white/60"
          >
            {[
              { icon: Shield, text: 'Confidential & Safe' },
              { icon: Star, text: 'Compassionate Listening' },
              { icon: Heart, text: 'Human-Centered Approach' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 font-medium">
                <Icon className="w-4 h-4 text-accent/50" />
                {text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
