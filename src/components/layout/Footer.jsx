import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Globe, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import Container from '@/components/common/Container';

const footerLinks = {
  Services: [
    { label: 'Loneliness Wellness', to: '/#services' },
    { label: 'Anxiety Counselling', to: '/#services' },
    { label: 'Emotional Connection', to: '/#services' },
    { label: 'Psychosomatic Wellness', to: '/#services' },
    { label: 'Self-Awareness Journey', to: '/#services' },
  ],
  Explore: [
    { label: 'About Charushri', to: '/#about' },
    { label: 'Schedule a Conversation', to: '/book' },
    { label: 'Blog & Resources', to: '/#blog' },
    { label: 'Pricing Plans', to: '/#pricing' },
    { label: 'Testimonials', to: '/#testimonials' },
    { label: 'Contact', to: '/#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',           to: '/privacy'             },
    { label: 'Terms of Service',          to: '/terms'               },
    { label: 'Cancellation & Refunds',    to: '/cancellation-policy' },
  ],
};

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail('');
  };

  return (
    <div className="border-b border-white/10 pb-12 mb-12">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Gentle Insights for Your Inbox
          </h3>
          <p className="text-body-sm text-gray-400">
            Reflections on solitude, connection, and the gentle art of healing — shared once a month.
          </p>
        </div>
        {done ? (
          <div className="flex items-center gap-2 text-coral-400 font-semibold text-body-sm">
            <CheckCircle2 className="w-5 h-5" />
            You're subscribed! Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-btn px-4 py-3 min-h-[44px] text-body-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-white/15 transition-colors duration-200"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-btn bg-accent hover:bg-accent-dark text-white transition-colors duration-200 shrink-0"
              aria-label="Subscribe to newsletter"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white" role="contentinfo">
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--color-accent), #E77F67, var(--color-primary))' }} />

      <Container>
        <div className="pt-16 pb-0">
          <Newsletter />

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-5 group">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white group-hover:bg-accent-dark transition-colors duration-200">
                  <Heart className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="font-display font-bold text-xl tracking-tight">
                  Charushri<span className="text-accent">Suhaney</span>
                </span>
              </Link>
              <p className="text-body-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                A sanctuary for emotional healing, self-awareness, and the gentle art of human connection.
              </p>

              {/* Contact info */}
              <ul className="flex flex-col gap-3">
                {[
                  { Icon: Phone, value: '+91 98765 43210', href: 'tel:+919039705759' },
                  { Icon: Mail, value: 'connect@charushri.com', href: 'mailto:connect@charushri.com' },
                  { Icon: MapPin, value: 'Bengaluru, India', href: null },
                ].map(({ Icon, value, href }) => (
                  <li key={value} className="flex items-center gap-2.5 text-body-sm text-gray-400">
                    <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    {href ? (
                      <a href={href} className="hover:text-white transition-colors duration-200">{value}</a>
                    ) : (
                      <span>{value}</span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-6">
                {[
                  { label: 'Website', Icon: Globe },
                  { label: 'LinkedIn', Icon: ExternalLink },
                ].map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-accent hover:text-white transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h3 className="text-body-sm font-bold text-white uppercase tracking-widest mb-5">
                  {group}
                </h3>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-body-sm text-gray-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-label text-gray-500">
              © {new Date().getFullYear()} Charushri Suhaney · Holistic Wellness · All rights reserved.
            </p>
            <p className="text-label text-gray-600 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 fill-coral text-coral mx-0.5" aria-hidden="true" /> for mental health
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
