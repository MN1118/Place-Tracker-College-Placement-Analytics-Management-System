const { query } = require('../config/db');

async function logAction(actorId, action, entityType, entityId, details = {}) {
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
    [actorId || null, action, entityType, entityId ? String(entityId) : null, JSON.stringify(details)]
  );
}

module.exports = { logAction };
