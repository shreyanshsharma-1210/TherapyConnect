/**
 * Generates and downloads an .ics calendar file for a booking.
 * Compatible with Google Calendar, Apple Calendar, Outlook.
 */
export function exportToICS({ booking, therapist }) {
  const {
    date       = '',
    time       = '',
    service    = 'Therapy Session',
    mode       = 'Video Call',
    bookingRef = '',
    duration   = 50,
  } = booking || {};

  // Parse date + time into UTC
  const [year, month, day] = (date || '').split('-').map(Number);
  const [hourStr, minuteStr] = (time || '00:00').replace(/\s?(AM|PM)/i, '').split(':');
  const isPM  = /PM/i.test(time || '');
  let hour    = parseInt(hourStr, 10);
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  const minute = parseInt(minuteStr, 10) || 0;

  const dtStart  = new Date(year, (month || 1) - 1, day || 1, hour, minute);
  const dtEnd    = new Date(dtStart.getTime() + (duration * 60 * 1000));

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const UID      = `${bookingRef || Date.now()}@therapyconnect.in`;
  const DTSTAMP  = fmt(new Date());
  const DTSTART  = fmt(dtStart);
  const DTEND    = fmt(dtEnd);
  const SUMMARY  = `${service} with ${therapist?.name || 'Charushri Suhaney'}`;
  const LOCATION = mode === 'In-Person' ? 'Bengaluru, Karnataka' : 'Online (Link sent via email)';
  const DESCRIPTION = [
    `Service: ${service}`,
    `Mode: ${mode}`,
    `Booking Ref: ${bookingRef}`,
    '',
    'TherapyConnect — therapyconnect.in',
    'Questions? charushri@therapyconnect.in',
  ].join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TherapyConnect//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${UID}`,
    `DTSTAMP:${DTSTAMP}`,
    `DTSTART:${DTSTART}`,
    `DTEND:${DTEND}`,
    `SUMMARY:${SUMMARY}`,
    `DESCRIPTION:${DESCRIPTION}`,
    `LOCATION:${LOCATION}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${SUMMARY} tomorrow`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${SUMMARY} in 1 hour`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `session-${bookingRef || 'booking'}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
