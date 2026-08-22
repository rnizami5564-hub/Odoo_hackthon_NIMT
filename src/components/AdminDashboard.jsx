import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const ATTENDANCE_COLORS = {
  Present: '#16a34a',
  Absent: '#dc2626',
  'Half-day': '#eab308',
  Leave: '#2563eb'
};

const ATTENDANCE_STATUSES = Object.keys(ATTENDANCE_COLORS);
const CSV_HEADERS = ['Employee ID', 'Name', 'Month', 'Base Salary', 'Deductions', 'Net Salary'];

const DEFAULT_ATTENDANCE = ATTENDANCE_STATUSES.map((name) => ({ name, value: 0 }));

function toAttendanceData(attendance) {
  return ATTENDANCE_STATUSES.map((status) => {
    const item = attendance?.find((entry) => entry.name === status || entry.status === status);
    return { name: status, value: Number(item?.value ?? item?.count ?? 0) || 0 };
  });
}

function csvCell(value) {
  const normalized = value === null || value === undefined ? '' : String(value);
  const protectedValue = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${protectedValue.replace(/"/g, '""')}"`;
}

function payrollValue(entry, header) {
  const fields = {
    'Employee ID': ['Employee ID', 'employeeId', 'employee_id'],
    Name: ['Name', 'name'],
    Month: ['Month', 'month'],
    'Base Salary': ['Base Salary', 'baseSalary', 'base_salary'],
    Deductions: ['Deductions', 'deductions'],
    'Net Salary': ['Net Salary', 'netSalary', 'net_salary']
  };

  return fields[header].map((field) => entry[field]).find((value) => value !== undefined && value !== null) ?? '-';
}

export function createPayrollCsv(payroll = []) {
  const rows = payroll.map((entry) => CSV_HEADERS.map((header) => payrollValue(entry, header)));

  return [CSV_HEADERS, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadPayrollCsv(payroll, filename = 'financial-summary.csv') {
  const blob = new Blob([`\uFEFF${createPayrollCsv(payroll)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function AttendanceTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-900">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} employees</p>
    </div>
  );
}

export default function AdminDashboard({ attendance = DEFAULT_ATTENDANCE, payroll = [] }) {
  const attendanceData = toAttendanceData(attendance);
  const totalEmployees = attendanceData.reduce((total, entry) => total + entry.value, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">HR administration</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Team overview</h1>
            <p className="mt-2 text-sm text-slate-500">Today&apos;s attendance and payroll summary</p>
          </div>
          <button
            type="button"
            onClick={() => downloadPayrollCsv(payroll)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            Export Financial Summary
          </button>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" aria-label="Admin dashboard metrics">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Attendance today</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Team status</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
            </div>

            <div className="relative mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="82%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {attendanceData.map((entry) => <Cell key={entry.name} fill={ATTENDANCE_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip content={<AttendanceTooltip />} />
                  <Legend iconType="circle" verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
                <p className="text-3xl font-semibold text-slate-950">{totalEmployees}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Employees</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Payroll</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Financial summary</h2>
              </div>
              <p className="text-sm text-slate-500">{payroll.length} records</p>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>{CSV_HEADERS.map((header) => <th key={header} className="whitespace-nowrap px-3 py-3 font-medium">{header}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payroll.map((entry, index) => (
                    <tr key={entry['Employee ID'] ?? entry.employeeId ?? index}>
                      {CSV_HEADERS.map((header) => <td key={header} className="whitespace-nowrap px-3 py-3 text-slate-600">{payrollValue(entry, header)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {payroll.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No payroll records available.</p>}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
