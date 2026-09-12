import { open, DB } from '@op-engineering/op-sqlite';
import { AuthSession } from '../types';

const DB_NAME = 'workpulse_auth.db';

class DatabaseService {
  private db: DB | null = null;
  private isInitialized = false;
  private fallbackMemorySession: AuthSession | null = null;

  /**
   * Initialize SQLite connection and database schema
   */
  public async initDatabase(): Promise<boolean> {
    if (this.isInitialized && this.db) {
      return true;
    }

    try {
      this.db = open({ name: DB_NAME });

      // Create auth_sessions table for token storage, session tracking, and user profile cache
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS auth_sessions (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          employee_id TEXT,
          role TEXT,
          department TEXT,
          avatar_url TEXT,
          id_token TEXT NOT NULL,
          refresh_token TEXT,
          issued_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL,
          last_active_at INTEGER NOT NULL,
          remember_me INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1
        );
      `);

      // Create app_settings table for key-value configurations
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('SQLite init warning (using safe fallback):', error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Save or replace the active user session in SQLite
   */
  public async saveAuthSession(session: AuthSession): Promise<void> {
    await this.initDatabase();

    if (!this.db) {
      this.fallbackMemorySession = session;
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        // Deactivate all previous sessions
        await tx.execute('UPDATE auth_sessions SET is_active = 0;');

        // Insert or replace current session
        await tx.execute(
          `INSERT OR REPLACE INTO auth_sessions (
            user_id, email, name, employee_id, role, department, avatar_url,
            id_token, refresh_token, issued_at, expires_at, last_active_at, remember_me, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
          [
            session.userId,
            session.email,
            session.name,
            session.employeeId,
            session.role,
            session.department,
            session.avatarUrl || null,
            session.idToken,
            session.refreshToken || null,
            session.issuedAt,
            session.expiresAt,
            session.lastActiveAt,
            session.rememberMe ? 1 : 0,
          ]
        );
      });
      this.fallbackMemorySession = session;
    } catch (error) {
      console.error('Failed to save auth session to SQLite:', error);
      this.fallbackMemorySession = session;
    }
  }

  /**
   * Retrieve active authentication session from SQLite
   */
  public async getActiveAuthSession(): Promise<AuthSession | null> {
    await this.initDatabase();

    if (!this.db) {
      return this.fallbackMemorySession;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM auth_sessions WHERE is_active = 1 LIMIT 1;`
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const session: AuthSession = {
          userId: String(row.user_id),
          email: String(row.email),
          name: String(row.name),
          employeeId: String(row.employee_id || ''),
          role: String(row.role || ''),
          department: String(row.department || ''),
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
          idToken: String(row.id_token),
          refreshToken: row.refresh_token ? String(row.refresh_token) : undefined,
          issuedAt: Number(row.issued_at),
          expiresAt: Number(row.expires_at),
          lastActiveAt: Number(row.last_active_at),
          rememberMe: Number(row.remember_me) === 1,
          isActive: Number(row.is_active) === 1,
        };
        this.fallbackMemorySession = session;
        return session;
      }

      return null;
    } catch (error) {
      console.error('Failed to get active auth session from SQLite:', error);
      return this.fallbackMemorySession;
    }
  }

  /**
   * Update ID Token and expiration time in SQLite
   */
  public async updateSessionToken(
    userId: string,
    idToken: string,
    expiresAt: number
  ): Promise<void> {
    await this.initDatabase();
    const now = Date.now();

    if (this.fallbackMemorySession && this.fallbackMemorySession.userId === userId) {
      this.fallbackMemorySession = {
        ...this.fallbackMemorySession,
        idToken,
        expiresAt,
        lastActiveAt: now,
      };
    }

    if (!this.db) return;

    try {
      await this.db.execute(
        `UPDATE auth_sessions 
         SET id_token = ?, expires_at = ?, last_active_at = ? 
         WHERE user_id = ? AND is_active = 1;`,
        [idToken, expiresAt, now, userId]
      );
    } catch (error) {
      console.error('Failed to update session token in SQLite:', error);
    }
  }

  /**
   * Update last active interaction timestamp
   */
  public async updateLastActiveTime(userId: string): Promise<void> {
    const now = Date.now();
    if (this.fallbackMemorySession && this.fallbackMemorySession.userId === userId) {
      this.fallbackMemorySession.lastActiveAt = now;
    }

    if (!this.db) return;

    try {
      await this.db.execute(
        `UPDATE auth_sessions SET last_active_at = ? WHERE user_id = ? AND is_active = 1;`,
        [now, userId]
      );
    } catch (error) {
      console.error('Failed to update last active time in SQLite:', error);
    }
  }

  /**
   * Deactivate and clear active session in SQLite on logout
   */
  public async clearActiveAuthSession(): Promise<void> {
    this.fallbackMemorySession = null;
    if (!this.db) return;

    try {
      await this.db.execute(`UPDATE auth_sessions SET is_active = 0;`);
    } catch (error) {
      console.error('Failed to clear active auth session in SQLite:', error);
    }
  }

  /**
   * Delete all session records completely
   */
  public async purgeAllSessions(): Promise<void> {
    this.fallbackMemorySession = null;
    if (!this.db) return;

    try {
      await this.db.execute(`DELETE FROM auth_sessions;`);
    } catch (error) {
      console.error('Failed to purge auth sessions in SQLite:', error);
    }
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
