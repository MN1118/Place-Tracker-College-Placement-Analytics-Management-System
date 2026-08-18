const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const listDepartments = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM departments ORDER BY name');
  res.json({ success: true, data: rows });
});

module.exports = { listDepartments };
