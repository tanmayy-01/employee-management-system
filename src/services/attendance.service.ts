import { open, DB } from '@op-engineering/op-sqlite';
import { AttendanceBreak, AttendanceLog, AttendanceStats } from '../types';
import { notificationService } from './notification.service';

const DB_NAME = 'workpulse_auth.db';

export interface RecentActivity {
  id: string;
  type: 'in' | 'out' | 'pause' | 'resume';
  title: string;
  location: string;
  time: string;
  timestamp: number;
}

class AttendanceService {
  private db: DB | null = null;
  private isInitialized = false;
  private memoryLogs: Map<string, AttendanceLog> = new Map();
  private memoryBreaks: Map<string, AttendanceBreak> = new Map();

  /**
   * Initialize SQLite attendance & breaks tables
   */
  public async initAttendanceTable(): Promise<boolean> {
    if (this.isInitialized && this.db) {
      return true;
    }

    try {
      this.db = open({ name: DB_NAME });

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS attendance_logs (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          date TEXT NOT NULL,
          check_in_time INTEGER NOT NULL,
          check_out_time INTEGER,
          duration_seconds INTEGER DEFAULT 0,
          status TEXT DEFAULT 'present',
          check_in_location TEXT DEFAULT 'Headquarters',
          check_out_location TEXT DEFAULT 'Headquarters',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS attendance_breaks (
          id TEXT PRIMARY KEY,
          attendance_id TEXT NOT NULL,
          employee_id TEXT NOT NULL,
          date TEXT NOT NULL,
          start_time INTEGER NOT NULL,
          end_time INTEGER,
          duration_seconds INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      // Create index for fast lookups by employee and date
      try {
        await this.db.execute(`
          CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_logs (employee_id, date);
        `);
        await this.db.execute(`
          CREATE INDEX IF NOT EXISTS idx_breaks_emp_date ON attendance_breaks (employee_id, date);
        `);
      } catch {}

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Attendance table init warning (using memory fallback):', error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Format a timestamp into standard local YYYY-MM-DD string
   */
  public getTodayDateString(timestamp: number = Date.now()): string {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format total seconds into friendly "Xh Ym" string
   */
  public formatSecondsToHoursMinutes(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '0h 0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Format timestamp into local 12-hour time string (e.g. 08:30 AM)
   */
  public formatTimeOnly(timestamp: number): string {
    const d = new Date(timestamp);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  /**
   * Format timestamp into friendly date and time (e.g. "Fri, 08:55 AM")
   */
  public formatDayTime(timestamp: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(timestamp);
    const dayName = days[d.getDay()];
    return `${dayName}, ${this.formatTimeOnly(timestamp)}`;
  }

  /**
   * Get the currently active (checked-in, open) session for an employee
   */
  public async getActiveSession(employeeId: string): Promise<AttendanceLog | null> {
    if (!employeeId) return null;
    await this.initAttendanceTable();

    // Check memory cache first
    for (const log of this.memoryLogs.values()) {
      if (log.employeeId === employeeId && log.checkOutTime === null) {
        return log;
      }
    }

    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_logs 
         WHERE employee_id = ? AND check_out_time IS NULL 
         ORDER BY check_in_time DESC LIMIT 1;`,
        [employeeId]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const log: AttendanceLog = {
          id: String(row.id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          checkInTime: Number(row.check_in_time),
          checkOutTime: row.check_out_time ? Number(row.check_out_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          status: row.status as any,
          checkInLocation: String(row.check_in_location || 'Headquarters'),
          checkOutLocation: row.check_out_location ? String(row.check_out_location) : undefined,
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        };
        this.memoryLogs.set(log.id, log);
        return log;
      }

      return null;
    } catch (error) {
      console.error('Failed to get active attendance session from SQLite:', error);
      return null;
    }
  }

  /**
   * Check if employee is currently checked in
   */
  public async isCheckedIn(employeeId: string): Promise<boolean> {
    const active = await this.getActiveSession(employeeId);
    return active !== null;
  }

  /**
   * Check In an employee
   * Creates a new session entry in SQLite table.
   * Multiple check-ins per day are supported.
   */
  public async checkIn(
    employeeId: string,
    location: string = 'Headquarters'
  ): Promise<AttendanceLog> {
    if (!employeeId) {
      throw new Error('Employee ID is required to check in.');
    }

    await this.initAttendanceTable();

    // Verify employee is not already checked in
    const activeSession = await this.getActiveSession(employeeId);
    if (activeSession) {
      throw new Error('You are already checked in. Please check out before starting a new session.');
    }

    const now = Date.now();
    const today = this.getTodayDateString(now);
    const newId = 'att_' + now + '_' + Math.random().toString(36).substring(2, 7);

    const newLog: AttendanceLog = {
      id: newId,
      employeeId,
      date: today,
      checkInTime: now,
      checkOutTime: null,
      durationSeconds: 0,
      status: 'in-progress',
      checkInLocation: location,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryLogs.set(newLog.id, newLog);

    if (this.db) {
      try {
        await this.db.execute(
          `INSERT INTO attendance_logs (
            id, employee_id, date, check_in_time, check_out_time, duration_seconds,
            status, check_in_location, check_out_location, created_at, updated_at
          ) VALUES (?, ?, ?, ?, NULL, 0, ?, ?, NULL, ?, ?);`,
          [
            newLog.id,
            newLog.employeeId,
            newLog.date,
            newLog.checkInTime,
            newLog.status,
            newLog.checkInLocation,
            newLog.createdAt,
            newLog.updatedAt,
          ]
        );
      } catch (error) {
        console.error('Failed to insert check-in record into SQLite:', error);
      }
    }

    // Send notification with total working hours today
    try {
      const totalTodaySeconds = await this.getTodayWorkedSeconds(employeeId);
      const todayFormatted = this.formatSecondsToHoursMinutes(totalTodaySeconds);
      const checkInTimeFormatted = this.formatTimeOnly(newLog.checkInTime);

      await notificationService.addNotification({
        employeeId,
        title: 'Checked in successfully',
        description: `Shift started at ${checkInTimeFormatted}. Total working hours today: ${todayFormatted}.`,
        type: 'checkin',
      });
    } catch (notifErr) {
      console.warn('Failed to send check-in notification:', notifErr);
    }

    return newLog;
  }

  /**
   * Get the currently active (open) break for an employee
   */
  public async getActiveBreak(employeeId: string): Promise<AttendanceBreak | null> {
    if (!employeeId) return null;
    await this.initAttendanceTable();

    // Check memory cache first
    for (const brk of this.memoryBreaks.values()) {
      if (brk.employeeId === employeeId && brk.endTime === null) {
        return brk;
      }
    }

    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_breaks 
         WHERE employee_id = ? AND end_time IS NULL 
         ORDER BY start_time DESC LIMIT 1;`,
        [employeeId]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const brk: AttendanceBreak = {
          id: String(row.id),
          attendanceId: String(row.attendance_id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          startTime: Number(row.start_time),
          endTime: row.end_time ? Number(row.end_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        };
        this.memoryBreaks.set(brk.id, brk);
        return brk;
      }

      return null;
    } catch (error) {
      console.error('Failed to get active break from SQLite:', error);
      return null;
    }
  }

  /**
   * Check if employee is currently paused / on break
   */
  public async isOnBreak(employeeId: string): Promise<boolean> {
    const active = await this.getActiveBreak(employeeId);
    return active !== null;
  }

  /**
   * Pause the active attendance session (Start a break)
   */
  public async pauseSession(employeeId: string): Promise<AttendanceBreak> {
    if (!employeeId) {
      throw new Error('Employee ID is required to pause session.');
    }

    await this.initAttendanceTable();

    const activeSession = await this.getActiveSession(employeeId);
    if (!activeSession) {
      throw new Error('You must be checked in to pause and take a break.');
    }

    const currentBreak = await this.getActiveBreak(employeeId);
    if (currentBreak) {
      throw new Error('Session is already paused (on break).');
    }

    const now = Date.now();
    const today = this.getTodayDateString(now);
    const breakId = 'brk_' + now + '_' + Math.random().toString(36).substring(2, 7);

    const newBreak: AttendanceBreak = {
      id: breakId,
      attendanceId: activeSession.id,
      employeeId,
      date: today,
      startTime: now,
      endTime: null,
      durationSeconds: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryBreaks.set(newBreak.id, newBreak);

    if (this.db) {
      try {
        await this.db.execute(
          `INSERT INTO attendance_breaks (
            id, attendance_id, employee_id, date, start_time, end_time, duration_seconds, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NULL, 0, ?, ?);`,
          [
            newBreak.id,
            newBreak.attendanceId,
            newBreak.employeeId,
            newBreak.date,
            newBreak.startTime,
            newBreak.createdAt,
            newBreak.updatedAt,
          ]
        );
      } catch (error) {
        console.error('Failed to insert break record into SQLite:', error);
      }
    }

    // Send notification
    try {
      const breakTimeFormatted = this.formatTimeOnly(now);
      await notificationService.addNotification({
        employeeId,
        title: 'Break Started (Paused)',
        description: `Work session paused at ${breakTimeFormatted}.`,
        type: 'break',
      });
    } catch (notifErr) {
      console.warn('Failed to send break start notification:', notifErr);
    }

    return newBreak;
  }

  /**
   * Resume the active attendance session (End the active break)
   */
  public async resumeSession(employeeId: string): Promise<AttendanceBreak> {
    if (!employeeId) {
      throw new Error('Employee ID is required to resume session.');
    }

    await this.initAttendanceTable();

    const activeBreak = await this.getActiveBreak(employeeId);
    if (!activeBreak) {
      throw new Error('No active break found to resume.');
    }

    const now = Date.now();
    const durationSeconds = Math.max(0, Math.floor((now - activeBreak.startTime) / 1000));

    const updatedBreak: AttendanceBreak = {
      ...activeBreak,
      endTime: now,
      durationSeconds,
      updatedAt: now,
    };

    this.memoryBreaks.set(updatedBreak.id, updatedBreak);

    if (this.db) {
      try {
        await this.db.execute(
          `UPDATE attendance_breaks 
           SET end_time = ?, duration_seconds = ?, updated_at = ?
           WHERE id = ?;`,
          [now, durationSeconds, now, updatedBreak.id]
        );
      } catch (error) {
        console.error('Failed to update break record in SQLite:', error);
      }
    }

    // Send notification
    try {
      const resumeTimeFormatted = this.formatTimeOnly(now);
      const breakDurationFormatted = this.formatSecondsToHoursMinutes(durationSeconds);
      await notificationService.addNotification({
        employeeId,
        title: 'Resumed Work',
        description: `Session resumed at ${resumeTimeFormatted} (Break: ${breakDurationFormatted}).`,
        type: 'break',
      });
    } catch (notifErr) {
      console.warn('Failed to send break resume notification:', notifErr);
    }

    return updatedBreak;
  }

  /**
   * Get breaks for a specific attendance session
   */
  public async getBreaksForSession(attendanceId: string): Promise<AttendanceBreak[]> {
    if (!attendanceId) return [];
    await this.initAttendanceTable();

    if (!this.db) {
      const list: AttendanceBreak[] = [];
      for (const brk of this.memoryBreaks.values()) {
        if (brk.attendanceId === attendanceId) {
          list.push(brk);
        }
      }
      return list.sort((a, b) => a.startTime - b.startTime);
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_breaks 
         WHERE attendance_id = ? 
         ORDER BY start_time ASC;`,
        [attendanceId]
      );

      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          attendanceId: String(row.attendance_id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          startTime: Number(row.start_time),
          endTime: row.end_time ? Number(row.end_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get breaks for session from SQLite:', error);
      return [];
    }
  }

  /**
   * Get all break logs for an employee on a given date (default today)
   */
  public async getTodayBreaks(
    employeeId: string,
    targetDate?: string
  ): Promise<AttendanceBreak[]> {
    if (!employeeId) return [];
    await this.initAttendanceTable();

    const date = targetDate || this.getTodayDateString();

    if (!this.db) {
      const list: AttendanceBreak[] = [];
      for (const brk of this.memoryBreaks.values()) {
        if (brk.employeeId === employeeId && brk.date === date) {
          list.push(brk);
        }
      }
      return list.sort((a, b) => a.startTime - b.startTime);
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_breaks 
         WHERE employee_id = ? AND date = ? 
         ORDER BY start_time ASC;`,
        [employeeId, date]
      );

      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          attendanceId: String(row.attendance_id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          startTime: Number(row.start_time),
          endTime: row.end_time ? Number(row.end_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get today breaks from SQLite:', error);
      return [];
    }
  }

  /**
   * Get all breaks for an employee
   */
  public async getAllBreaks(employeeId: string): Promise<AttendanceBreak[]> {
    if (!employeeId) return [];
    await this.initAttendanceTable();

    if (!this.db) {
      const list: AttendanceBreak[] = [];
      for (const brk of this.memoryBreaks.values()) {
        if (brk.employeeId === employeeId) {
          list.push(brk);
        }
      }
      return list.sort((a, b) => a.startTime - b.startTime);
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_breaks 
         WHERE employee_id = ? 
         ORDER BY start_time DESC;`,
        [employeeId]
      );

      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          attendanceId: String(row.attendance_id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          startTime: Number(row.start_time),
          endTime: row.end_time ? Number(row.end_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get all breaks from SQLite:', error);
      return [];
    }
  }

  /**
   * Check Out an employee
   * RULE: Cannot Check Out before Check In.
   */
  public async checkOut(
    employeeId: string,
    location: string = 'Headquarters'
  ): Promise<AttendanceLog> {
    if (!employeeId) {
      throw new Error('Employee ID is required to check out.');
    }

    await this.initAttendanceTable();

    // RULE ENFORCEMENT: Cannot check out without active check-in
    const activeSession = await this.getActiveSession(employeeId);
    if (!activeSession) {
      throw new Error('Cannot Check Out before Check In. You do not have an active check-in session.');
    }

    const now = Date.now();

    // If currently on break when checking out, automatically close active break
    const activeBreak = await this.getActiveBreak(employeeId);
    if (activeBreak) {
      const breakDuration = Math.max(0, Math.floor((now - activeBreak.startTime) / 1000));
      const updatedBreak: AttendanceBreak = {
        ...activeBreak,
        endTime: now,
        durationSeconds: breakDuration,
        updatedAt: now,
      };
      this.memoryBreaks.set(updatedBreak.id, updatedBreak);
      if (this.db) {
        try {
          await this.db.execute(
            `UPDATE attendance_breaks SET end_time = ?, duration_seconds = ?, updated_at = ? WHERE id = ?;`,
            [now, breakDuration, now, updatedBreak.id]
          );
        } catch (err) {
          console.error('Failed to close active break on checkout in SQLite:', err);
        }
      }
    }

    // Calculate total break duration for this session
    const sessionBreaks = await this.getBreaksForSession(activeSession.id);
    let totalSessionBreakSeconds = 0;
    for (const b of sessionBreaks) {
      if (b.endTime) {
        totalSessionBreakSeconds += b.durationSeconds;
      } else {
        totalSessionBreakSeconds += Math.max(0, Math.floor((now - b.startTime) / 1000));
      }
    }

    const elapsedSeconds = Math.max(0, Math.floor((now - activeSession.checkInTime) / 1000));
    const durationSeconds = Math.max(0, elapsedSeconds - totalSessionBreakSeconds);

    // Determine status (e.g. present, half-day)
    const status = durationSeconds >= 4 * 3600 ? 'present' : 'present';

    const updatedLog: AttendanceLog = {
      ...activeSession,
      checkOutTime: now,
      durationSeconds,
      status,
      checkOutLocation: location,
      updatedAt: now,
    };

    this.memoryLogs.set(updatedLog.id, updatedLog);

    if (this.db) {
      try {
        await this.db.execute(
          `UPDATE attendance_logs 
           SET check_out_time = ?, duration_seconds = ?, status = ?, check_out_location = ?, updated_at = ?
           WHERE id = ?;`,
          [
            updatedLog.checkOutTime,
            updatedLog.durationSeconds,
            updatedLog.status,
            updatedLog.checkOutLocation || location,
            now,
            updatedLog.id,
          ]
        );
      } catch (error) {
        console.error('Failed to update check-out record in SQLite:', error);
      }
    }

    // Send notification with total working hours today
    try {
      const totalTodaySeconds = await this.getTodayWorkedSeconds(employeeId);
      const todayFormatted = this.formatSecondsToHoursMinutes(totalTodaySeconds);
      const checkOutTimeFormatted = this.formatTimeOnly(updatedLog.checkOutTime!);
      const sessionDurationFormatted = this.formatSecondsToHoursMinutes(updatedLog.durationSeconds);

      await notificationService.addNotification({
        employeeId,
        title: 'Checked out successfully',
        description: `Shift ended at ${checkOutTimeFormatted} (Session: ${sessionDurationFormatted}). Total working hours today: ${todayFormatted}.`,
        type: 'checkin',
      });
    } catch (notifErr) {
      console.warn('Failed to send check-out notification:', notifErr);
    }

    return updatedLog;
  }

  /**
   * Get all attendance sessions for an employee on a given date (default today)
   */
  public async getTodaySessions(
    employeeId: string,
    targetDate?: string
  ): Promise<AttendanceLog[]> {
    if (!employeeId) return [];
    await this.initAttendanceTable();

    const date = targetDate || this.getTodayDateString();

    if (!this.db) {
      const logs: AttendanceLog[] = [];
      for (const log of this.memoryLogs.values()) {
        if (log.employeeId === employeeId && log.date === date) {
          logs.push(log);
        }
      }
      return logs.sort((a, b) => a.checkInTime - b.checkInTime);
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_logs 
         WHERE employee_id = ? AND date = ? 
         ORDER BY check_in_time ASC;`,
        [employeeId, date]
      );

      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          date: String(row.date),
          checkInTime: Number(row.check_in_time),
          checkOutTime: row.check_out_time ? Number(row.check_out_time) : null,
          durationSeconds: Number(row.duration_seconds || 0),
          status: row.status as any,
          checkInLocation: String(row.check_in_location || 'Headquarters'),
          checkOutLocation: row.check_out_location ? String(row.check_out_location) : undefined,
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get today sessions from SQLite:', error);
      return [];
    }
  }

  /**
   * Calculate total worked seconds today (sum of completed sessions + running active session minus breaks)
   */
  public async getTodayWorkedSeconds(employeeId: string): Promise<number> {
    const sessions = await this.getTodaySessions(employeeId);
    const todayBreaks = await this.getTodayBreaks(employeeId);
    const now = Date.now();
    let totalSessionSeconds = 0;
    let totalBreakSeconds = 0;

    for (const session of sessions) {
      if (session.checkOutTime) {
        totalSessionSeconds += session.durationSeconds;
      } else {
        // Active session currently in progress: elapsed time
        totalSessionSeconds += Math.max(0, Math.floor((now - session.checkInTime) / 1000));
      }
    }

    for (const brk of todayBreaks) {
      // If session is active and break is active or finished today
      if (brk.endTime) {
        // For completed sessions, duration_seconds in attendance_logs already excluded breaks at checkout.
        // So we only subtract breaks belonging to active session
        const session = sessions.find((s) => s.id === brk.attendanceId);
        if (session && !session.checkOutTime) {
          totalBreakSeconds += brk.durationSeconds;
        }
      } else {
        totalBreakSeconds += Math.max(0, Math.floor((now - brk.startTime) / 1000));
      }
    }

    return Math.max(0, totalSessionSeconds - totalBreakSeconds);
  }

  /**
   * Calculate total worked seconds for the current week (starting Monday)
   */
  public async getWeekWorkedSeconds(employeeId: string): Promise<number> {
    if (!employeeId) return 0;
    await this.initAttendanceTable();

    // Find start of current week (Monday 00:00:00)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const startOfWeekTime = monday.getTime();

    if (!this.db) {
      let total = 0;
      const curTime = Date.now();
      for (const log of this.memoryLogs.values()) {
        if (log.employeeId === employeeId && log.checkInTime >= startOfWeekTime) {
          if (log.checkOutTime) {
            total += log.durationSeconds;
          } else {
            // Subtract active session breaks
            let activeBreakSec = 0;
            for (const b of this.memoryBreaks.values()) {
              if (b.attendanceId === log.id) {
                if (b.endTime) activeBreakSec += b.durationSeconds;
                else activeBreakSec += Math.max(0, Math.floor((curTime - b.startTime) / 1000));
              }
            }
            const elapsed = Math.max(0, Math.floor((curTime - log.checkInTime) / 1000));
            total += Math.max(0, elapsed - activeBreakSec);
          }
        }
      }
      return total;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM attendance_logs 
         WHERE employee_id = ? AND check_in_time >= ? 
         ORDER BY check_in_time ASC;`,
        [employeeId, startOfWeekTime]
      );

      let total = 0;
      const curTime = Date.now();
      if (result.rows && result.rows.length > 0) {
        for (const row of result.rows as Record<string, any>[]) {
          if (row.check_out_time) {
            total += Number(row.duration_seconds || 0);
          } else {
            const attId = String(row.id);
            const breaks = await this.getBreaksForSession(attId);
            let activeBreakSec = 0;
            for (const b of breaks) {
              if (b.endTime) activeBreakSec += b.durationSeconds;
              else activeBreakSec += Math.max(0, Math.floor((curTime - b.startTime) / 1000));
            }
            const elapsed = Math.max(0, Math.floor((curTime - Number(row.check_in_time)) / 1000));
            total += Math.max(0, elapsed - activeBreakSec);
          }
        }
      }

      return total;
    } catch (error) {
      console.error('Failed to get week worked seconds from SQLite:', error);
      return 0;
    }
  }

  /**
   * Get aggregated attendance stats for the dashboard and attendance screens
   */
  public async getAttendanceStats(
    employeeId: string,
    targetDailyHours: number = 8
  ): Promise<AttendanceStats> {
    const activeSession = await this.getActiveSession(employeeId);
    const activeBreak = await this.getActiveBreak(employeeId);
    const isPaused = activeBreak !== null;

    const todaySessions = await this.getTodaySessions(employeeId);
    const todayBreaks = await this.getTodayBreaks(employeeId);
    const todaySeconds = await this.getTodayWorkedSeconds(employeeId);
    const weekSeconds = await this.getWeekWorkedSeconds(employeeId);

    const now = Date.now();
    let todayBreakSeconds = 0;
    for (const b of todayBreaks) {
      if (b.endTime) {
        todayBreakSeconds += b.durationSeconds;
      } else {
        todayBreakSeconds += Math.max(0, Math.floor((now - b.startTime) / 1000));
      }
    }

    // Calculate worked seconds specifically for current active session
    let sessionWorkedSeconds = 0;
    if (activeSession) {
      const elapsed = Math.max(0, Math.floor((now - activeSession.checkInTime) / 1000));
      let currentSessionBreakSec = 0;
      for (const b of todayBreaks) {
        if (b.attendanceId === activeSession.id) {
          if (b.endTime) currentSessionBreakSec += b.durationSeconds;
          else currentSessionBreakSec += Math.max(0, Math.floor((now - b.startTime) / 1000));
        }
      }
      sessionWorkedSeconds = Math.max(0, elapsed - currentSessionBreakSec);
    }

    const targetSeconds = targetDailyHours * 3600;
    const remainingSeconds = Math.max(0, targetSeconds - todaySeconds);

    let lastCheckInFormatted: string | undefined;
    let lastCheckInLocation: string | undefined;

    if (activeSession) {
      lastCheckInFormatted = this.formatTimeOnly(activeSession.checkInTime);
      lastCheckInLocation = activeSession.checkInLocation;
    } else if (todaySessions.length > 0) {
      const last = todaySessions[todaySessions.length - 1];
      lastCheckInFormatted = this.formatTimeOnly(last.checkInTime);
      lastCheckInLocation = last.checkInLocation;
    }

    return {
      isCheckedIn: activeSession !== null,
      isPaused,
      activeSession,
      activeBreak,
      todaySeconds,
      todayHoursFormatted: this.formatSecondsToHoursMinutes(todaySeconds),
      weekSeconds,
      weekHoursFormatted: this.formatSecondsToHoursMinutes(weekSeconds),
      remainingSeconds,
      remainingHoursFormatted: this.formatSecondsToHoursMinutes(remainingSeconds),
      todaySessionsCount: todaySessions.length,
      todayBreakSeconds,
      todayBreakHoursFormatted: this.formatSecondsToHoursMinutes(todayBreakSeconds),
      sessionWorkedSeconds,
      lastCheckInFormatted,
      lastCheckInLocation,
    };
  }

  /**
   * Get recent check-in/out & break activity items for timeline and activity feeds
   */
  public async getRecentActivities(
    employeeId: string,
    limit: number = 6
  ): Promise<RecentActivity[]> {
    if (!employeeId) return [];
    await this.initAttendanceTable();

    let logs: AttendanceLog[] = [];
    let breaks: AttendanceBreak[] = [];

    if (!this.db) {
      logs = Array.from(this.memoryLogs.values()).filter((l) => l.employeeId === employeeId);
      breaks = Array.from(this.memoryBreaks.values()).filter((b) => b.employeeId === employeeId);
    } else {
      try {
        const [logResult, breakResult] = await Promise.all([
          this.db.execute(
            `SELECT * FROM attendance_logs 
             WHERE employee_id = ? 
             ORDER BY check_in_time DESC LIMIT ?;`,
            [employeeId, limit * 2]
          ),
          this.db.execute(
            `SELECT * FROM attendance_breaks 
             WHERE employee_id = ? 
             ORDER BY start_time DESC LIMIT ?;`,
            [employeeId, limit * 2]
          ),
        ]);

        if (logResult.rows && logResult.rows.length > 0) {
          logs = (logResult.rows as Record<string, any>[]).map((row) => ({
            id: String(row.id),
            employeeId: String(row.employee_id),
            date: String(row.date),
            checkInTime: Number(row.check_in_time),
            checkOutTime: row.check_out_time ? Number(row.check_out_time) : null,
            durationSeconds: Number(row.duration_seconds || 0),
            status: row.status as any,
            checkInLocation: String(row.check_in_location || 'Headquarters'),
            checkOutLocation: row.check_out_location ? String(row.check_out_location) : undefined,
            createdAt: Number(row.created_at || Date.now()),
            updatedAt: Number(row.updated_at || Date.now()),
          }));
        }

        if (breakResult.rows && breakResult.rows.length > 0) {
          breaks = (breakResult.rows as Record<string, any>[]).map((row) => ({
            id: String(row.id),
            attendanceId: String(row.attendance_id),
            employeeId: String(row.employee_id),
            date: String(row.date),
            startTime: Number(row.start_time),
            endTime: row.end_time ? Number(row.end_time) : null,
            durationSeconds: Number(row.duration_seconds || 0),
            createdAt: Number(row.created_at || Date.now()),
            updatedAt: Number(row.updated_at || Date.now()),
          }));
        }
      } catch (error) {
        console.error('Failed to get recent activities from SQLite:', error);
      }
    }

    const activities: RecentActivity[] = [];

    // Add Check In & Check Out activities
    for (const log of logs) {
      if (log.checkOutTime) {
        activities.push({
          id: log.id + '_out',
          type: 'out',
          title: 'Checked Out',
          location: log.checkOutLocation || log.checkInLocation,
          time: this.formatDayTime(log.checkOutTime),
          timestamp: log.checkOutTime,
        });
      }
      activities.push({
        id: log.id + '_in',
        type: 'in',
        title: 'Checked In',
        location: log.checkInLocation,
        time: this.formatDayTime(log.checkInTime),
        timestamp: log.checkInTime,
      });
    }

    // Add Break Started (Paused) & Break Ended (Resumed) activities
    for (const brk of breaks) {
      if (brk.endTime) {
        activities.push({
          id: brk.id + '_resume',
          type: 'resume',
          title: 'Resumed Work',
          location: `Break Duration: ${this.formatSecondsToHoursMinutes(brk.durationSeconds)}`,
          time: this.formatDayTime(brk.endTime),
          timestamp: brk.endTime,
        });
        activities.push({
          id: brk.id + '_pause',
          type: 'pause',
          title: 'Break / Paused',
          location: 'Break started',
          time: this.formatDayTime(brk.startTime),
          timestamp: brk.startTime,
        });
      } else {
        activities.push({
          id: brk.id + '_pause',
          type: 'pause',
          title: 'On Break (Paused)',
          location: 'Break in progress',
          time: this.formatDayTime(brk.startTime),
          timestamp: brk.startTime,
        });
      }
    }

    // Sort by most recent timestamp
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get all attendance history logs for an employee grouped by month
   */
  public async getGroupedAttendanceHistory(employeeId: string): Promise<any[]> {
    if (!employeeId) return [];
    await this.initAttendanceTable();

    let logs: AttendanceLog[] = [];

    if (!this.db) {
      logs = Array.from(this.memoryLogs.values()).filter((l) => l.employeeId === employeeId);
    } else {
      try {
        const result = await this.db.execute(
          `SELECT * FROM attendance_logs 
           WHERE employee_id = ? 
           ORDER BY check_in_time DESC;`,
          [employeeId]
        );
        if (result.rows && result.rows.length > 0) {
          logs = (result.rows as Record<string, any>[]).map((row) => ({
            id: String(row.id),
            employeeId: String(row.employee_id),
            date: String(row.date),
            checkInTime: Number(row.check_in_time),
            checkOutTime: row.check_out_time ? Number(row.check_out_time) : null,
            durationSeconds: Number(row.duration_seconds || 0),
            status: row.status as any,
            checkInLocation: String(row.check_in_location || 'Headquarters'),
            checkOutLocation: row.check_out_location ? String(row.check_out_location) : undefined,
            createdAt: Number(row.created_at || Date.now()),
            updatedAt: Number(row.updated_at || Date.now()),
          }));
        }
      } catch (error) {
        console.error('Failed to get grouped attendance history from SQLite:', error);
      }
    }

    if (logs.length === 0) {
      return [];
    }

    // Group logs by Month and Year (e.g., "October 2026")
    const monthGroups: Map<string, any[]> = new Map();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const log of logs) {
      const d = new Date(log.checkInTime);
      const groupKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const dateFormatted = `${shortMonths[d.getMonth()]} ${d.getDate()}, ${days[d.getDay()]}`;

      let timeRange = '';
      if (log.checkOutTime) {
        timeRange = `${this.formatTimeOnly(log.checkInTime)} - ${this.formatTimeOnly(log.checkOutTime)} (${this.formatSecondsToHoursMinutes(log.durationSeconds)})`;
      } else {
        timeRange = `${this.formatTimeOnly(log.checkInTime)} - In Progress`;
      }

      const recordItem = {
        id: log.id,
        date: dateFormatted,
        rawDate: log.date,
        timestamp: log.checkInTime,
        status: log.status === 'in-progress' ? 'In Progress' : 'Present',
        statusType: log.status === 'in-progress' ? 'present' : 'present',
        timeRange,
        duration: this.formatSecondsToHoursMinutes(log.durationSeconds),
        location: log.checkInLocation,
      };

      if (!monthGroups.has(groupKey)) {
        monthGroups.set(groupKey, []);
      }
      monthGroups.get(groupKey)!.push(recordItem);
    }

    return Array.from(monthGroups.entries()).map(([sectionTitle, records], idx) => ({
      id: `group_${idx}_${sectionTitle.replace(/\s+/g, '_').toLowerCase()}`,
      sectionTitle,
      records,
    }));
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
