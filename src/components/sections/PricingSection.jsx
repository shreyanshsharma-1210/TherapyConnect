import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Sparkles, Heart, Zap, ArrowRight } from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { pricingPlans } from '@/data/pricingData';
import { cn } from '@/lib/utils';

function PricingCard({ plan, index }) {
  const isHighlighted = plan.highlighted;

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "relative flex flex-col rounded-[2.5rem] transition-all duration-500 bg-white",
        isHighlighted 
          ? "border-2 border-primary shadow-[0_20px_50px_rgba(18,128,129,0.15)] scale-[1.05] z-10" 
          : "border border-border-light shadow-level-1 hover:shadow-level-2 hover:-translate-y-2"
      )}
    >
      {/* Popular tag for highlighted card */}
      {isHighlighted && (
        <div className="absolute top-0 left-1/2 translate-x-[-50%] translate-y-[-50%] z-20">
          <div className="bg-primary text-white text-[0.65rem] font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-white" />
            MOST RECOMMENDED
          </div>
        </div>
      )}

      <div className="relative flex flex-col flex-1 p-8 sm:p-10">
        {/* Header Section */}
        <div className="mb-8">
          {plan.badge && !isHighlighted && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-accent/10 text-accent-dark">
                <Zap className="w-3 h-3" />
                {plan.badge}
              </span>
            </div>
          )}
          <h3 className="font-display font-bold text-2xl text-text-dark mb-1">
            {plan.name}
          </h3>
          <p className="text-sm font-medium text-text-gray">
            {plan.duration}
          </p>
        </div>

        {/* Price Section */}
        <div className="mb-8 flex items-baseline gap-1">
          <span className="text-2xl font-body font-bold text-primary">
            {plan.currency}
          </span>
          <span className="text-5xl font-display font-bold tracking-tight text-text-dark">
            {plan.price.toLocaleString()}
          </span>
          <span className="text-sm ml-1 text-text-gray">
            {plan.id === 'single' ? '/session' : '/month'}
          </span>
        </div>

        {/* Description */}
        <p className="text-body-sm mb-8 leading-relaxed text-text-gray">
          {plan.description}
        </p>

        {/* Features List */}
        <div className="flex-1 mb-10">
          <p className="text-[0.65rem] uppercase tracking-wider font-bold mb-4 opacity-60 text-text-dark">
            What's Included
          </p>
          <ul className="space-y-4">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-body-sm font-medium text-text-dark/90">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          as={Link}
          to="/book"
          size="lg"
          fullWidth
          variant={isHighlighted ? "primary" : "secondary"}
          className="group/btn rounded-2xl shadow-level-1"
        >
          <span className="flex items-center justify-center gap-2">
            {plan.cta}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </span>
        </Button>

        {/* Trust Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] font-medium opacity-60 text-text-gray">
          <Lock className="w-3 h-3" />
          <span>Private & Fully Confidential</span>
        </div>
      </div>
    </motion.div>
  );
}

function PricingSection() {
  return (
    <Section id="pricing" bg="offwhite" className="overflow-visible">
      <Heading
        align="center"
        subtitle="Your journey to healing is an investment in your soul. We offer transparent paths designed to meet you where you are."
        className="mb-16"
      >
        A Gentle Investment in Yourself
      </Heading>

      <motion.div
        className="grid md:grid-cols-3 gap-8 lg:gap-10 items-stretch"
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {pricingPlans.map((plan, i) => (
          <PricingCard key={plan.id} plan={plan} index={i} />
        ))}
      </motion.div>

      {/* Trust signals footer */}
      <div className="mt-16 p-8 rounded-[2rem] bg-white border border-border-light flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
        {[
          { icon: Lock,         label: 'Secure Payments',    desc: 'Protected by industry-standard encryption' },
          { icon: Heart,        label: 'Safe Conversations', desc: 'Deeply private and non-judgmental' },
          { icon: CheckCircle2, label: 'Flexible Paths',     desc: 'Reschedule or pause anytime' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-body-sm font-bold text-text-dark">{label}</p>
              <p className="text-[0.7rem] text-text-gray">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default PricingSection;
