import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      {/* Top bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-accent">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-text-dark text-lg">TherapyConnect</span>
        </Link>
        <Link to="/" className="text-body-sm text-text-gray hover:text-coral transition-colors duration-200">
          Back to Home
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-[2rem] shadow-level-2 border border-border-light p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-teal-500 fill-teal-100" />
              </div>
              <h1 className="font-display font-bold text-h3 text-text-dark mb-2">{title}</h1>
              {subtitle && <p className="text-body-sm text-text-gray">{subtitle}</p>}
            </div>
            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-label text-text-gray mt-6">
            Your privacy and confidentiality are fully protected.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
