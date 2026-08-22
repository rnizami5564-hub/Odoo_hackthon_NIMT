const pool = require('../config/db');

async function checkIn(req, res) {
  const userId = req.user && req.user.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authenticated user is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO attendance (user_id, date, check_in_time, status)
       VALUES ($1, CURRENT_DATE, CURRENT_TIMESTAMP, 'Present')
       ON CONFLICT (user_id, date) DO NOTHING
       RETURNING id, user_id, date, check_in_time, check_out_time, status`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({ error: 'You have already checked in today' });
    }

    return res.status(201).json({ attendance: result.rows[0] });
  } catch (error) {
    console.error('Attendance check-in failed:', error);
    return res.status(500).json({ error: 'Unable to check in' });
  }
}

async function checkOut(req, res) {
  const userId = req.user && req.user.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authenticated user is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE attendance
       SET check_out_time = CURRENT_TIMESTAMP
       WHERE user_id = $1
         AND date = CURRENT_DATE
         AND check_out_time IS NULL
       RETURNING id, user_id, date, check_in_time, check_out_time, status`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No open check-in found for today' });
    }

    return res.status(200).json({ attendance: result.rows[0] });
  } catch (error) {
    console.error('Attendance check-out failed:', error);
    return res.status(500).json({ error: 'Unable to check out' });
  }
}

module.exports = { checkIn, checkOut };
