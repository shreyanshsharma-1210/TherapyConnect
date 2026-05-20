import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

function RouteTransition({ children }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, y: -6  }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default RouteTransition;
