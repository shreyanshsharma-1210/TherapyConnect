import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, MessageSquareQuote, IndianRupee, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { PageHeader, StatCard, AdminCard, StatusBadge } from '@/components/admin/AdminComponents';
import { formatCurrency } from '@/utils/formatting';
import { cn } from '@/lib/utils';

export default function AdminOverview() {
  const [stats,          setStats]          = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      adminRepository.getStats(),
      adminRepository.getAllBookings({ pageSize: 5 }),
    ]).then(([s, b]) => {
      setStats(s);
      setRecentBookings(b.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Overview" subtitle="TherapyConnect management dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border-light shadow-level-1 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Welcome back. Here's what's happening with TherapyConnect."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={Calendar}
          color="teal"
          trend={`${stats?.confirmedBookings || 0} confirmed`}
        />
        <StatCard
          label="Revenue"
          value={`₹${((stats?.totalRevenue || 0) / 100).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="green"
          trend="All time"
        />
        <StatCard
          label="Blog Posts"
          value={stats?.totalBlogs ?? 0}
          icon={BookOpen}
          color="coral"
          trend={`${stats?.publishedBlogs || 0} published`}
        />
        <StatCard
          label="Testimonials"
          value={stats?.totalTestimonials ?? 0}
          icon={MessageSquareQuote}
          color="amber"
          trend={`${stats?.pendingTestimonials || 0} pending review`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <AdminCard
          title="Recent Bookings"
          action={
            <Link to="/admin/bookings" className="text-label text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          {recentBookings.length === 0 ? (
            <p className="text-body-sm text-text-gray text-center py-8">No bookings yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border-light">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-text-dark truncate">{b.client_name}</p>
                    <p className="text-label text-text-gray">{b.session_date} · {b.session_time}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        {/* Quick Links */}
        <AdminCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/blog',         icon: BookOpen,            label: 'Write Blog Post',   color: 'text-coral' },
              { to: '/admin/bookings',     icon: Calendar,            label: 'Manage Bookings',   color: 'text-teal-600' },
              { to: '/admin/testimonials', icon: MessageSquareQuote,  label: 'Review Feedback',   color: 'text-amber-600' },
              { to: '/admin/availability', icon: Clock,               label: 'Set Availability',  color: 'text-green-600' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-light hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200 text-center group"
              >
                <Icon className={cn('w-5 h-5 transition-transform duration-200 group-hover:scale-110', color)} />
                <span className="text-label text-text-dark font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
