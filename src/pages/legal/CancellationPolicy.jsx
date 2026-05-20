import SEO from '@/components/common/SEO';
import { Link } from 'react-router-dom';

export default function CancellationPolicy() {
  return (
    <>
      <SEO
        title="Cancellation & Refund Policy"
        description="Understand our session cancellation, rescheduling, and refund policies at TherapyConnect."
        path="/cancellation-policy"
      />
      <div className="bg-off-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-10">
            <span className="text-label font-bold text-teal-600 uppercase tracking-widest">Legal</span>
            <h1 className="font-display font-bold text-h1 text-text-dark mt-2">Cancellation & Refund Policy</h1>
            <p className="text-body-sm text-text-gray mt-2">Last updated: May 12, 2025</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: '24+ hrs before', badge: 'Full Refund', color: 'bg-green-50 border-green-200 text-green-800' },
              { label: 'Within 24 hrs', badge: 'No Refund', color: 'bg-red-50 border-red-200 text-red-800' },
              { label: 'Therapist cancels', badge: 'Full Refund', color: 'bg-teal-50 border-teal-200 text-teal-800' },
            ].map(({ label, badge, color }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${color}`}>
                <p className="text-body-sm font-semibold mb-1">{label}</p>
                <p className="font-display font-bold text-lg">{badge}</p>
              </div>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="font-display font-bold text-h3 text-text-dark mb-3">Cancellation by Client</h2>
            <div className="text-body text-text-gray leading-relaxed space-y-3">
              <p><strong>More than 24 hours before session:</strong> You are eligible for a full refund to your original payment method within 5–7 business days.</p>
              <p><strong>Within 24 hours of session:</strong> No refund will be issued. We strongly encourage rescheduling instead, which can be done via your dashboard.</p>
              <p><strong>No-show:</strong> If you do not attend your session without notice, no refund will be issued.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-display font-bold text-h3 text-text-dark mb-3">Cancellation by Therapist</h2>
            <div className="text-body text-text-gray leading-relaxed space-y-3">
              <p>In the rare event that a session is cancelled by the therapist:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You will receive a full refund within 3–5 business days</li>
                <li>You will be given priority for rescheduling at your preferred time</li>
                <li>You will be notified via email and in-app notification</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-display font-bold text-h3 text-text-dark mb-3">Rescheduling</h2>
            <div className="text-body text-text-gray leading-relaxed space-y-3">
              <p>Sessions can be rescheduled free of charge up to 24 hours before the scheduled time. To reschedule, visit your <Link to="/dashboard" className="text-teal-600 hover:underline">dashboard</Link> or contact us.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-display font-bold text-h3 text-text-dark mb-3">Refund Process</h2>
            <div className="text-body text-text-gray leading-relaxed space-y-3">
              <p>Approved refunds are processed to the original payment method:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>UPI / Net Banking: 1–3 business days</li>
                <li>Credit / Debit Card: 5–7 business days</li>
              </ul>
              <p>To request a refund, email <a href="mailto:support@therapyconnect.in" className="text-teal-600 hover:underline">support@therapyconnect.in</a> with your booking reference.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-display font-bold text-h3 text-text-dark mb-3">Technical Issues</h2>
            <p className="text-body text-text-gray leading-relaxed">If a session cannot proceed due to technical issues on our end (platform downtime, video failure), a full refund or complimentary reschedule will be offered. Technical issues on the client side (internet outage, device failure) are not grounds for refund.</p>
          </section>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 text-body-sm text-teal-800">
            For any refund or cancellation queries, contact us at <a href="mailto:support@therapyconnect.in" className="font-semibold hover:underline">support@therapyconnect.in</a>
          </div>
        </div>
      </div>
    </>
  );
}
