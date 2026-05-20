import SEO from '@/components/common/SEO';

const LAST_UPDATED = 'May 12, 2025';

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-bold text-h3 text-text-dark mb-3">{title}</h2>
      <div className="text-body text-text-gray leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Learn how TherapyConnect collects, uses, and protects your personal information."
        path="/privacy"
        noIndex={false}
      />
      <div className="bg-off-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-10">
            <span className="text-label font-bold text-teal-600 uppercase tracking-widest">Legal</span>
            <h1 className="font-display font-bold text-h1 text-text-dark mt-2">Privacy Policy</h1>
            <p className="text-body-sm text-text-gray mt-2">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 text-body-sm text-amber-800">
            <strong>Your privacy matters.</strong> TherapyConnect is committed to protecting your personal and sensitive health information in accordance with applicable Indian laws, including the Information Technology Act, 2000 and the DPDP Act, 2023.
          </div>

          <Section title="1. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> name, email address, phone number</li>
              <li><strong>Booking information:</strong> session date, time, mode, reason for consultation</li>
              <li><strong>Payment information:</strong> transaction IDs, payment status (we do NOT store card numbers — payments are processed by Razorpay)</li>
              <li><strong>Usage data:</strong> pages visited, features used, session duration (anonymized)</li>
              <li><strong>Communications:</strong> messages you send us via contact forms or email</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To schedule and manage your therapy sessions</li>
              <li>To send booking confirmations, reminders, and receipts</li>
              <li>To process payments securely via Razorpay</li>
              <li>To improve our platform and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>We do NOT sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. Sensitive Health Information">
            <p>Any health information you share (reason for consultation, session notes) is treated with the highest confidentiality. This information is:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Accessible only to the therapist and relevant staff</li>
              <li>Never shared with insurance companies or employers without your explicit written consent</li>
              <li>Stored securely on Supabase's encrypted infrastructure</li>
            </ul>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>Your data is stored on Supabase's cloud infrastructure with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Row-level security (RLS) ensuring only you and authorized staff can access your records</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>AES-256 encryption at rest</li>
              <li>Regular security audits</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following trusted third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Razorpay</strong> — payment processing (PCI DSS compliant)</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>PostHog</strong> — privacy-safe analytics (anonymized)</li>
              <li><strong>Sentry</strong> — error monitoring (no personal data in error logs)</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>We use essential cookies for authentication and session management. Analytics cookies are only activated with your consent. You can manage cookie preferences at any time via our Cookie Settings.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>Under applicable Indian law and global best practices, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for analytics tracking</li>
            </ul>
            <p>To exercise these rights, email: <a href="mailto:privacy@therapyconnect.in" className="text-teal-600 hover:underline">privacy@therapyconnect.in</a></p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>TherapyConnect is intended for users aged 18 and above. We do not knowingly collect personal information from minors.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Significant changes will be communicated via email. Continued use of the platform after changes constitutes acceptance.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy-related inquiries: <a href="mailto:privacy@therapyconnect.in" className="text-teal-600 hover:underline">privacy@therapyconnect.in</a></p>
            <p>TherapyConnect, Bengaluru, Karnataka, India.</p>
          </Section>
        </div>
      </div>
    </>
  );
}
