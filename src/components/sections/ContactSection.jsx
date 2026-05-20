import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Phone, Mail, MapPin, Clock, MessageCircle,
  Send, CheckCircle2, Globe, ExternalLink,
} from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem, slideInLeft, slideInRight } from '@/lib/animations';
import { therapist } from '@/data/therapistData';
import { contactSchema } from '@/utils/validation';

const contactCards = [
  {
    icon: Phone,
    label: 'Call / WhatsApp',
    value: therapist.contact.phone,
    href: `tel:${therapist.contact.phone}`,
    color: 'bg-coral-50 text-coral',
  },
  {
    icon: Mail,
    label: 'Email',
    value: therapist.contact.email,
    href: `mailto:${therapist.contact.email}`,
    color: 'bg-cream-100 text-text-dark',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: therapist.location,
    href: '#',
    color: 'bg-coral-50 text-coral-500',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: therapist.availability,
    href: null,
    color: 'bg-off-white text-text-gray',
  },
];

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Contact form:', data);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Section id="contact" bg="offwhite">
      <Heading
        align="center"
        subtitle="Have a question or want to get started? Reach out — I'd love to hear from you."
      >
        Get in Touch
      </Heading>

      <div className="grid lg:grid-cols-2 gap-14 items-start">

        {/* ── Left: Contact info ── */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${therapist.contact.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-[1.25rem] bg-green-50 border border-green-200 hover:bg-green-100 transition-colors duration-300 mb-8 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-success text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-level-1">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-body font-bold text-h4 text-text-dark">Chat on WhatsApp</p>
              <p className="text-body-sm text-text-gray mt-0.5">
                Usually replies within 2 hours · Mon–Sat
              </p>
            </div>
          </a>

          {/* Contact cards grid */}
          <motion.div
            className="grid sm:grid-cols-2 gap-4 mb-8"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactCards.map(({ icon: Icon, label, value, href, color }) => (
              <motion.div key={label} variants={staggerItem}>
                {href ? (
                  <a
                    href={href}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border-light hover:border-coral-200 hover:shadow-level-1 transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-label text-text-gray">{label}</p>
                      <p className="text-body-sm font-semibold text-text-dark mt-0.5 break-words">{value}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border-light">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-label text-text-gray">{label}</p>
                      <p className="text-body-sm font-semibold text-text-dark mt-0.5">{value}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Address card */}
          <div className="p-5 rounded-2xl bg-white border border-border-light">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral-50 text-coral flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label text-text-gray mb-1">Office Address</p>
                <p className="text-body-sm font-semibold text-text-dark leading-relaxed">
                  {therapist.contact.address}
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-label text-coral font-semibold mt-2 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 mt-6">
            {[
              { label: 'Website',  Icon: Globe        },
              { label: 'LinkedIn', Icon: ExternalLink  },
            ].map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-gray hover:bg-coral hover:text-white hover:border-coral transition-all duration-200 shadow-level-1"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* ── Right: Contact Form ── */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="bg-white rounded-[2rem] p-8 shadow-level-2 border border-border-light"
        >
          <h3 className="font-body font-bold text-h3 text-text-dark mb-2">Send a Message</h3>
          <p className="text-body-sm text-text-gray mb-7">
            Fill in your details and I&rsquo;ll get back to you within 24 hours.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-10 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-body font-bold text-h4 text-text-dark">Message Sent!</h4>
              <p className="text-body-sm text-text-gray">
                Thank you for reaching out. I&rsquo;ll respond within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Your Name"
                  required
                  placeholder="Priya Sharma"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="hello@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <Input
                label="Subject"
                required
                placeholder="I'd like to enquire about…"
                error={errors.subject?.message}
                {...register('subject')}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-label font-medium text-text-dark tracking-wide">
                  Message <span className="text-error ml-1" aria-hidden="true">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell me a bit about what you're looking for…"
                  className={`input-field resize-none ${errors.message ? 'input-error' : ''}`}
                  {...register('message')}
                />
                {errors.message && (
                  <p role="alert" className="text-body-sm text-error">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                icon={Send}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </Button>

              <p className="text-label text-center text-text-gray">
                Your information is kept strictly confidential.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </Section>
  );
}

export default ContactSection;
