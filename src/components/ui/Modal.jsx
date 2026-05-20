import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { overlayFade, scaleIn } from '@/lib/animations';

function Modal({ isOpen, onClose, title, children, className, size = 'md' }) {
  const closeRef = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'relative bg-white rounded-[2rem] shadow-level-3 w-full max-h-[90vh] flex flex-col overflow-hidden',
              sizes[size],
              className
            )}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header — sticky at top */}
            <div className="flex items-center justify-between px-7 pt-7 pb-4 shrink-0">
              {title && (
                <h2
                  id="modal-title"
                  className="font-display font-bold text-h3 text-text-dark"
                >
                  {title}
                </h2>
              )}
              <button
                ref={closeRef}
                onClick={onClose}
                className="ml-auto p-2 rounded-full text-text-gray hover:bg-off-white hover:text-text-dark transition-colors duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto px-7 pb-7 flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
