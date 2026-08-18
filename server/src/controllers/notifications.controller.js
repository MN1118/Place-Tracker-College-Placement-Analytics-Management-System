const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const myNotifications = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.id]);
  const unread = rows.filter((n) => !n.is_read).length;
  res.json({ success: true, data: rows, meta: { unreadCount: unread } });
});

const markRead = asyncHandler(async (req, res) => {
  const { rows } = await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Notification not found');
  res.json({ success: true, data: rows[0] });
});

const markAllRead = asyncHandler(async (req, res) => {
  await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
  res.json({ success: true, data: { updated: true } });
});

module.exports = { myNotifications, markRead, markAllRead };
