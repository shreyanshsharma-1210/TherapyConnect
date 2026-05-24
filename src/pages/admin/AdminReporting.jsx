import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, Calendar, Users,
  Download, BarChart3, Clock, CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader, StatCard, AdminSelect, AdminBtn, AdminInput } from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';
import { formatCurrency, formatShortDate } from '@/utils/formatting';
import { useToast } from '@/context/ToastContext';
import { useInvalidation, keys } from '@/lib/invalidationManager';
import { useRealtimeSubscription } from '@/lib/realtime/realtimeManager';

const FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7',     label: '7 Days' },
  { value: '30',    label: '30 Days' },
  { value: '90',    label: '90 Days' },
  { value: 'year',  label: 'This Year' },
  { value: 'custom',label: 'Custom Range' },
];

function MiniBar({ value, max, color = 'bg-teal-500' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-label text-text-gray w-8 text-right font-mono">{value}</span>
    </div>
  );
}

export default function AdminReporting() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [stats, setStats] = useState({
    grossRevenue: 0, netRevenue: 0, totalRefunds: 0,
    totalBookings: 0, confirmed: 0, completed: 0, cancelled: 0, conversionRate: 0,
    byService: {}, byDay: {}, revenueByDate: {}
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const getDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (range === 'year') {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'custom') {
      return { 
        start: customStart ? new Date(customStart) : start, 
        end: customEnd ? new Date(customEnd) : end 
      };
    } else {
      start.setDate(start.getDate() - parseInt(range));
    }
    return { start, end };
  }, [range, customStart, customEnd]);

  const loadAnalytics = useCallback(async () => {
    if (range === 'custom' && (!customStart || !customEnd)) return;
    setLoading(true);
    
    try {
      const { start, end } = getDateRange();
      
      const { data: summary, error: rpcErr } = await supabase.rpc('get_analytics_summary', {
        start_date: start.toISOString(),
        end_date: end.toISOString()
      });
      if (rpcErr) throw rpcErr;

      const { data: bookings, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
      if (bErr) throw bErr;

      setStats({
        grossRevenue: summary.grossRevenue || 0,
        netRevenue: summary.netRevenue || 0,
        totalRefunds: summary.totalRefunds || 0,
        totalBookings: summary.totalBookings || 0,
        confirmed: summary.confirmed || 0,
        completed: summary.completed || 0,
        cancelled: summary.cancelled || 0,
        conversionRate: summary.conversionRate || 0,
        byService: summary.byService || {},
        byDay: summary.byDay || {},
        revenueByDate: summary.revenueByDate || {}
      });
      setRecentBookings(bookings || []);

    } catch (err) {
      console.error('[Analytics] Load error:', err);
      toast({ type: 'error', title: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  }, [getDateRange, range, customStart, customEnd, toast]);

  // Centralized realtime subscriptions — no more scattered channels
  useRealtimeSubscription('bookings');
  useRealtimeSubscription('payments');

  // Reload analytics when booking or payment data changes
  useInvalidation(keys.BOOKINGS, loadAnalytics);
  useInvalidation(keys.PAYMENTS, loadAnalytics);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const { start, end } = getDateRange();
      const { data, error } = await supabase
        .from('bookings')
        .select('*, payments(*)')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const rows = [
        ['Booking Ref','Client Name','Client Email','Service','Date','Time','Mode','Status','Amount INR','Payment Status','Created At']
      ];
      data.forEach(b => {
        const pStatus = b.payments?.[0]?.status || 'pending';
        rows.push([
          b.booking_ref, b.client_name, b.client_email, b.service_title, b.session_date, b.session_time,
          b.session_mode, b.status, b.amount_inr, pStatus, b.created_at
        ]);
      });
      
      const csv  = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `therapyconnect-export-${range}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ type: 'success', title: 'Export completed successfully' });
    } catch (err) {
      console.error('[Export] Error:', err);
      toast({ type: 'error', title: 'Export failed' });
    } finally {
      setExporting(false);
    }
  };

  const maxService = Math.max(...Object.values(stats.byService), 1);
  const maxDay     = Math.max(...Object.values(stats.byDay), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader title="Revenue & Booking Analytics" subtitle="Comprehensive platform insights" />
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
            {FILTER_OPTIONS.filter(f => f.value !== 'custom').map(f => (
              <button
                key={f.value}
                onClick={() => setRange(f.value)}
                className={cn(
                  'px-3.5 py-2 text-label font-semibold transition-colors border-r border-border-light last:border-0',
                  range === f.value ? 'bg-teal-600 text-white' : 'text-text-gray hover:bg-cream-50'
                )}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setRange('custom')}
              className={cn(
                'px-3.5 py-2 text-label font-semibold transition-colors',
                range === 'custom' ? 'bg-teal-600 text-white' : 'text-text-gray hover:bg-cream-50'
              )}
            >
              Custom
            </button>
          </div>
          
          <AdminBtn
            onClick={exportCSV}
            variant="secondary"
            loading={exporting}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4" /> Export CSV
          </AdminBtn>
        </div>
      </div>

      {range === 'custom' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 items-end">
          <AdminInput type="date" label="Start Date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-40" />
          <AdminInput type="date" label="End Date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-40" />
          <AdminBtn onClick={loadAnalytics} disabled={!customStart || !customEnd}>Apply Filter</AdminBtn>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Revenue"
          value={formatCurrency(stats.netRevenue)}
          icon={IndianRupee}
          color="teal"
          loading={loading}
        />
        <StatCard
          label="Gross Revenue"
          value={formatCurrency(stats.grossRevenue)}
          icon={TrendingUp}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={CalendarDays}
          color="coral"
          trend={`${stats.conversionRate}% conversion rate`}
          loading={loading}
        />
        <StatCard
          label="Completed Sessions"
          value={stats.completed.toLocaleString()}
          icon={CheckCircle2}
          color="amber"
          trend={`${stats.cancelled} cancelled`}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings by service */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h3 className="font-body font-bold text-text-dark">Bookings by Service</h3>
          </div>
          {loading ? (
            <div className="flex flex-col gap-4 flex-1 justify-center">{[1,2,3].map(i => <div key={i} className="h-4 bg-cream-50 rounded animate-pulse" />)}</div>
          ) : Object.keys(stats.byService).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-body-sm text-text-gray">No data available in this period</div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(stats.byService)
                .sort((a, b) => b[1] - a[1])
                .map(([service, count]) => (
                <div key={service}>
                  <p className="text-body-sm text-text-dark font-semibold mb-1.5 truncate">{service}</p>
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
          className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-coral" />
            <h3 className="font-body font-bold text-text-dark">Busiest Weekdays</h3>
          </div>
          {loading ? (
            <div className="flex flex-col gap-4 flex-1 justify-center">{[1,2,3].map(i => <div key={i} className="h-4 bg-cream-50 rounded animate-pulse" />)}</div>
          ) : Object.keys(stats.byDay).length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-body-sm text-text-gray">No data available in this period</div>
          ) : (
            <div className="flex flex-col gap-4">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                const count = stats.byDay[day] || 0;
                return (
                  <div key={day}>
                    <p className="text-body-sm text-text-dark font-semibold mb-1.5">{day}</p>
                    <MiniBar value={count} max={maxDay} color="bg-coral" />
                  </div>
                );
              })}
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
        <div className="px-6 py-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h3 className="font-body font-bold text-text-dark">Recent Bookings (Filtered)</h3>
          </div>
          <AdminBtn onClick={exportCSV} variant="ghost" size="sm" loading={exporting} className="sm:hidden">
            <Download className="w-4 h-4" /> Export CSV
          </AdminBtn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-light bg-cream-50">
                {['Ref','Client','Service','Date','Mode','Status','Amount'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-label font-bold text-text-gray uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-text-gray">Loading data…</td></tr>
              ) : recentBookings.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-text-gray">No bookings found in this period</td></tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border-light last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-label">{b.booking_ref || '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-text-dark">{b.client_name}</td>
                    <td className="px-5 py-3.5 text-text-gray truncate max-w-[150px]">{b.service_title}</td>
                    <td className="px-5 py-3.5 text-text-gray whitespace-nowrap">{formatShortDate(b.session_date)}</td>
                    <td className="px-5 py-3.5 text-text-gray capitalize">{b.session_mode?.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider',
                        b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                        b.status === 'completed' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        b.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      )}>{b.status}</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold whitespace-nowrap">
                      {b.status === 'cancelled' ? (
                         <span className="text-red-400 line-through text-label">{formatCurrency(b.amount_inr || 0)}</span>
                      ) : (
                        <span className="text-text-dark">{formatCurrency(b.amount_inr || 0)}</span>
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
