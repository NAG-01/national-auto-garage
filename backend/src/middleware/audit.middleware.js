import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({ userId, userName, userRole, action, entityType, entityId, summary, details = {} }) => {
  try {
    return await AuditLog.create({
      action,
      entity: entityType || 'SYSTEM',
      entityId: entityId ? entityId.toString() : 'SYSTEM',
      user: userName || userId ? `${userName || userId}` : 'Admin',
      summary: summary || '',
      metadata: details,
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
};
