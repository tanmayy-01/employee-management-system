import { open, DB } from '@op-engineering/op-sqlite';
import { AppNotification } from '../types';

const DB_NAME = 'workpulse_auth.db';

class NotificationService {
  private db: DB | null = null;
  private isInitialized = false;
  private memoryNotifications: Map<string, AppNotification> = new Map();

  /**
   * Initialize SQLite notifications table
   */
  public async initNotificationTable(): Promise<boolean> {
    if (this.isInitialized && this.db) {
      return true;
    }

    try {
      this.db = open({ name: DB_NAME });

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL,
          is_read INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
      `);

      try {
        await this.db.execute(`
          CREATE INDEX IF NOT EXISTS idx_notifications_emp ON notifications (employee_id, created_at DESC);
        `);
      } catch {}

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Notification table init warning (using memory fallback):', error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Format timestamp to friendly time string
   */
  public formatNotificationTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const d = new Date(timestamp);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) {
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');
      return `${formattedHours}:${minutes} ${ampm}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${shortMonths[d.getMonth()]} ${d.getDate()}`;
  }

  /**
   * Check if a timestamp occurred today
   */
  public isToday(timestamp: number): boolean {
    const d = new Date(timestamp);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Add a new notification for an employee
   */
  public async addNotification(payload: {
    employeeId: string;
    title: string;
    description: string;
    type: 'checkin' | 'checkout' | 'meeting' | 'summary' | 'alert';
  }): Promise<AppNotification> {
    await this.initNotificationTable();

    const now = Date.now();
    const id = 'notif_' + now + '_' + Math.random().toString(36).substring(2, 7);

    const notification: AppNotification = {
      id,
      employeeId: payload.employeeId,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      time: this.formatNotificationTime(now),
      timestamp: now,
      isRead: false,
    };

    this.memoryNotifications.set(id, notification);

    if (this.db) {
      try {
        await this.db.execute(
          `INSERT INTO notifications (id, employee_id, title, description, type, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, 0, ?);`,
          [
            notification.id,
            notification.employeeId,
            notification.title,
            notification.description,
            notification.type,
            notification.timestamp,
          ]
        );
      } catch (error) {
        console.error('Failed to save notification to SQLite:', error);
      }
    }

    return notification;
  }

  /**
   * Get all notifications for an employee
   */
  public async getNotifications(employeeId: string): Promise<AppNotification[]> {
    if (!employeeId) return [];
    await this.initNotificationTable();

    if (!this.db) {
      const list = Array.from(this.memoryNotifications.values())
        .filter((n) => n.employeeId === employeeId)
        .sort((a, b) => b.timestamp - a.timestamp);
      return list.map((item) => ({
        ...item,
        time: this.formatNotificationTime(item.timestamp),
      }));
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC;`,
        [employeeId]
      );

      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          title: String(row.title),
          description: String(row.description),
          type: row.type as any,
          time: this.formatNotificationTime(Number(row.created_at)),
          timestamp: Number(row.created_at),
          isRead: Number(row.is_read) === 1,
        }));
      }

      // If no notifications exist yet in SQLite, provide default sample notifications
      const defaults = this.getDefaultNotifications(employeeId);
      for (const def of defaults) {
        await this.addNotification({
          employeeId: def.employeeId,
          title: def.title,
          description: def.description,
          type: def.type,
        });
      }
      return defaults;
    } catch (error) {
      console.error('Failed to fetch notifications from SQLite:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadCount(employeeId: string): Promise<number> {
    if (!employeeId) return 0;
    await this.initNotificationTable();

    if (!this.db) {
      return Array.from(this.memoryNotifications.values()).filter(
        (n) => n.employeeId === employeeId && !n.isRead
      ).length;
    }

    try {
      const result = await this.db.execute(
        `SELECT COUNT(*) as count FROM notifications WHERE employee_id = ? AND is_read = 0;`,
        [employeeId]
      );
      if (result.rows && result.rows.length > 0) {
        return Number((result.rows[0] as any).count || 0);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Mark all notifications as read for an employee
   */
  public async markAllAsRead(employeeId: string): Promise<void> {
    if (!employeeId) return;
    await this.initNotificationTable();

    for (const notif of this.memoryNotifications.values()) {
      if (notif.employeeId === employeeId) {
        notif.isRead = true;
      }
    }

    if (this.db) {
      try {
        await this.db.execute(
          `UPDATE notifications SET is_read = 1 WHERE employee_id = ?;`,
          [employeeId]
        );
      } catch (error) {
        console.error('Failed to mark notifications as read in SQLite:', error);
      }
    }
  }

  /**
   * Clear all notifications for an employee
   */
  public async clearAllNotifications(employeeId: string): Promise<void> {
    if (!employeeId) return;
    await this.initNotificationTable();

    for (const [id, notif] of this.memoryNotifications.entries()) {
      if (notif.employeeId === employeeId) {
        this.memoryNotifications.delete(id);
      }
    }

    if (this.db) {
      try {
        await this.db.execute(
          `DELETE FROM notifications WHERE employee_id = ?;`,
          [employeeId]
        );
      } catch (error) {
        console.error('Failed to clear notifications in SQLite:', error);
      }
    }
  }

  /**
   * Default initial notifications
   */
  private getDefaultNotifications(employeeId: string): AppNotification[] {
    const now = Date.now();
    return [
      {
        id: 'seed_1',
        employeeId,
        title: 'Welcome to WorkPulse',
        description: 'Track your daily check-ins, working hours, and view company updates here.',
        type: 'meeting',
        time: 'Just now',
        timestamp: now,
        isRead: false,
      },
    ];
  }
}

export const notificationService = new NotificationService();
export default notificationService;
