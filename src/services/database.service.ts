import { open, DB } from '@op-engineering/op-sqlite';
import { AuthSession, User } from '../types';

const DB_NAME = 'workpulse_auth.db';

class DatabaseService {
  private db: DB | null = null;
  private isInitialized = false;
  private fallbackMemorySession: AuthSession | null = null;
  private fallbackMemoryProfiles: Map<string, User> = new Map();

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
          phone TEXT,
          location TEXT,
          join_date TEXT,
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

      // Attempt safe migrations for previously created auth_sessions tables
      try {
        await this.db.execute('ALTER TABLE auth_sessions ADD COLUMN phone TEXT;');
      } catch {}
      try {
        await this.db.execute('ALTER TABLE auth_sessions ADD COLUMN location TEXT;');
      } catch {}
      try {
        await this.db.execute('ALTER TABLE auth_sessions ADD COLUMN join_date TEXT;');
      } catch {}

      // Create persistent user_profiles table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          employee_id TEXT,
          role TEXT,
          department TEXT,
          phone TEXT,
          location TEXT,
          join_date TEXT,
          avatar_url TEXT,
          updated_at INTEGER NOT NULL
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
   * Save or update a persistent user profile in SQLite
   */
  public async saveUserProfile(user: User): Promise<void> {
    await this.initDatabase();
    this.fallbackMemoryProfiles.set(user.id, user);

    if (!this.db) return;

    try {
      await this.db.execute(
        `INSERT OR REPLACE INTO user_profiles (
          user_id, email, name, employee_id, role, department, phone, location, join_date, avatar_url, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          user.id,
          user.email,
          user.name,
          user.employeeId || null,
          user.role || 'Employee',
          user.department || 'General',
          user.phone || '',
          user.location || 'Headquarters',
          user.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          user.avatarUrl || null,
          Date.now(),
        ]
      );
    } catch (error) {
      console.error('Failed to save user profile in SQLite:', error);
    }
  }

  /**
   * Retrieve persistent user profile by userId
   */
  public async getUserProfile(userId: string): Promise<User | null> {
    await this.initDatabase();

    if (!this.db) {
      return this.fallbackMemoryProfiles.get(userId) || null;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1;`,
        [userId]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const user: User = {
          id: String(row.user_id),
          email: String(row.email),
          name: String(row.name),
          employeeId: String(row.employee_id || ''),
          role: String(row.role || 'Employee'),
          department: String(row.department || 'General'),
          phone: row.phone ? String(row.phone) : '',
          location: row.location ? String(row.location) : 'Headquarters',
          joinDate: row.join_date ? String(row.join_date) : '',
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
        };
        this.fallbackMemoryProfiles.set(user.id, user);
        return user;
      }
      return this.fallbackMemoryProfiles.get(userId) || null;
    } catch (error) {
      console.error('Failed to get user profile from SQLite:', error);
      return this.fallbackMemoryProfiles.get(userId) || null;
    }
  }

  /**
   * Update selective profile fields and persist to SQLite
   */
  public async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const existing = await this.getUserProfile(userId);
    const updatedUser: User = {
      id: userId,
      email: updates.email !== undefined ? updates.email : existing?.email || '',
      name: updates.name !== undefined ? updates.name : existing?.name || 'Employee',
      employeeId: updates.employeeId !== undefined ? updates.employeeId : existing?.employeeId || '',
      role: updates.role !== undefined ? updates.role : existing?.role || 'Employee',
      department: updates.department !== undefined ? updates.department : existing?.department || 'General',
      phone: updates.phone !== undefined ? updates.phone : existing?.phone || '',
      location: updates.location !== undefined ? updates.location : existing?.location || 'Headquarters',
      joinDate: updates.joinDate !== undefined ? updates.joinDate : existing?.joinDate || '',
      avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : existing?.avatarUrl,
    };

    await this.saveUserProfile(updatedUser);

    // Also update current active session if matching
    if (this.fallbackMemorySession && this.fallbackMemorySession.userId === userId) {
      this.fallbackMemorySession = {
        ...this.fallbackMemorySession,
        name: updatedUser.name,
        email: updatedUser.email,
        employeeId: updatedUser.employeeId,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone,
        location: updatedUser.location,
        joinDate: updatedUser.joinDate,
        avatarUrl: updatedUser.avatarUrl,
      };
    }

    if (this.db) {
      try {
        await this.db.execute(
          `UPDATE auth_sessions 
           SET name = ?, email = ?, employee_id = ?, role = ?, department = ?, phone = ?, location = ?, join_date = ?, avatar_url = ?
           WHERE user_id = ? AND is_active = 1;`,
          [
            updatedUser.name,
            updatedUser.email,
            updatedUser.employeeId,
            updatedUser.role,
            updatedUser.department,
            updatedUser.phone || '',
            updatedUser.location || '',
            updatedUser.joinDate || '',
            updatedUser.avatarUrl || null,
            userId,
          ]
        );
      } catch (e) {
        console.warn('Failed to update active auth_session profile:', e);
      }
    }

    return updatedUser;
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
            user_id, email, name, employee_id, role, department, phone, location, join_date, avatar_url,
            id_token, refresh_token, issued_at, expires_at, last_active_at, remember_me, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
          [
            session.userId,
            session.email,
            session.name,
            session.employeeId,
            session.role,
            session.department,
            session.phone || '',
            session.location || '',
            session.joinDate || '',
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
          role: String(row.role || 'Employee'),
          department: String(row.department || 'General'),
          phone: row.phone ? String(row.phone) : '',
          location: row.location ? String(row.location) : '',
          joinDate: row.join_date ? String(row.join_date) : '',
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
