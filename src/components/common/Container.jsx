import { cn } from '@/lib/utils';

function Container({ children, className, narrow = false, ...props }) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 md:px-8',
        narrow ? 'max-w-3xl' : 'max-w-container',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
