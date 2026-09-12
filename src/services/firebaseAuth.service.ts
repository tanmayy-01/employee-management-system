import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  updateProfile,
  getIdTokenResult,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User as FirebaseUser,
  Auth,
} from '@react-native-firebase/auth';
import { databaseService } from './database.service';
import { employeeService } from './employee.service';
import { AuthSession, SignUpPayload, User } from '../types';

// Session expiration settings
const SESSION_INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours for non-remember-me sessions
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before actual expiry

export interface SessionStatus {
  isValid: boolean;
  needsRefresh: boolean;
  reason?: 'EXPIRED' | 'INACTIVE' | 'REVOKED' | 'NO_SESSION';
}

class FirebaseAuthService {
  private getAuthInstance(): Auth | null {
    try {
      return getAuth();
    } catch {
      return null;
    }
  }

  /**
   * Get currently authenticated Firebase user
   */
  public getCurrentUser(): FirebaseUser | null {
    try {
      const auth = this.getAuthInstance();
      return auth ? auth.currentUser : null;
    } catch {
      return null;
    }
  }

  /**
   * Translate Firebase auth error codes to clear user-friendly messages
   */
  public getFriendlyErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred.';
    const code = error.code || '';
    const rawMsg = String(error.message || '');

    if (code === 'auth/user-not-found' || rawMsg.includes('user-not-found')) {
      return 'No account found with this email. Please sign up first.';
    }

    if (code === 'auth/wrong-password' || rawMsg.includes('wrong-password')) {
      return 'Incorrect password. Please try again.';
    }

    if (code === 'auth/requires-recent-login' || rawMsg.includes('requires-recent-login')) {
      return 'For security reasons, please log out and sign in again before updating your password.';
    }

    if (code === 'auth/invalid-credential' || rawMsg.includes('invalid-credential')) {
      return 'Invalid credentials. If you do not have an account yet, please sign up.';
    }

    if (code === 'auth/invalid-email' || rawMsg.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }

    if (code === 'auth/email-already-in-use' || rawMsg.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    if (code === 'auth/user-disabled' || rawMsg.includes('user-disabled')) {
      return 'This account has been disabled. Please contact your administrator.';
    }

    if (code === 'auth/weak-password' || rawMsg.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }

    if (code === 'auth/too-many-requests' || rawMsg.includes('too-many-requests')) {
      return 'Too many unsuccessful attempts. Please try again in a few moments.';
    }

    if (code === 'auth/network-request-failed' || rawMsg.includes('network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }

    return error.message || 'Authentication failed. Please verify your credentials.';
  }

  /**
   * Sign In with Email & Password, retrieve ID Token and persist to SQLite
   */
  public async signIn(
    email: string,
    pass: string,
    rememberMe = false
  ): Promise<{ user: User; session: AuthSession }> {
    const auth = this.getAuthInstance();
    if (!auth) {
      throw new Error('Firebase Auth is not available on this device.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = userCredential.user;

      if (!fbUser) {
        throw new Error('No user returned from authentication.');
      }

      let idToken = '';
      let expiresAt = Date.now() + 3600 * 1000;
      let issuedAt = Date.now();

      try {
        const tokenResult = await getIdTokenResult(fbUser);
        idToken = tokenResult.token;
        if (tokenResult.expirationTime) {
          expiresAt = new Date(tokenResult.expirationTime).getTime();
        }
        if (tokenResult.issuedAtTime) {
          issuedAt = new Date(tokenResult.issuedAtTime).getTime();
        }
      } catch (tokenErr) {
        console.warn('getIdTokenResult notice during signIn:', tokenErr);
        idToken = (await (fbUser as any).getIdToken?.()) || 'firebase_token_' + Date.now();
      }

      // Check for saved persistent record in employees table (and user_profiles fallback)
      const existingEmployee =
        (await employeeService.getEmployeeById(fbUser.uid)) ||
        (await employeeService.getEmployeeByEmail(fbUser.email || email));
      const existingProfile = existingEmployee || (await databaseService.getUserProfile(fbUser.uid));

      const defaultJoinDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const user: User = {
        id: fbUser.uid,
        name: fbUser.displayName || existingProfile?.name || email.split('@')[0] || 'Employee',
        email: fbUser.email || email,
        employeeId:
          existingProfile?.employeeId ||
          'EMP-' + fbUser.uid.substring(0, 4).toUpperCase(),
        role: existingProfile?.role || 'Employee',
        department: existingProfile?.department || 'General',
        avatarUrl: fbUser.photoURL || existingProfile?.avatarUrl || undefined,
        phone: existingProfile?.phone || '',
        location: existingProfile?.location || 'Headquarters',
        joinDate: existingProfile?.joinDate || defaultJoinDate,
      };

      // Ensure employee record exists in SQLite employees table
      if (!existingEmployee) {
        await employeeService.createEmployee({
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          location: user.location,
          joinDate: user.joinDate,
          avatarUrl: user.avatarUrl,
        });
      }

      await databaseService.saveUserProfile(user);

      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        idToken,
        issuedAt,
        expiresAt,
        lastActiveAt: Date.now(),
        rememberMe,
        isActive: true,
      };

      try {
        await databaseService.saveAuthSession(session);
      } catch (dbErr) {
        console.warn('saveAuthSession warning during signIn:', dbErr);
      }

      return { user, session };
    } catch (error: any) {
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Register new user with Firebase Auth and save employee record to SQLite employees table
   */
  public async signUp(
    payload: SignUpPayload
  ): Promise<{ user: User; session: AuthSession }> {
    const auth = this.getAuthInstance();
    if (!auth) {
      throw new Error('Firebase Auth is not available on this device.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email.trim(),
        payload.password
      );
      const fbUser = userCredential.user;

      if (!fbUser) {
        throw new Error('Account creation failed.');
      }

      // Non-blocking update of profile display name
      try {
        if (typeof (fbUser as any).updateProfile === 'function') {
          await (fbUser as any).updateProfile({
            displayName: payload.fullName,
          });
        } else {
          await updateProfile(fbUser, {
            displayName: payload.fullName,
          });
        }
      } catch (profileErr) {
        console.warn('Profile displayName update notice (non-fatal):', profileErr);
      }

      let idToken = '';
      let expiresAt = Date.now() + 3600 * 1000;
      let issuedAt = Date.now();

      try {
        const tokenResult = await getIdTokenResult(fbUser);
        idToken = tokenResult.token;
        if (tokenResult.expirationTime) {
          expiresAt = new Date(tokenResult.expirationTime).getTime();
        }
        if (tokenResult.issuedAtTime) {
          issuedAt = new Date(tokenResult.issuedAtTime).getTime();
        }
      } catch (tokenErr) {
        console.warn('getIdTokenResult notice during signUp:', tokenErr);
        idToken = (await (fbUser as any).getIdToken?.()) || 'firebase_token_' + Date.now();
      }

      const joinDateStr = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const user: User = {
        id: fbUser.uid,
        name: payload.fullName || fbUser.displayName || 'Employee',
        email: payload.email,
        employeeId: payload.employeeId || 'EMP-' + fbUser.uid.substring(0, 4).toUpperCase(),
        role: payload.role || 'Employee',
        department: payload.department || 'General',
        avatarUrl: fbUser.photoURL || undefined,
        phone: payload.phone || '',
        location: payload.location || 'Headquarters',
        joinDate: joinDateStr,
      };

      // 1. Create and persist record in employees table
      await employeeService.createEmployee({
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        avatarUrl: user.avatarUrl,
      });

      // 2. Save user profile to persistent SQLite storage
      await databaseService.saveUserProfile(user);

      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        idToken,
        issuedAt,
        expiresAt,
        lastActiveAt: Date.now(),
        rememberMe: true,
        isActive: true,
      };

      try {
        await databaseService.saveAuthSession(session);
      } catch (dbErr) {
        console.warn('saveAuthSession warning during signUp:', dbErr);
      }

      return { user, session };
    } catch (error: any) {
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Send Password Reset Email via Firebase
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const auth = this.getAuthInstance();
    if (!auth) {
      throw new Error('Firebase Auth is not available on this device.');
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Change password for the currently logged-in user
   * Re-authenticates with the current password first, then updates the password and refreshes token.
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const auth = this.getAuthInstance();
    if (!auth) {
      throw new Error('Firebase Auth is not available on this device.');
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      throw new Error('No authenticated user found. Please log in again.');
    }

    try {
      // 1. Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      if (typeof (currentUser as any).reauthenticateWithCredential === 'function') {
        await (currentUser as any).reauthenticateWithCredential(credential);
      } else {
        await reauthenticateWithCredential(currentUser, credential);
      }

      // 2. Update password
      if (typeof (currentUser as any).updatePassword === 'function') {
        await (currentUser as any).updatePassword(newPassword);
      } else {
        await updatePassword(currentUser, newPassword);
      }

      // 3. Refresh session token
      await this.refreshSessionToken(currentUser.uid);
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect. Please verify and try again.');
      }
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Retrieve profile for current or specified user from SQLite employees table and Firebase
   */
  public async getUserProfile(userId?: string): Promise<User | null> {
    const currentUser = this.getCurrentUser();
    const targetUid = userId || currentUser?.uid;
    if (!targetUid) return null;

    const dbEmployee =
      (await employeeService.getEmployeeById(targetUid)) ||
      (await databaseService.getUserProfile(targetUid));

    if (dbEmployee) {
      if (currentUser && currentUser.uid === targetUid) {
        if (currentUser.displayName && currentUser.displayName !== dbEmployee.name) {
          dbEmployee.name = currentUser.displayName;
        }
        if (currentUser.photoURL && currentUser.photoURL !== dbEmployee.avatarUrl) {
          dbEmployee.avatarUrl = currentUser.photoURL;
        }
      }
      return dbEmployee;
    }

    if (currentUser && currentUser.uid === targetUid) {
      const user: User = {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Employee',
        email: currentUser.email || '',
        employeeId: 'EMP-' + currentUser.uid.substring(0, 4).toUpperCase(),
        role: 'Employee',
        department: 'General',
        avatarUrl: currentUser.photoURL || undefined,
        phone: '',
        location: 'Headquarters',
        joinDate: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      await employeeService.createEmployee({
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        location: user.location,
        joinDate: user.joinDate,
        avatarUrl: user.avatarUrl,
      });
      await databaseService.saveUserProfile(user);
      return user;
    }

    return null;
  }

  /**
   * Update profile data for the current authenticated user
   */
  public async updateUserProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user session found.');
    }

    try {
      // If name or avatar changed, sync with Firebase Auth profile
      if (updates.name !== undefined || updates.avatarUrl !== undefined) {
        const profileUpdatePayload: { displayName?: string; photoURL?: string } = {};
        if (updates.name !== undefined) {
          profileUpdatePayload.displayName = updates.name.trim();
        }
        if (updates.avatarUrl !== undefined) {
          profileUpdatePayload.photoURL = updates.avatarUrl;
        }

        try {
          if (typeof (currentUser as any).updateProfile === 'function') {
            await (currentUser as any).updateProfile(profileUpdatePayload);
          } else {
            await updateProfile(currentUser, profileUpdatePayload);
          }
        } catch (profileErr) {
          console.warn('Firebase updateProfile notice:', profileErr);
        }
      }

      // Update SQLite persistent employees table and session
      await employeeService.updateEmployee(currentUser.uid, updates);
      const updatedUser = await databaseService.updateUserProfile(currentUser.uid, updates);
      return updatedUser;
    } catch (error: any) {
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Refresh the ID token and update SQLite storage
   */
  public async refreshSessionToken(userId?: string): Promise<string | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return null;
      }

      // Force token refresh from Firebase servers
      const tokenResult = await getIdTokenResult(currentUser, true);
      const expiresAt = tokenResult.expirationTime
        ? new Date(tokenResult.expirationTime).getTime()
        : Date.now() + 3600 * 1000;

      const targetUserId = userId || currentUser.uid;
      await databaseService.updateSessionToken(targetUserId, tokenResult.token, expiresAt);

      return tokenResult.token;
    } catch (error) {
      console.warn('Failed to refresh Firebase ID token:', error);
      return null;
    }
  }

  /**
   * Check if a session has expired or requires a token refresh
   */
  public checkSessionExpiry(session: AuthSession | null): SessionStatus {
    if (!session || !session.isActive) {
      return { isValid: false, needsRefresh: false, reason: 'NO_SESSION' };
    }

    const now = Date.now();

    // Check inactivity limit for non-remember-me sessions
    if (!session.rememberMe && now - session.lastActiveAt > SESSION_INACTIVITY_LIMIT_MS) {
      return { isValid: false, needsRefresh: false, reason: 'INACTIVE' };
    }

    // Check token expiration buffer
    const isTokenExpiringSoon = session.expiresAt - now < TOKEN_REFRESH_BUFFER_MS;
    const isTokenExpired = now >= session.expiresAt;

    if (isTokenExpired) {
      return { isValid: false, needsRefresh: true, reason: 'EXPIRED' };
    }

    return {
      isValid: true,
      needsRefresh: isTokenExpiringSoon,
    };
  }

  /**
   * Sign out from Firebase and clear SQLite session
   */
  public async signOut(): Promise<void> {
    const auth = this.getAuthInstance();
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.warn('Firebase signOut notice:', error);
    } finally {
      await databaseService.clearActiveAuthSession();
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
