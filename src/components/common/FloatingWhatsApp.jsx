import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { therapist } from '@/data/therapistData';
import { useBooking } from '@/hooks/useBooking';
import { cn } from '@/lib/utils';

const PHONE = '919039705759';

function buildMessage(selectedDate, selectedTime, selectedService) {
  if (selectedDate && selectedTime) {
    return `Hi Charushri! I've selected ${selectedDate} at ${selectedTime}${selectedService ? ` for ${selectedService.title}` : ''}. I'd like to confirm my booking. Is this slot still available?`;
  }
  return `Hi Charushri! I found your sanctuary online and I'd like to begin a conversation. Could you please help me with available slots?`;
}

function FloatingWhatsApp() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { selectedDate, selectedTime, selectedService } = useBooking();

  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show tooltip after first appearance
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 800);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleClick = () => {
    const message = buildMessage(selectedDate, selectedTime, selectedService);
    const encoded = encodeURIComponent(message);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = isMobile
      ? `whatsapp://send?phone=${PHONE}&text=${encoded}`
      : `https://web.whatsapp.com/send?phone=${PHONE}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed right-4 sm:right-6 z-50 flex flex-col items-end gap-2 transition-all duration-300",
        isDashboard ? "bottom-24 lg:bottom-10" : "bottom-24 sm:bottom-10"
      )}
      aria-label="Contact via WhatsApp"
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="bg-white rounded-2xl shadow-level-2 border border-border-light px-4 py-3 max-w-[220px] relative"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-2.5 h-2.5 text-gray-600" />
            </button>
            <p className="text-body-sm font-semibold text-text-dark leading-snug text-right">
              Chat with Charushri
            </p>
            <p className="text-label text-text-gray mt-0.5 text-right">
              Usually replies within an hour
            </p>
            {/* Triangle */}
            <div className="absolute -bottom-2 right-5 w-4 h-2 overflow-hidden">
              <div className="w-3 h-3 bg-white border-l border-b border-border-light rotate-45 translate-y-[-6px] translate-x-[-2px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)] transition-shadow duration-300"
        aria-label="Open WhatsApp chat with Charushri"
      >
        <MessageCircle className="w-7 h-7 text-white fill-white" aria-hidden="true" />
        {/* Online dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
      </motion.button>
    </div>
  );
}

export default FloatingWhatsApp;
