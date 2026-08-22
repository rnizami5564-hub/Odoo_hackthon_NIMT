import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const initialForm = {
  leaveType: 'Paid',
  startDate: '',
  endDate: '',
  remarks: ''
};

export default function LeaveRequestForm({ token, onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Please sign in before submitting a leave request.');
      return;
    }

    if (form.endDate < form.startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit leave request');
      }

      setForm(initialForm);
      setSuccess('Leave request submitted for approval.');
      onSubmitted?.(payload.leave);
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Employee services</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Request leave</h2>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Leave type
          <select
            name="leaveType"
            value={form.leaveType}
            onChange={updateField}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="Paid">Paid</option>
            <option value="Sick">Sick</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Start date
          <input
            required
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={updateField}
            className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          End date
          <input
            required
            type="date"
            name="endDate"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={updateField}
            className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <label className="mt-5 block text-sm font-medium text-slate-700">
        Remarks <span className="font-normal text-slate-400">(optional)</span>
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={updateField}
          rows="3"
          maxLength="1000"
          placeholder="Add context for your manager"
          className="mt-2 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {success && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit request'}
      </button>
    </form>
  );
}
