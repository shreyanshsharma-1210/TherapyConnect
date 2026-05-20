/**
 * Generates and downloads a styled HTML receipt as a print-ready page.
 */
export function generateReceipt({ booking, amount, txnId, therapist, status = 'paid', failureReason = '' }) {
  const date   = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const time   = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const ref    = booking?.bookingRef || txnId?.slice(0, 8).toUpperCase() || 'N/A';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt — ${ref}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F9F6F2; color: #2C3333; padding: 40px 20px; }
    .page { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2A7A7B, #1A4A4A); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 700; }
    .header p  { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #D1FAE5; color: #065F46; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 700; margin: 20px auto; }
    .body { padding: 28px; }
    .amount-box { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .amount-box .label { font-size: 12px; color: #C2410C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .amount-box .value { font-size: 36px; font-weight: 700; color: #D98A73; margin-top: 4px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F0EBE3; font-size: 14px; }
    .row:last-child { border-bottom: none; font-weight: 700; }
    .row .lbl { color: #707A7A; }
    .row .val { color: #2C3333; font-weight: 600; text-align: right; max-width: 60%; }
    .footer { padding: 20px 28px; background: #F9F6F2; text-align: center; font-size: 12px; color: #9AA4A4; line-height: 1.8; }
    .footer strong { color: #2A7A7B; }
    @media print { body { padding: 0; background: #fff; } .page { box-shadow: none; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header" style="background:${status === 'failed' ? 'linear-gradient(135deg,#991B1B,#7F1D1D)' : 'linear-gradient(135deg, #2A7A7B, #1A4A4A)'}">
      <h1>🌿 TherapyConnect</h1>
      <p>${status === 'failed' ? 'Payment Failed Notice' : 'Payment Receipt'}</p>
    </div>
    <div class="body">
      <div style="text-align:center">
        <div class="badge" style="${status === 'failed' ? 'background:#FEE2E2;color:#991B1B' : ''}">${status === 'failed' ? '✗ Payment Failed' : '✓ Payment Confirmed'}</div>
      </div>
      ${status === 'failed' && failureReason ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#B91C1C">Reason: ${failureReason}</div>` : ''}
      <div class="amount-box" style="${status === 'failed' ? 'background:#FEF2F2;border-color:#FECACA' : ''}">
        <div class="label" style="${status === 'failed' ? 'color:#B91C1C' : ''}">${status === 'failed' ? 'Amount Charged' : 'Amount Paid'}</div>
        <div class="value" style="${status === 'failed' ? 'color:#DC2626' : ''}">₹${(amount || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="row"><span class="lbl">Booking Ref</span><span class="val">${ref}</span></div>
      <div class="row"><span class="lbl">Transaction ID</span><span class="val" style="font-family:monospace;font-size:12px">${txnId || '—'}</span></div>
      <div class="row"><span class="lbl">Service</span><span class="val">${booking?.service || 'Therapy Session'}</span></div>
      <div class="row"><span class="lbl">Session Date</span><span class="val">${booking?.date || '—'}</span></div>
      <div class="row"><span class="lbl">Session Time</span><span class="val">${booking?.time || '—'}</span></div>
      <div class="row"><span class="lbl">Mode</span><span class="val">${booking?.mode || '—'}</span></div>
      <div class="row"><span class="lbl">Therapist</span><span class="val">${therapist?.name || 'Charushri Suhaney'}</span></div>
      <div class="row"><span class="lbl">Payment Date</span><span class="val">${date}, ${time}</span></div>
      <div class="row"><span class="lbl">Status</span><span class="val" style="color:${status === 'failed' ? '#DC2626' : '#065F46'}">${status === 'failed' ? 'FAILED' : 'PAID'}</span></div>
    </div>
    <div class="footer">
      <p>Thank you for choosing <strong>TherapyConnect</strong></p>
      <p>Questions? charushri@therapyconnect.in</p>
      <p style="margin-top:8px;color:#C8D0D0">This is a computer-generated receipt and does not require a signature.</p>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob   = new Blob([html], { type: 'text/html' });
  const url    = URL.createObjectURL(blob);
  const win    = window.open(url, '_blank');
  if (!win) {
    // Fallback: direct download
    const a = document.createElement('a');
    a.href = url;
    a.download = `TherapyConnect-Receipt-${ref}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
