// Shared QR session store
export const qrSessions = new Map<string, {
  id: string;
  token: string;
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'rejected';
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of qrSessions.entries()) {
    if (session.expiresAt < now) {
      qrSessions.delete(id);
    }
  }
}, 5 * 60 * 1000);
