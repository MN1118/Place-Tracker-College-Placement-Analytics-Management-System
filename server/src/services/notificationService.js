const { query } = require('../config/db');

async function notifyUser(userId, type, title, message) {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, title, message) VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, type, title, message]
  );
  return rows[0];
}

/** Notify every student in a list of student_ids by looking up their user_id. */
async function notifyStudents(studentIds, type, title, message) {
  if (!studentIds.length) return;
  await query(
    `INSERT INTO notifications (user_id, type, title, message)
     SELECT user_id, $2, $3, $4 FROM students WHERE id = ANY($1::uuid[])`,
    [studentIds, type, title, message]
  );
}

module.exports = { notifyUser, notifyStudents };
