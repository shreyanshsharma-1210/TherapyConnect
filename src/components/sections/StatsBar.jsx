import { motion } from 'framer-motion';
import { Award, Users, Star, GraduationCap } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { therapist } from '@/data/therapistData';

const stats = [
  { icon: Award,          value: therapist.experience,                     label: 'Years of Practice'   },
  { icon: Users,          value: `${therapist.sessionsCompleted}+`,         label: 'Sessions Completed'  },
  { icon: Star,           value: `${therapist.clientSatisfaction}%`,        label: 'Client Satisfaction' },
  { icon: GraduationCap,  value: `${therapist.credentials.length}`,         label: 'Certifications'      },
];

function StatsBar() {
  return (
    <div className="relative bg-[#FCF9F6] border-y border-border-light overflow-hidden">
      <div className="relative max-w-container mx-auto px-4 md:px-8 py-12">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 text-text-dark ${
                i < stats.length - 1 ? 'md:border-r md:border-border-light md:pr-8' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display font-bold text-3xl md:text-4xl leading-none">{value}</p>
                <p className="text-body-sm text-text-gray mt-1.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default StatsBar;
