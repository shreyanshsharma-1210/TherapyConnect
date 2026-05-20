import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from './Container';

function Section({
  children,
  className,
  containerClassName,
  id,
  bg = 'white',
  animate = true,
  narrow = false,
  ...props
}) {
  const backgrounds = {
    white:   'bg-white',
    offwhite: 'bg-off-white',
    cream:   'bg-cream-50',
    coral:    'bg-coral-50',
    dark:    'bg-text-dark text-white',
  };

  const content = (
    <section
      id={id}
      className={cn(
        'py-16 lg:py-24',
        backgrounds[bg],
        className
      )}
      {...props}
    >
      <Container narrow={narrow} className={containerClassName}>
        {children}
      </Container>
    </section>
  );

  if (!animate) return content;

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      className={cn('py-16 lg:py-24', backgrounds[bg], className)}
      {...props}
    >
      <Container narrow={narrow} className={containerClassName}>
        {children}
      </Container>
    </motion.section>
  );
}

export default Section;
