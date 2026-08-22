const pool = require('../config/db');

const LEAVE_TYPES = new Set(['Paid', 'Sick', 'Unpaid']);
const LEAVE_DECISIONS = new Set(['Approved', 'Rejected']);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function submitLeave(req, res) {
  const userId = req.user && req.user.userId;
  const body = req.body || {};
  const leaveType = getString(body.leaveType);
  const startDate = getString(body.startDate);
  const endDate = getString(body.endDate);
  const remarks = getString(body.remarks) || null;

  if (!userId) {
    return res.status(401).json({ error: 'Authenticated user is required' });
  }

  if (!LEAVE_TYPES.has(leaveType) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return res.status(400).json({ error: 'Valid leave type, start date, and end date are required' });
  }

  if (endDate < startDate) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leaves (user_id, leave_type, start_date, end_date, remarks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, leave_type, start_date, end_date, status, remarks, created_at`,
      [userId, leaveType, startDate, endDate, remarks]
    );

    return res.status(201).json({ leave: result.rows[0] });
  } catch (error) {
    console.error('Leave submission failed:', error);
    return res.status(500).json({ error: 'Unable to submit leave request' });
  }
}

async function getPendingLeaves(req, res) {
  try {
    const result = await pool.query(
      `SELECT l.id, l.user_id, l.leave_type, l.start_date, l.end_date,
              l.status, l.remarks, l.admin_comments, l.created_at,
              p.first_name, p.last_name
       FROM leaves AS l
       INNER JOIN profiles AS p ON p.user_id = l.user_id
       WHERE l.status = 'Pending'
       ORDER BY l.created_at ASC, l.id ASC`
    );

    return res.status(200).json({ leaves: result.rows });
  } catch (error) {
    console.error('Pending leaves fetch failed:', error);
    return res.status(500).json({ error: 'Unable to fetch pending leave requests' });
  }
}

async function decideLeave(req, res) {
  const leaveId = Number(req.params.id);
  const body = req.body || {};
  const decision = getString(body.status);
  const adminComments = getString(body.admin_comments ?? body.adminComments) || null;

  if (!Number.isSafeInteger(leaveId) || leaveId < 1) {
    return res.status(400).json({ error: 'A valid leave ID is required' });
  }

  if (!LEAVE_DECISIONS.has(decision)) {
    return res.status(400).json({ error: "Status must be either 'Approved' or 'Rejected'" });
  }

  try {
    const result = await pool.query(
      `UPDATE leaves
       SET status = $1, admin_comments = $2
       WHERE id = $3 AND status = 'Pending'
       RETURNING id, user_id, leave_type, start_date, end_date,
                 status, remarks, admin_comments, created_at`,
      [decision, adminComments, leaveId]
    );

    if (result.rowCount === 0) {
      const existing = await pool.query('SELECT id FROM leaves WHERE id = $1', [leaveId]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return res.status(409).json({ error: 'Leave request has already been processed' });
    }

    return res.status(200).json({ leave: result.rows[0] });
  } catch (error) {
    console.error('Leave decision failed:', error);
    return res.status(500).json({ error: 'Unable to update leave request' });
  }
}

module.exports = { submitLeave, getPendingLeaves, decideLeave };
