import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, Calendar, Users,
  Download, BarChart3, Clock, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader, StatCard } from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MiniBar({ value, max, color = 'bg-teal-500' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-label text-text-gray w-6 text-right">{value}</span>
    </div>
  );
}

export default function AdminReporting() {
  const [bookings, setBookings]   = useState([]);
  const [payments, setPayments]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [range,    setRange]      = useState('30');

  useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - parseInt(range));

    Promise.all([
      supabase.from('bookings').select('*').gte('created_at', since.toISOString()),
      supabase.from('payments').select('*').eq('status', 'paid').gte('created_at', since.toISOString()),
    ]).then(([bRes, pRes]) => {
      setBookings(bRes.data || []);
      setPayments(pRes.data || []);
    }).finally(() => setLoading(false));
  }, [range]);

  // Calculate refund amount for a cancelled booking based on cancellation policy
  const calcRefund = (booking) => {
    const amount = booking.amount_inr || 0;
    if (booking.status !== 'cancelled' || amount === 0) return 0;
    const cancelledAt = booking.cancelled_at ? new Date(booking.cancelled_at) : new Date();
    const sessionAt   = new Date(`${booking.session_date}T${booking.session_time || '00:00'}`);
    const hoursToSession = (sessionAt - cancelledAt) / (1000 * 60 * 60);
    if (hoursToSession > 24) return amount;       // Full refund
    if (hoursToSession > 0)  return amount * 0.5; // 50% refund within 24h
    return 0; // No refund after session time
  };

  const stats = useMemo(() => {
    const grossRevenue    = payments.reduce((s, p) => s + (p.amount_inr || 0), 0);
    const confirmed       = bookings.filter((b) => ['confirmed', 'completed', 'upcoming'].includes(b.status)).length;
    const cancelled       = bookings.filter((b) => b.status === 'cancelled').length;
    const conversionRate  = bookings.length ? Math.round((confirmed / bookings.length) * 100) : 0;

    // Refunds: sum up refund amounts for cancelled bookings
    const totalRefunds = bookings
      .filter((b) => b.status === 'cancelled')
      .reduce((s, b) => s + calcRefund(b), 0);

    const netRevenue = grossRevenue - totalRefunds;

    // Group revenue by month (net of refunds)
    const revenueByMonth = {};
    payments.forEach((p) => {
      const m = MONTHS[new Date(p.created_at).getMonth()];
      revenueByMonth[m] = (revenueByMonth[m] || 0) + (p.amount_inr || 0);
    });

    // Group bookings by service (only active)
    const byService = {};
    bookings.forEach((b) => {
      const s = b.service_title || 'Other';
      byService[s] = (byService[s] || 0) + 1;
    });

    // Group bookings by day of week
    const byDay = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
    bookings.forEach((b) => {
      const d = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(b.session_date).getDay()];
      if (d) byDay[d]++;
    });

    return { grossRevenue, netRevenue, totalRefunds, confirmed, cancelled, conversionRate, revenueByMonth, byService, byDay };
  }, [bookings, payments]);

  const exportCSV = () => {
    const rows = [
      ['Booking Ref','Service','Date','Time','Mode','Status','Amount'],
      ...bookings.map((b) => [
        b.booking_ref, b.service_title, b.session_date, b.session_time,
        b.session_mode, b.status, b.amount_inr,
      ]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `therapyconnect-report-${range}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxService = Math.max(...Object.values(stats.byService), 1);
  const maxDay     = Math.max(...Object.values(stats.byDay), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader title="Reporting & Insights" subtitle="Business performance overview" />
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border-light overflow-hidden">
            {[['7','7 days'],['30','30 days'],['90','90 days']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setRange(v)}
                className={cn(
                  'px-4 py-2 text-body-sm font-semibold transition-colors',
                  range === v ? 'bg-teal-600 text-white' : 'bg-white text-text-gray hover:bg-cream-50'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light text-text-dark text-body-sm font-semibold rounded-xl hover:border-teal-400 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Revenue"
          value={`₹${Math.max(0, stats.netRevenue).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="teal"
          loading={loading}
        />
        <StatCard
          title="Gross Revenue"
          value={`₹${stats.grossRevenue.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Refunds"
          value={`₹${stats.totalRefunds.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="coral"
          loading={loading}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={CheckCircle2}
          color="coral"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings by service */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h3 className="font-body font-bold text-text-dark">Bookings by Service</h3>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-5 bg-cream-50 rounded animate-pulse" />)}</div>
          ) : Object.keys(stats.byService).length === 0 ? (
            <p className="text-body-sm text-text-gray text-center py-6">No data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(stats.byService)
                .sort((a, b) => b[1] - a[1])
                .map(([service, count]) => (
                <div key={service}>
                  <p className="text-body-sm text-text-dark font-semibold mb-1 truncate">{service}</p>
                  <MiniBar value={count} max={maxService} color="bg-teal-500" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bookings by day */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-coral" />
            <h3 className="font-body font-bold text-text-dark">Busiest Days</h3>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-5 bg-cream-50 rounded animate-pulse" />)}</div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(stats.byDay).map(([day, count]) => (
                <div key={day}>
                  <p className="text-body-sm text-text-dark font-semibold mb-1">{day}</p>
                  <MiniBar value={count} max={maxDay} color="bg-coral" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent bookings table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-border-light shadow-level-1 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border-light flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <h3 className="font-body font-bold text-text-dark">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-light bg-cream-50">
                {['Ref','Client','Service','Date','Mode','Status','Amount'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-label font-bold text-text-gray uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-gray">Loading…</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-gray">No bookings in this period</td></tr>
              ) : (
                bookings.slice(0, 20).map((b) => (
                  <tr key={b.id} className="border-b border-border-light last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-label">{b.booking_ref || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-text-dark">{b.client_name}</td>
                    <td className="px-4 py-3 text-text-gray">{b.service_title}</td>
                    <td className="px-4 py-3 text-text-gray">{b.session_date}</td>
                    <td className="px-4 py-3 text-text-gray capitalize">{b.session_mode}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-label font-bold px-2.5 py-0.5 rounded-full border',
                        b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                        b.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      )}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {b.status === 'cancelled' ? (
                        <div>
                          <span className="text-red-400 line-through text-label">₹{(b.amount_inr || 0).toLocaleString('en-IN')}</span>
                          <span className="block text-label text-text-gray">
                            Refund: ₹{calcRefund(b).toLocaleString('en-IN')}
                            {(() => {
                              const hrs = (new Date(`${b.session_date}T${b.session_time || '00:00'}`) - new Date(b.cancelled_at || Date.now())) / 3600000;
                              return hrs > 24 ? ' (100%)' : hrs > 0 ? ' (50%)' : ' (0%)';
                            })()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-dark">₹{(b.amount_inr || 0).toLocaleString('en-IN')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
