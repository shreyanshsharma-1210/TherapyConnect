import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem, slideInLeft, slideInRight } from '@/lib/animations';
import { therapist } from '@/data/therapistData';

const stats = [
  { value: '8+', label: 'Years of Healing', icon: Award },
  { value: '1,500+', label: 'Hearts Healed', icon: Users },
  { value: '99%', label: 'Growth Rate', icon: Heart },
  { value: '4', label: 'Holistic Paths', icon: GraduationCap },
];

const philosophy = [
  {
    title: 'Safe Emotional Sanctuary',
    desc: 'Creating a non-judgmental, warm container where every layer of your story is honored.',
  },
  {
    title: 'Holistic Interconnectedness',
    desc: 'Bridging the mind, body, and soul through psychology, NLP, and Pranic healing insights.',
  },
  {
    title: 'Reflective Self-Awareness',
    desc: 'Empowering you to find your own answers through deep inquiry and compassionate guidance.',
  },
];

function AboutSection() {
  return (
    <Section id="about" bg="white">
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: Image + Stats ── */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative"
        >
          {/* Main image block */}
          <div className="relative">
            <div className="relative w-full aspect-[4/5] max-w-sm mx-auto lg:mx-0 rounded-[2rem] overflow-hidden bg-gradient-to-br from-accent/10 via-white to-accent/5 shadow-level-3 border border-accent/20">
              {/* Decorative pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(var(--color-accent) 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Centered avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 pt-8 z-10">
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-level-2 border-4 border-accent/10 shrink-0">
                  <span className="font-display font-bold text-4xl text-accent-dark">CS</span>
                </div>
                <div className="text-center shrink-0">
                  <p className="font-display font-bold text-lg text-text-dark">{therapist.name}</p>
                  <p className="text-sm text-accent-dark font-semibold mt-0.5">{therapist.title}</p>
                </div>
                {/* Credential chips */}
                <div className="flex flex-col gap-1 w-full mt-1">
                  {therapist.credentials.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 bg-white/90 rounded-xl px-2.5 py-1.5 shadow-sm border border-accent/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-[11px] sm:text-xs font-semibold text-text-dark leading-tight">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-coral/10 rounded-bl-[2rem]" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-cream-200/60 rounded-tr-[2rem]" />
            </div>
          </div>

          {/* Stats grid below image */}
          <motion.div
            className="grid grid-cols-2 gap-4 mt-14 max-w-sm mx-auto lg:mx-0"
            variants={staggerContainer(0.08, 0.3)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className="bg-off-white rounded-2xl p-5 text-center border border-border-light hover:border-coral hover:shadow-level-1 transition-all duration-300"
              >
                <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="font-display font-bold text-2xl text-accent-dark">{value}</p>
                <p className="text-label text-text-gray mt-0.5">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Text Content ── */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <Badge variant="primary" className="mb-5">About Charushri</Badge>

          <Heading
            as="h2"
            subtitle={therapist.bio}
            animate={false}
            className="mb-2"
          >
            A Sanctuary for Your Soul
          </Heading>

          <p className="text-body text-text-gray leading-relaxed mb-8">
            {therapist.bioExtended}
          </p>

          {/* Languages */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-body-sm text-text-gray font-semibold mr-1">Languages:</span>
            {therapist.languages.map((lang) => (
              <Badge key={lang} variant="neutral">{lang}</Badge>
            ))}
          </div>

          {/* Philosophy cards */}
          <div className="flex flex-col gap-4 mb-8">
            {philosophy.map(({ title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="flex gap-4 p-4 rounded-2xl bg-off-white border border-border-light hover:border-coral/30 hover:bg-coral-50/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-body font-bold text-h4 text-text-dark">{title}</p>
                  <p className="text-body-sm text-text-gray mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Specializations */}
          <div className="mb-8">
            <p className="text-body-sm font-semibold text-text-dark mb-3">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {therapist.specializations.map((s) => (
                <span
                  key={s}
                  className="text-label px-3 py-1.5 rounded-full bg-cream-100 text-text-dark border border-cream-300 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <Button icon={ArrowRight} iconPosition="right" size="lg" className="shadow-level-2" as={Link} to="/book">
            Begin Your Journey
          </Button>
        </motion.div>
      </div>
    </Section>
  );
}

export default AboutSection;
