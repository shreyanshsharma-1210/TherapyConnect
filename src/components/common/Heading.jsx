import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function Heading({
  as: Tag = 'h2',
  children,
  subtitle,
  align = 'left',
  className,
  subtitleClassName,
  animate = true,
}) {
  const alignClass = {
    left:   'text-left',
    center: 'text-center mx-auto',
    right:  'text-right ml-auto',
  };

  const tagSizeMap = {
    h1: 'text-h1',
    h2: 'text-h2',
    h3: 'text-h3',
    h4: 'text-h4',
  };

  const content = (
    <div className={cn('mb-10', alignClass[align])}>
      <Tag
        className={cn(
          'font-display font-bold text-text-dark leading-tight',
          tagSizeMap[Tag] || 'text-h2',
          className
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-body-lg text-text-gray max-w-2xl',
            align === 'center' && 'mx-auto',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      className={cn('mb-10', alignClass[align])}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Tag
        className={cn(
          'font-display font-bold text-text-dark leading-tight',
          tagSizeMap[Tag] || 'text-h2',
          className
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-body-lg text-text-gray max-w-2xl',
            align === 'center' && 'mx-auto',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default Heading;
