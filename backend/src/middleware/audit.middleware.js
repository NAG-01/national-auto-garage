/**
 * Lightweight No-Op Audit Middleware
 * Audit logs DB storage has been disabled per configuration.
 */
export const logAudit = async () => {
  return null;
};
