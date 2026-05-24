import { useEffect, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Calendar, 
  Clock, 
  RefreshCw, 
  Power, 
  Plus, 
  Trash2, 
  Sliders, 
  ShieldAlert, 
  ShieldCheck, 
  SlidersHorizontal 
} from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useToast }        from '@/context/ToastContext';
import { supabase }         from '@/lib/supabase';
import { PageHeader, AdminCard, AdminBtn, AdminSelect, AdminInput } from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';
import { useInvalidation, keys } from '@/lib/invalidationManager';
import { useRealtimeSubscription } from '@/lib/realtime/realtimeManager';

const LEVEL_STYLES = {
  available:   { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 border-green-200',   label: 'Available'   },
  limited:     { dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Limited'     },
  unavailable: { dot: 'bg-red-400',    pill: 'bg-red-50 text-red-600 border-red-200',         label: 'Unavailable' },
};
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STANDARD_TIMES = [
  { label: '09:00 AM', value: '09:00:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '12:00 PM', value: '12:00:00' },
  { label: '01:00 PM', value: '13:00:00' },
  { label: '02:00 PM', value: '14:00:00' },
  { label: '03:00 PM', value: '15:00:00' },
  { label: '04:00 PM', value: '16:00:00' },
  { label: '05:00 PM', value: '17:00:00' },
  { label: '06:00 PM', value: '18:00:00' },
  { label: '07:00 PM', value: '19:00:00' },
  { label: '08:00 PM', value: '20:00:00' },
  { label: '09:00 PM', value: '21:00:00' },
];

function pad(n) { return String(n).padStart(2, '0'); }
function toDateStr(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

export default function AdminAvailability() {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'weekly' | 'google' | 'vacations'
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();

  // --- CALENDAR TAB STATE ---
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [avMap, setAvMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [editLevel, setEditLevel] = useState('available');
  const [editSlots, setEditSlots] = useState(8);
  const [saving, setSaving] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  const startOfMonth = new Date(year, month, 1);
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const startDay     = startOfMonth.getDay();

  // --- WEEKLY SCHEDULE STATE ---
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [newRuleDay, setNewRuleDay] = useState(1); // Monday
  const [newRuleStart, setNewRuleStart] = useState('10:00:00');
  const [newRuleEnd, setNewRuleEnd] = useState('18:00:00');

  // --- GOOGLE SYNC TAB STATE ---
  const [integration, setIntegration] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const [preBuffer, setPreBuffer] = useState(15);
  const [postBuffer, setPostBuffer] = useState(15);
  const [savingBuffers, setSavingBuffers] = useState(false);

  // --- VACATIONS & CUSTOM BLOCKS STATE ---
  const [vacations, setVacations] = useState([]);
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [loadingVacations, setLoadingVacations] = useState(false);
  const [newVacStart, setNewVacStart] = useState('');
  const [newVacEnd, setNewVacEnd] = useState('');
  const [newVacDesc, setNewVacDesc] = useState('');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('12:00:00');
  const [newBlockEnd, setNewBlockEnd] = useState('13:00:00');
  const [newBlockReason, setNewBlockReason] = useState('');

  // Fetch logged in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // Centralized realtime subscriptions for schedule data sync
  useRealtimeSubscription('therapist_availability');
  useRealtimeSubscription('availability_rules');
  useRealtimeSubscription('therapist_vacations');
  useRealtimeSubscription('blocked_time_ranges');

  // Trigger live state invalidation and reload active tabs
  useInvalidation(keys.AVAILABILITY, () => {
    console.log('[AdminAvailability] Invalidation event received. Re-syncing active views...');
    loadCalendar();
    loadRules();
    loadVacationsAndBlocks();
  });

  // Handle URL redirect query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sync') === 'success') {
      toast({ type: 'success', title: 'Connected!', message: 'Google Calendar integration connected successfully.' });
      // clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('google');
    } else if (params.get('sync_error')) {
      toast({ type: 'error', title: 'Connection Failed', message: 'Failed to integrate Google Calendar.' });
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('google');
    }
  }, [toast]);

  // Load calendar exceptions
  const loadCalendar = useCallback(async () => {
    setLoadingCalendar(true);
    const start = toDateStr(year, month, 1);
    const end   = toDateStr(year, month, daysInMonth);
    try {
      const rows = await adminRepository.getAvailabilityRange(start, end);
      const map = {};
      (rows || []).forEach(r => { map[r.available_date] = r; });
      setAvMap(map);
    } catch { 
      toast({ type: 'error', title: 'Failed to load availability' }); 
    } finally { 
      setLoadingCalendar(false); 
    }
  }, [year, month, daysInMonth, toast]);

  // Load weekly rules
  const loadRules = useCallback(async () => {
    if (!userId) return;
    setLoadingRules(true);
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .select('*')
        .eq('therapist_id', userId)
        .order('day_of_week')
        .order('start_time');
      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to load rules', message: err.message });
    } finally {
      setLoadingRules(false);
    }
  }, [userId, toast]);

  // Load Google Calendar connection settings & buffer settings
  const loadGoogle = useCallback(async () => {
    if (!userId) return;
    setLoadingGoogle(true);
    try {
      // 1. Fetch integration row
      const { data: integrationRow, error: intErr } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('therapist_id', userId)
        .maybeSingle();
      if (intErr) throw intErr;
      setIntegration(integrationRow);

      // 2. Fetch therapist profile for buffers
      const { data: profile, error: profErr } = await supabase
        .from('therapist_profile')
        .select('pre_session_buffer_minutes, post_session_buffer_minutes')
        .eq('id', '05e992d7-0463-4f1a-b0d1-2a1f3b0a3a2c') // Target profile ID
        .single();
      if (profErr) throw profErr;
      if (profile) {
        setPreBuffer(profile.pre_session_buffer_minutes ?? 15);
        setPostBuffer(profile.post_session_buffer_minutes ?? 15);
      }

      // 3. Fetch recent sync logs
      const { data: logs, error: logsErr } = await supabase
        .from('calendar_sync_logs')
        .select('*')
        .eq('therapist_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (logsErr) throw logsErr;
      setSyncLogs(logs || []);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to load integration settings', message: err.message });
    } finally {
      setLoadingGoogle(false);
    }
  }, [userId, toast]);

  // Load vacations and manual blocked ranges
  const loadVacationsAndBlocks = useCallback(async () => {
    if (!userId) return;
    setLoadingVacations(true);
    try {
      const { data: vacs, error: vacErr } = await supabase
        .from('therapist_vacations')
        .select('*')
        .eq('therapist_id', userId)
        .order('start_date');
      if (vacErr) throw vacErr;
      setVacations(vacs || []);

      const { data: blocks, error: blockErr } = await supabase
        .from('blocked_time_ranges')
        .select('*')
        .eq('therapist_id', userId)
        .order('start_time');
      if (blockErr) throw blockErr;
      setBlockedRanges(blocks || []);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to load vacations/blocks', message: err.message });
    } finally {
      setLoadingVacations(false);
    }
  }, [userId, toast]);

  // Trigger tab data fetching
  useEffect(() => {
    if (activeTab === 'calendar') loadCalendar();
    if (activeTab === 'weekly') loadRules();
    if (activeTab === 'google') loadGoogle();
    if (activeTab === 'vacations') loadVacationsAndBlocks();
  }, [activeTab, loadCalendar, loadRules, loadGoogle, loadVacationsAndBlocks]);

  // --- ACTIONS: CALENDAR VIEW ---
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const selectDay = (dateStr) => {
    setSelected(dateStr);
    const row = avMap[dateStr];
    setEditLevel(row?.level || 'available');
    setEditSlots(row?.max_slots || 8);
  };

  const saveDay = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminRepository.upsertAvailability(selected, editLevel, editSlots);
      setAvMap(prev => ({ ...prev, [selected]: updated }));
      toast({ type: 'success', title: 'Saved override', message: `${selected} → ${editLevel}` });
    } catch { 
      toast({ type: 'error', title: 'Save override failed' }); 
    } finally { 
      setSaving(false); 
    }
  };

  const bulkSet = async (level) => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      if (dt.getDay() !== 0) {
        days.push(toDateStr(year, month, d));
      }
    }
    setSaving(true);
    try {
      await Promise.all(days.map(d => adminRepository.upsertAvailability(d, level, 8)));
      await loadCalendar();
      toast({ type: 'success', title: `All Mon-Sat set to ${level}` });
    } catch { 
      toast({ type: 'error', title: 'Bulk update failed' }); 
    } finally { 
      setSaving(false); 
    }
  };

  // --- ACTIONS: WEEKLY RULES ---
  const addRule = async () => {
    if (newRuleStart >= newRuleEnd) {
      toast({ type: 'error', title: 'Invalid rule range', message: 'Start time must be before end time.' });
      return;
    }
    try {
      const { error } = await supabase
        .from('availability_rules')
        .insert({
          therapist_id: userId,
          day_of_week: newRuleDay,
          start_time: newRuleStart,
          end_time: newRuleEnd,
          is_active: true,
        });
      if (error) throw error;
      toast({ type: 'success', title: 'Schedule rule added' });
      loadRules();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to add rule', message: err.message });
    }
  };

  const deleteRule = async (id) => {
    try {
      const { error } = await supabase
        .from('availability_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ type: 'success', title: 'Schedule rule deleted' });
      loadRules();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to delete rule', message: err.message });
    }
  };

  // --- ACTIONS: GOOGLE CALENDAR ---
  const connectGoogle = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: { action: 'get-auth-url', origin: window.location.origin }
      });
      if (error) throw error;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Could not retrieve authentication URL.');
      }
    } catch (err) {
      toast({ type: 'error', title: 'OAuth connection failed', message: err.message });
    }
  };

  const disconnectGoogle = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: { action: 'disconnect' }
      });
      if (error) throw error;
      toast({ type: 'success', title: 'Disconnected', message: 'Google Calendar has been disconnected.' });
      loadGoogle();
    } catch (err) {
      toast({ type: 'error', title: 'Disconnection failed', message: err.message });
    }
  };

  const triggerGoogleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'inbound-sync', therapistId: userId }
      });
      if (error) throw error;
      toast({ type: 'success', title: 'Sync completed', message: `Imported ${data.eventsSynced || 0} busy events.` });
      loadGoogle();
    } catch (err) {
      toast({ type: 'error', title: 'Sync failed', message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const saveBuffers = async () => {
    setSavingBuffers(true);
    try {
      // 1. Update therapist_profile
      const { error: err1 } = await supabase
        .from('therapist_profile')
        .update({
          pre_session_buffer_minutes: preBuffer,
          post_session_buffer_minutes: postBuffer,
        })
        .eq('id', '05e992d7-0463-4f1a-b0d1-2a1f3b0a3a2c');
      if (err1) throw err1;

      // 2. Update profiles table for security trigger context
      if (userId) {
        const { error: err2 } = await supabase
          .from('profiles')
          .update({
            pre_session_buffer_minutes: preBuffer,
            post_session_buffer_minutes: postBuffer,
          })
          .eq('id', userId);
        if (err2) {
          console.warn('Profiles buffer update failed (non-fatal):', err2.message);
        }
      }

      toast({ type: 'success', title: 'Buffer settings saved' });
    } catch (err) {
      toast({ type: 'error', title: 'Failed to save buffers', message: err.message });
    } finally {
      setSavingBuffers(false);
    }
  };

  // --- ACTIONS: VACATIONS & MANUAL BLOCKS ---
  const addVacation = async () => {
    if (!newVacStart || !newVacEnd) {
      toast({ type: 'error', title: 'Missing Dates', message: 'Please select start and end dates.' });
      return;
    }
    try {
      const { error } = await supabase
        .from('therapist_vacations')
        .insert({
          therapist_id: userId,
          start_date: newVacStart,
          end_date: newVacEnd,
          description: newVacDesc,
        });
      if (error) throw error;
      toast({ type: 'success', title: 'Vacation registered' });
      setNewVacStart('');
      setNewVacEnd('');
      setNewVacDesc('');
      loadVacationsAndBlocks();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to register vacation', message: err.message });
    }
  };

  const deleteVacation = async (id) => {
    try {
      const { error } = await supabase
        .from('therapist_vacations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ type: 'success', title: 'Vacation deleted' });
      loadVacationsAndBlocks();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to delete vacation', message: err.message });
    }
  };

  const addBlockRange = async () => {
    if (!newBlockDate) {
      toast({ type: 'error', title: 'Missing Date', message: 'Please select a date.' });
      return;
    }
    // Parse to timestamp in local time context
    const start_time = new Date(`${newBlockDate}T${newBlockStart}`).toISOString();
    const end_time = new Date(`${newBlockDate}T${newBlockEnd}`).toISOString();

    if (start_time >= end_time) {
      toast({ type: 'error', title: 'Invalid Block', message: 'Start time must be before end time.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_time_ranges')
        .insert({
          therapist_id: userId,
          start_time,
          end_time,
          reason: newBlockReason,
        });
      if (error) throw error;
      toast({ type: 'success', title: 'Manual hours blocked' });
      setNewBlockDate('');
      setNewBlockReason('');
      loadVacationsAndBlocks();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to block hours', message: err.message });
    }
  };

  const deleteBlockRange = async (id) => {
    try {
      const { error } = await supabase
        .from('blocked_time_ranges')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ type: 'success', title: 'Block removed' });
      loadVacationsAndBlocks();
    } catch (err) {
      toast({ type: 'error', title: 'Failed to remove block', message: err.message });
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedule & Availability"
        subtitle="Manage your connected calendars, weekly hours, buffers, vacations and booking availability"
      />

      {/* Aesthetic Navigation Tabs */}
      <div className="flex border-b border-border-light mb-6 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 border-b-2 font-body text-body-sm font-semibold transition-all duration-200',
            activeTab === 'calendar' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/20' 
              : 'border-transparent text-text-gray hover:text-text-dark hover:bg-cream-50/40'
          )}
        >
          <Calendar className="w-4 h-4" />
          Calendar Overrides
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 border-b-2 font-body text-body-sm font-semibold transition-all duration-200',
            activeTab === 'weekly' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/20' 
              : 'border-transparent text-text-gray hover:text-text-dark hover:bg-cream-50/40'
          )}
        >
          <Clock className="w-4 h-4" />
          Weekly Hours
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 border-b-2 font-body text-body-sm font-semibold transition-all duration-200',
            activeTab === 'google' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/20' 
              : 'border-transparent text-text-gray hover:text-text-dark hover:bg-cream-50/40'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Google Calendar
        </button>
        <button
          onClick={() => setActiveTab('vacations')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 border-b-2 font-body text-body-sm font-semibold transition-all duration-200',
            activeTab === 'vacations' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/20' 
              : 'border-transparent text-text-gray hover:text-text-dark hover:bg-cream-50/40'
          )}
        >
          <Sliders className="w-4 h-4" />
          Vacations & Blocks
        </button>
      </div>

      {/* --- TAB VIEW 1: CALENDAR VIEW OVERRIDES --- */}
      {activeTab === 'calendar' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Calendar grid */}
          <AdminCard>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-cream-50 rounded-xl transition-colors">
                <ChevronLeft className="w-4 h-4 text-text-gray" />
              </button>
              <p className="font-body font-bold text-text-dark">
                {MONTH_NAMES[month]} {year}
              </p>
              <button onClick={nextMonth} className="p-2 hover:bg-cream-50 rounded-xl transition-colors">
                <ChevronRight className="w-4 h-4 text-text-gray" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-label text-text-gray font-semibold py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = toDateStr(year, month, day);
                const row = avMap[dateStr];
                const level = row?.level || null;
                const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                const isSunday = new Date(year, month, day).getDay() === 0;
                const isSelected = selected === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => !isSunday && selectDay(dateStr)}
                    disabled={isSunday}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-150 min-h-[48px]',
                      isSunday ? 'opacity-30 cursor-not-allowed bg-cream-50/50' : 'cursor-pointer hover:bg-cream-50',
                      isSelected ? 'ring-2 ring-teal-500 bg-teal-50' : '',
                      isToday ? 'font-bold ring-1 ring-border-light' : '',
                    )}
                  >
                    <span className={cn(
                      'text-body-sm font-semibold',
                      isToday ? 'text-teal-700' : 'text-text-dark',
                    )}>
                      {day}
                    </span>
                    {level && (
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full mt-0.5',
                        LEVEL_STYLES[level]?.dot || 'bg-gray-300'
                      )} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border-light flex-wrap">
              {Object.entries(LEVEL_STYLES).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', v.dot)} />
                  <span className="text-label text-text-gray">{v.label}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          <div className="flex flex-col gap-4">
            {selected ? (
              <AdminCard title={`Manage override: ${selected}`}>
                <div className="flex flex-col gap-3">
                  <AdminSelect
                    label="Availability level override"
                    value={editLevel}
                    onChange={e => setEditLevel(e.target.value)}
                  >
                    <option value="available">Available (Default)</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable (Block Entire Day)</option>
                  </AdminSelect>
                  <AdminSelect
                    label="Slots allowance limit"
                    value={editSlots}
                    onChange={e => setEditSlots(Number(e.target.value))}
                  >
                    {[2,4,6,8,10,12].map(n => (
                      <option key={n} value={n}>{n} slots</option>
                    ))}
                  </AdminSelect>
                  <AdminBtn variant="primary" onClick={saveDay} loading={saving} className="w-full justify-center mt-1">
                    <Check className="w-4 h-4" /> Save Override
                  </AdminBtn>
                </div>
              </AdminCard>
            ) : (
              <AdminCard>
                <p className="text-body-sm text-text-gray text-center py-4">Select any weekday in the calendar to place custom availability level overrides.</p>
              </AdminCard>
            )}

            <AdminCard title="Quick Bulk Adjust">
              <div className="flex flex-col gap-2">
                <p className="text-label text-text-gray mb-1">Set all weekdays in this month view to:</p>
                {['available','limited','unavailable'].map(level => (
                  <AdminBtn
                    key={level}
                    variant="secondary"
                    size="sm"
                    onClick={() => bulkSet(level)}
                    loading={saving}
                    className="justify-center capitalize"
                  >
                    <span className={cn('w-2 h-2 rounded-full', LEVEL_STYLES[level].dot)} />
                    {LEVEL_STYLES[level].label}
                  </AdminBtn>
                ))}
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {/* --- TAB VIEW 2: WEEKLY SCHEDULE RULES --- */}
      {activeTab === 'weekly' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <AdminCard title="Weekly Recurring Availability Hours">
            {loadingRules ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-teal-600" /></div>
            ) : rules.length === 0 ? (
              <p className="text-body-sm text-text-gray text-center py-12">No recurring availability rules defined. Please add rules on the right.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {DAY_NAMES.map((dayName, idx) => {
                  const dayRules = rules.filter(r => r.day_of_week === idx);
                  if (idx === 0) return null; // Skip Sunday

                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="font-semibold text-body text-text-dark w-24 shrink-0">{dayName}</div>
                      <div className="flex flex-wrap gap-2 flex-grow">
                        {dayRules.length === 0 ? (
                          <span className="text-body-sm text-text-gray italic">Unavailable (Closed)</span>
                        ) : (
                          dayRules.map(rule => (
                            <span 
                              key={rule.id} 
                              className="inline-flex items-center gap-1.5 bg-cream-50 text-text-dark border border-border-light px-3 py-1 rounded-full text-body-sm"
                            >
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}
                              <button 
                                onClick={() => deleteRule(rule.id)}
                                className="ml-1 p-0.5 hover:bg-red-50 text-text-gray hover:text-error rounded-full transition-colors"
                                title="Remove time range"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AdminCard>

          <AdminCard title="Add Recurring Time Window">
            <div className="flex flex-col gap-4">
              <AdminSelect
                label="Day of week"
                value={newRuleDay}
                onChange={e => setNewRuleDay(Number(e.target.value))}
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </AdminSelect>

              <AdminSelect
                label="Start working hour"
                value={newRuleStart}
                onChange={e => setNewRuleStart(e.target.value)}
              >
                {STANDARD_TIMES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </AdminSelect>

              <AdminSelect
                label="End working hour"
                value={newRuleEnd}
                onChange={e => setNewRuleEnd(e.target.value)}
              >
                {STANDARD_TIMES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </AdminSelect>

              <AdminBtn variant="primary" onClick={addRule} className="w-full justify-center">
                <Plus className="w-4 h-4" /> Add Availability Rule
              </AdminBtn>
            </div>
          </AdminCard>
        </div>
      )}

      {/* --- TAB VIEW 3: GOOGLE CALENDAR SYNC --- */}
      {activeTab === 'google' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="flex flex-col gap-6">
            {/* Connection Banner */}
            <AdminCard title="Google Calendar Connection Status">
              {loadingGoogle ? (
                <div className="flex justify-center py-6"><RefreshCw className="w-6 h-6 animate-spin text-teal-600" /></div>
              ) : integration ? (
                <div>
                  {integration.sync_status === 'revoked' ? (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-2xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 animate-pulse">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-body font-bold text-yellow-800">Access Revoked</p>
                          <p className="text-body-sm text-yellow-700">Google Calendar connection lost. Please reconnect.</p>
                        </div>
                      </div>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-label font-bold bg-yellow-200 text-yellow-800 uppercase tracking-wide">
                        {integration.sync_status}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-body font-bold text-green-800">Connected</p>
                          <p className="text-body-sm text-green-700">{integration.google_email || integration.calendar_id}</p>
                        </div>
                      </div>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-label font-bold bg-green-200 text-green-800 uppercase tracking-wide">
                        {integration.sync_status}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-off-white p-4 rounded-xl border border-border-light">
                      <p className="text-label text-text-gray uppercase font-semibold">Calendar Timezone</p>
                      <p className="font-body font-semibold text-text-dark mt-1">{integration.timezone || 'Asia/Kolkata'}</p>
                    </div>
                    <div className="bg-off-white p-4 rounded-xl border border-border-light">
                      <p className="text-label text-text-gray uppercase font-semibold">Last Synchronization</p>
                      <p className="font-body font-semibold text-text-dark mt-1">
                        {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never synced'}
                      </p>
                    </div>
                  </div>

                  {integration.last_sync_error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-6 text-body-sm">
                      <p className="font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Last Sync Error:</p>
                      <p className="mt-1">{integration.last_sync_error}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {integration.sync_status === 'revoked' ? (
                      <AdminBtn variant="primary" onClick={connectGoogle}>
                        <RefreshCw className="w-4 h-4" /> Reconnect Google Calendar
                      </AdminBtn>
                    ) : (
                      <AdminBtn variant="primary" onClick={triggerGoogleSync} loading={syncing}>
                        <RefreshCw className="w-4 h-4 animate-spin-slow" /> Sync Calendar Now
                      </AdminBtn>
                    )}
                    <AdminBtn variant="danger" onClick={disconnectGoogle}>
                      <Power className="w-4 h-4" /> Disconnect Calendar
                    </AdminBtn>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <div className="flex items-center gap-3 p-4 bg-cream-50 border border-cream-200 rounded-2xl mb-4">
                    <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-text-gray">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-body font-bold text-text-dark">Not Connected</p>
                      <p className="text-body-sm text-text-gray">Link your calendar to automatically manage bookings.</p>
                    </div>
                  </div>
                  <p className="text-body-sm text-text-gray mb-6">
                    Connect your professional Google Calendar to synchronize double-booking protection. Busy spots on your Google Calendar will be automatically blocked in TherapyConnect in real-time, and bookings will automatically write to your personal Google Calendar.
                  </p>
                  <AdminBtn variant="primary" onClick={connectGoogle}>
                    Connect Google Calendar
                  </AdminBtn>
                </div>
              )}
            </AdminCard>

            {/* Sync Audit Trail */}
            <AdminCard title="Recent Sync logs">
              {syncLogs.length === 0 ? (
                <p className="text-body-sm text-text-gray text-center py-6">No recent synchronization history found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="border-b border-border-light text-text-gray">
                        <th className="pb-2 font-semibold">Timestamp</th>
                        <th className="pb-2 font-semibold">Action Type</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold text-right">Items Synced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-text-dark">
                      {syncLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-3">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3 font-mono text-[11px] capitalize">
                            {log.sync_type.replace(/-/g, ' ')}
                            {log.sync_duration_ms && (
                              <span className="text-text-gray text-[10px] block mt-0.5">Duration: {log.sync_duration_ms}ms</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit',
                                log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              )}>
                                {log.status}
                              </span>
                              {log.error_message && (
                                <span className="text-error text-[10px] block max-w-[200px] truncate" title={log.error_message}>
                                  {log.error_message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right">{log.events_synced}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminCard>
          </div>

          {/* Buffer Settings Panel */}
          <AdminCard title="Session Pre/Post Buffers">
            <p className="text-body-sm text-text-gray mb-4">
              Add buffer times before and after sessions to allow for writing notes, breaks, and session preparation.
            </p>
            <div className="flex flex-col gap-4">
              <AdminSelect
                label="Pre-session preparation time"
                value={preBuffer}
                onChange={e => setPreBuffer(Number(e.target.value))}
              >
                <option value={0}>No Buffer (0 min)</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hr)</option>
              </AdminSelect>

              <AdminSelect
                label="Post-session review & buffer"
                value={postBuffer}
                onChange={e => setPostBuffer(Number(e.target.value))}
              >
                <option value={0}>No Buffer (0 min)</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hr)</option>
              </AdminSelect>

              <AdminBtn variant="primary" onClick={saveBuffers} loading={savingBuffers} className="w-full justify-center">
                <Check className="w-4 h-4" /> Save Buffer Settings
              </AdminBtn>
            </div>
          </AdminCard>
        </div>
      )}

      {/* --- TAB VIEW 4: VACATIONS & MANUAL BLOCKS --- */}
      {activeTab === 'vacations' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vacation blocks */}
          <div className="flex flex-col gap-6">
            <AdminCard title="Manage Vacations & Full Day Blocks">
              {loadingVacations ? (
                <div className="flex justify-center py-6"><RefreshCw className="w-6 h-6 animate-spin text-teal-600" /></div>
              ) : vacations.length === 0 ? (
                <p className="text-body-sm text-text-gray text-center py-6">No scheduled therapist vacations.</p>
              ) : (
                <div className="divide-y divide-border-light">
                  {vacations.map(vac => (
                    <div key={vac.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-body text-text-dark">
                          {new Date(vac.start_date).toLocaleDateString()} - {new Date(vac.end_date).toLocaleDateString()}
                        </p>
                        {vac.description && <p className="text-body-sm text-text-gray mt-0.5">{vac.description}</p>}
                      </div>
                      <button 
                        onClick={() => deleteVacation(vac.id)}
                        className="p-2 text-text-gray hover:text-error hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard title="Register Vacation Date Range">
              <div className="flex flex-col gap-4">
                <AdminInput 
                  label="Start vacation date" 
                  type="date"
                  value={newVacStart}
                  onChange={e => setNewVacStart(e.target.value)}
                />
                <AdminInput 
                  label="End vacation date" 
                  type="date"
                  value={newVacEnd}
                  onChange={e => setNewVacEnd(e.target.value)}
                />
                <AdminInput 
                  label="Reason / Description (optional)" 
                  placeholder="e.g. Annual Leave, Conference"
                  value={newVacDesc}
                  onChange={e => setNewVacDesc(e.target.value)}
                />
                <AdminBtn variant="primary" onClick={addVacation}>
                  <Plus className="w-4 h-4" /> Add Vacation Range
                </AdminBtn>
              </div>
            </AdminCard>
          </div>

          {/* Time blocking */}
          <div className="flex flex-col gap-6">
            <AdminCard title="Manual Blocked Time Slots">
              {loadingVacations ? (
                <div className="flex justify-center py-6"><RefreshCw className="w-6 h-6 animate-spin text-teal-600" /></div>
              ) : blockedRanges.length === 0 ? (
                <p className="text-body-sm text-text-gray text-center py-6">No custom blocked hours registered.</p>
              ) : (
                <div className="divide-y divide-border-light">
                  {blockedRanges.map(b => (
                    <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-body text-text-dark">
                          {new Date(b.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-body-sm text-text-gray mt-0.5">
                          {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {b.reason && <span className="block italic text-[11px] mt-0.5 text-text-gray">{b.reason}</span>}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteBlockRange(b.id)}
                        className="p-2 text-text-gray hover:text-error hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard title="Block Specific Date & Time Window">
              <div className="flex flex-col gap-4">
                <AdminInput 
                  label="Select date" 
                  type="date"
                  value={newBlockDate}
                  onChange={e => setNewBlockDate(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect
                    label="Block start hour"
                    value={newBlockStart}
                    onChange={e => setNewBlockStart(e.target.value)}
                  >
                    {STANDARD_TIMES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </AdminSelect>
                  <AdminSelect
                    label="Block end hour"
                    value={newBlockEnd}
                    onChange={e => setNewBlockEnd(e.target.value)}
                  >
                    {STANDARD_TIMES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </AdminSelect>
                </div>
                <AdminInput 
                  label="Block reason (optional)" 
                  placeholder="e.g. Personal Appointment"
                  value={newBlockReason}
                  onChange={e => setNewBlockReason(e.target.value)}
                />
                <AdminBtn variant="primary" onClick={addBlockRange}>
                  <Plus className="w-4 h-4" /> Block Selected Time
                </AdminBtn>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}
