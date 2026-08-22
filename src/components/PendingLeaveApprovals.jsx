import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default function PendingLeaveApprovals({ token }) {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({});
  const [exitingIds, setExitingIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadPendingLeaves() {
      if (!token) {
        setError('Please sign in as an administrator.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/leaves/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to load pending requests');
        }

        if (isMounted) {
          setLeaves(payload.leaves || []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load pending requests');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPendingLeaves();
    return () => {
      isMounted = false;
    };
  }, [token]);

  function updateComment(id, value) {
    setComments((currentComments) => ({ ...currentComments, [id]: value }));
  }

  async function decideLeave(leave, status) {
    if (exitingIds.has(leave.id)) {
      return;
    }

    const previousLeaves = leaves;
    setError('');
    setExitingIds((currentIds) => new Set(currentIds).add(leave.id));

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaves/${leave.id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminComments: comments[leave.id] || '' })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update leave request');
      }

      window.setTimeout(() => {
        setLeaves((currentLeaves) => currentLeaves.filter((item) => item.id !== leave.id));
        setExitingIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(leave.id);
          return nextIds;
        });
      }, 260);
    } catch (requestError) {
      setLeaves(previousLeaves);
      setExitingIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(leave.id);
        return nextIds;
      });
      setError(requestError.message || 'Unable to update leave request');
    }
  }

  if (isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading pending requests...</p>;
  }

  return (
    <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-labelledby="pending-leaves-title">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">HR administration</p>
        <h2 id="pending-leaves-title" className="mt-1 text-xl font-semibold text-slate-900">Pending leave requests</h2>
      </div>

      {error && <p className="mx-6 mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      {leaves.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">There are no pending leave requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Leave</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Remarks</th>
                <th className="px-6 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => {
                const isExiting = exitingIds.has(leave.id);
                return (
                  <tr key={leave.id} className={`transition duration-300 ${isExiting ? 'translate-x-4 opacity-0' : 'opacity-100'}`}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{leave.first_name} {leave.last_name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{leave.leave_type}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </td>
                    <td className="max-w-xs px-6 py-4 text-slate-600">{leave.remarks || 'None'}</td>
                    <td className="min-w-64 px-6 py-4">
                      <div className="flex min-w-56 gap-2">
                        <input
                          type="text"
                          value={comments[leave.id] || ''}
                          onChange={(event) => updateComment(leave.id, event.target.value)}
                          placeholder="Admin comment"
                          aria-label={`Comment for ${leave.first_name} ${leave.last_name}`}
                          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                        <button type="button" disabled={isExiting} onClick={() => decideLeave(leave, 'Approved')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300">Approve</button>
                        <button type="button" disabled={isExiting} onClick={() => decideLeave(leave, 'Rejected')} className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:bg-slate-300">Reject</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
