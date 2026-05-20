import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-off-white px-4">
      <motion.div
        className="text-center max-w-lg"
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={staggerItem}
          className="font-display font-bold text-8xl text-coral-100 mb-0 leading-none select-none"
          aria-hidden="true"
        >
          404
        </motion.p>
        <motion.h1
          variants={staggerItem}
          className="font-display font-bold text-h2 text-text-dark -mt-4 mb-4"
        >
          Page Not Found
        </motion.h1>
        <motion.p variants={staggerItem} className="text-body text-text-gray mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          Let&rsquo;s get you back on track.
        </motion.p>
        <motion.div
          variants={staggerItem}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button icon={Home} as={Link} to="/">
            Back to Home
          </Button>
          <Button variant="secondary" icon={ArrowLeft} as={Link} to="/#contact">
            Contact Support
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;
