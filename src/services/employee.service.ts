import { open, DB } from '@op-engineering/op-sqlite';
import { Employee } from '../types';

const DB_NAME = 'workpulse_auth.db';

class EmployeeService {
  private db: DB | null = null;
  private isInitialized = false;
  private memoryCache: Map<string, Employee> = new Map();

  /**
   * Initialize SQLite connection and create employees table if not exists
   */
  public async initEmployeeTable(): Promise<boolean> {
    if (this.isInitialized && this.db) {
      return true;
    }

    try {
      this.db = open({ name: DB_NAME });

      // Create employees table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS employees (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT DEFAULT 'Employee',
          department TEXT DEFAULT 'General',
          phone TEXT DEFAULT '',
          location TEXT DEFAULT 'Headquarters',
          join_date TEXT,
          avatar_url TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Employee table init warning (using in-memory fallback):', error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Insert a new employee record during sign-up
   */
  public async createEmployee(
    data: Omit<Employee, 'createdAt' | 'updatedAt'> & {
      createdAt?: number;
      updatedAt?: number;
    }
  ): Promise<Employee> {
    await this.initEmployeeTable();

    const now = Date.now();
    const formattedJoinDate =
      data.joinDate ||
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    const employee: Employee = {
      id: data.id,
      employeeId: data.employeeId,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      role: data.role || 'Employee',
      department: data.department || 'General',
      phone: data.phone || '',
      location: data.location || 'Headquarters',
      joinDate: formattedJoinDate,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    this.memoryCache.set(employee.id, employee);

    if (this.db) {
      try {
        await this.db.execute(
          `INSERT OR REPLACE INTO employees (
            id, employee_id, name, email, role, department, phone, location, join_date, avatar_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            employee.id,
            employee.employeeId,
            employee.name,
            employee.email,
            employee.role,
            employee.department,
            employee.phone || '',
            employee.location || 'Headquarters',
            employee.joinDate || formattedJoinDate,
            employee.avatarUrl || null,
            employee.createdAt || now,
            employee.updatedAt || now,
          ]
        );
      } catch (error) {
        console.error('Failed to insert employee into SQLite table:', error);
      }
    }

    return employee;
  }

  /**
   * Fetch employee data by userId (Firebase UID)
   */
  public async getEmployeeById(userId: string): Promise<Employee | null> {
    await this.initEmployeeTable();

    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!;
    }

    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM employees WHERE id = ? LIMIT 1;`,
        [userId]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const employee: Employee = {
          id: String(row.id),
          employeeId: String(row.employee_id),
          name: String(row.name),
          email: String(row.email),
          role: String(row.role || 'Employee'),
          department: String(row.department || 'General'),
          phone: row.phone ? String(row.phone) : '',
          location: row.location ? String(row.location) : 'Headquarters',
          joinDate: row.join_date ? String(row.join_date) : '',
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        };

        this.memoryCache.set(employee.id, employee);
        return employee;
      }
      return null;
    } catch (error) {
      console.error('Failed to get employee from SQLite:', error);
      return null;
    }
  }

  /**
   * Fetch employee data by email address
   */
  public async getEmployeeByEmail(email: string): Promise<Employee | null> {
    await this.initEmployeeTable();

    const normalizedEmail = email.toLowerCase().trim();

    for (const emp of this.memoryCache.values()) {
      if (emp.email.toLowerCase() === normalizedEmail) {
        return emp;
      }
    }

    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.execute(
        `SELECT * FROM employees WHERE LOWER(email) = ? LIMIT 1;`,
        [normalizedEmail]
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as Record<string, any>;
        const employee: Employee = {
          id: String(row.id),
          employeeId: String(row.employee_id),
          name: String(row.name),
          email: String(row.email),
          role: String(row.role || 'Employee'),
          department: String(row.department || 'General'),
          phone: row.phone ? String(row.phone) : '',
          location: row.location ? String(row.location) : 'Headquarters',
          joinDate: row.join_date ? String(row.join_date) : '',
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        };

        this.memoryCache.set(employee.id, employee);
        return employee;
      }
      return null;
    } catch (error) {
      console.error('Failed to get employee by email from SQLite:', error);
      return null;
    }
  }

  /**
   * Update employee profile data
   */
  public async updateEmployee(
    userId: string,
    updates: Partial<Employee>
  ): Promise<Employee> {
    const existing = await this.getEmployeeById(userId);
    const now = Date.now();

    const updatedEmployee: Employee = {
      id: userId,
      employeeId: updates.employeeId !== undefined ? updates.employeeId : existing?.employeeId || 'EMP-' + userId.substring(0, 4).toUpperCase(),
      name: updates.name !== undefined ? updates.name : existing?.name || 'Employee',
      email: updates.email !== undefined ? updates.email : existing?.email || '',
      role: updates.role !== undefined ? updates.role : existing?.role || 'Employee',
      department: updates.department !== undefined ? updates.department : existing?.department || 'General',
      phone: updates.phone !== undefined ? updates.phone : existing?.phone || '',
      location: updates.location !== undefined ? updates.location : existing?.location || 'Headquarters',
      joinDate: updates.joinDate !== undefined ? updates.joinDate : existing?.joinDate || '',
      avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : existing?.avatarUrl,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.memoryCache.set(userId, updatedEmployee);

    if (this.db) {
      try {
        await this.db.execute(
          `UPDATE employees 
           SET name = ?, employee_id = ?, role = ?, department = ?, phone = ?, location = ?, join_date = ?, avatar_url = ?, updated_at = ?
           WHERE id = ?;`,
          [
            updatedEmployee.name,
            updatedEmployee.employeeId,
            updatedEmployee.role,
            updatedEmployee.department,
            updatedEmployee.phone || '',
            updatedEmployee.location || 'Headquarters',
            updatedEmployee.joinDate || '',
            updatedEmployee.avatarUrl || null,
            now,
            userId,
          ]
        );
      } catch (error) {
        console.error('Failed to update employee in SQLite:', error);
      }
    }

    return updatedEmployee;
  }

  /**
   * List all employees in the database
   */
  public async getAllEmployees(): Promise<Employee[]> {
    await this.initEmployeeTable();

    if (!this.db) {
      return Array.from(this.memoryCache.values());
    }

    try {
      const result = await this.db.execute(`SELECT * FROM employees ORDER BY name ASC;`);
      if (result.rows && result.rows.length > 0) {
        return (result.rows as Record<string, any>[]).map((row) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          name: String(row.name),
          email: String(row.email),
          role: String(row.role || 'Employee'),
          department: String(row.department || 'General'),
          phone: row.phone ? String(row.phone) : '',
          location: row.location ? String(row.location) : 'Headquarters',
          joinDate: row.join_date ? String(row.join_date) : '',
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
          createdAt: Number(row.created_at || Date.now()),
          updatedAt: Number(row.updated_at || Date.now()),
        }));
      }
      return Array.from(this.memoryCache.values());
    } catch (error) {
      console.error('Failed to get all employees from SQLite:', error);
      return Array.from(this.memoryCache.values());
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
