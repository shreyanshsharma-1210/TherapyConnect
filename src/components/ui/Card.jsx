import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function Card({ children, className, hover = true, padding = 'default', as: Tag = 'div', ...props }) {
  const paddings = {
    none:    '',
    sm:      'p-4',
    default: 'p-6',
    lg:      'p-8',
  };

  const base = cn(
    'bg-white rounded-card shadow-level-1',
    hover && 'transition-all duration-300 hover:shadow-level-2 hover:-translate-y-1',
    paddings[padding],
    className
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn('bg-white rounded-card shadow-level-1', paddings[padding], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Tag className={base} {...props}>
      {children}
    </Tag>
  );
}

function CardHeader({ children, className }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

function CardBody({ children, className }) {
  return <div className={cn('', className)}>{children}</div>;
}

function CardFooter({ children, className }) {
  return <div className={cn('mt-4 pt-4 border-t border-border-light', className)}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export default Card;
