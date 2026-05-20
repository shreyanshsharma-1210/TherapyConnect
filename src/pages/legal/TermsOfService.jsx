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

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Terms and conditions for using the TherapyConnect platform and booking therapy sessions."
        path="/terms"
      />
      <div className="bg-off-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-10">
            <span className="text-label font-bold text-teal-600 uppercase tracking-widest">Legal</span>
            <h1 className="font-display font-bold text-h1 text-text-dark mt-2">Terms of Service</h1>
            <p className="text-body-sm text-text-gray mt-2">Last updated: {LAST_UPDATED}</p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using TherapyConnect ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
          </Section>

          <Section title="2. Services Provided">
            <p>TherapyConnect provides a technology platform to connect clients with licensed therapist Charushri Suhaney for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Individual therapy sessions</li>
              <li>Couples therapy sessions</li>
              <li>Holistic wellness consultations</li>
              <li>Online and in-person therapy</li>
            </ul>
          </Section>

          <Section title="3. Not a Crisis Service">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 font-medium">
              TherapyConnect is NOT a crisis or emergency service. If you are experiencing a mental health emergency or are at risk of harm, please immediately contact:
              <ul className="mt-2 list-disc pl-5 space-y-1 font-normal">
                <li>iCall: 9152987821</li>
                <li>Vandrevala Foundation: 1860-2662-345 (24/7)</li>
                <li>Emergency: 112</li>
              </ul>
            </div>
          </Section>

          <Section title="4. Booking & Payment">
            <ul className="list-disc pl-5 space-y-1">
              <li>Bookings are confirmed only upon successful payment</li>
              <li>Session fees are as displayed at time of booking</li>
              <li>Payments are processed securely by Razorpay</li>
              <li>TherapyConnect does not store your payment card information</li>
            </ul>
          </Section>

          <Section title="5. Cancellation & Rescheduling">
            <p>Please refer to our <a href="/cancellation-policy" className="text-teal-600 hover:underline">Cancellation & Refund Policy</a> for complete details.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cancellations 24+ hours before the session: eligible for refund</li>
              <li>Cancellations within 24 hours: no refund</li>
              <li>Therapist-initiated cancellations: full refund</li>
            </ul>
          </Section>

          <Section title="6. Confidentiality">
            <p>All session content is confidential. Exceptions include situations where disclosure is legally required (e.g., imminent risk of harm, court order). Please review our Privacy Policy for full details.</p>
          </Section>

          <Section title="7. Prohibited Uses">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the platform for any unlawful purpose</li>
              <li>Harass, threaten, or abuse the therapist or platform</li>
              <li>Share session recordings without explicit consent</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Impersonate another person</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            <p>All content on TherapyConnect including blog posts, service descriptions, and design elements is owned by TherapyConnect or Charushri Suhaney and may not be reproduced without written permission.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>TherapyConnect is not liable for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Outcomes of therapy sessions</li>
              <li>Technical disruptions affecting session delivery</li>
              <li>Third-party service failures (payment, video, email)</li>
            </ul>
            <p>Our maximum liability is limited to the amount paid for the specific session in question.</p>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms are governed by the laws of India. Disputes shall be resolved through arbitration in Bengaluru, Karnataka, under the Arbitration and Conciliation Act, 1996.</p>
          </Section>

          <Section title="11. Contact">
            <p>For terms-related questions: <a href="mailto:legal@therapyconnect.in" className="text-teal-600 hover:underline">legal@therapyconnect.in</a></p>
          </Section>
        </div>
      </div>
    </>
  );
}
