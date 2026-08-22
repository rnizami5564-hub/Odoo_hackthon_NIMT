import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Not checked in yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp));
}

export default function EmployeeAttendanceCard({ token, initialAttendance = null }) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hasCheckedIn = Boolean(attendance?.check_in_time);
  const hasCheckedOut = Boolean(attendance?.check_out_time);

  async function handleAttendanceAction() {
    if (isLoading || hasCheckedOut) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = hasCheckedIn ? '/api/attendance/check-out' : '/api/attendance/check-in';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: hasCheckedIn ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update attendance');
      }

      setAttendance(payload.attendance);
    } catch (requestError) {
      setError(requestError.message || 'Unable to update attendance');
    } finally {
      setIsLoading(false);
    }
  }

  const buttonLabel = isLoading
    ? 'Updating...'
    : hasCheckedOut
      ? 'Checked Out'
      : hasCheckedIn
        ? 'Check Out'
        : 'Check In';
  const buttonClassName = hasCheckedIn
    ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'
    : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600';

  return (
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="attendance-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Today</p>
          <h2 id="attendance-title" className="mt-1 text-xl font-semibold text-slate-900">
            Attendance
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {hasCheckedOut ? 'Complete' : hasCheckedIn ? 'Checked in' : 'Not started'}
        </span>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Check-in time</p>
        <p className="mt-1 text-lg font-medium text-slate-900" aria-live="polite">
          {formatTimestamp(attendance?.check_in_time)}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAttendanceAction}
        disabled={isLoading || hasCheckedOut || !token}
        className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 ${buttonClassName}`}
      >
        {buttonLabel}
      </button>
    </section>
  );
}
