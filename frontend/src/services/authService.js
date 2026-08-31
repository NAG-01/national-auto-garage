import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword as fbUpdatePassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

export const AuthService = {
  async login(identifier, password) {
    const rawId = (identifier || '').trim().toLowerCase();
    const rawPassword = (password || '').trim();

    if (!rawId || !rawPassword) {
      throw new Error('Please enter both username and password.');
    }

    // 1. Check custom configured admin credentials from Firestore settings
    let customAdminConfigured = false;
    let savedAdminUser = 'admin';
    let savedAdminPass = 'admin123';

    try {
      const adminCredsDoc = await getDoc(doc(db, 'settings', 'admin_credentials'));
      if (adminCredsDoc.exists()) {
        const customData = adminCredsDoc.data();
        customAdminConfigured = true;
        if (customData.username) {
          savedAdminUser = customData.username.toLowerCase().trim();
        }
        if (customData.password) {
          savedAdminPass = customData.password.trim();
        }

        // Check if entered username/email matches the configured admin username
        const matchesUser =
          rawId === savedAdminUser ||
          rawId === `${savedAdminUser}@nationalautogarage.com` ||
          (savedAdminUser === 'admin' && (rawId === 'admin@nag.com' || rawId === 'admin@nationalautogarage.com'));

        if (matchesUser) {
          if (rawPassword === savedAdminPass) {
            const profile = {
              id: 'nag_admin_master',
              username: customData.username || 'admin',
              email: customData.email || `${savedAdminUser}@nationalautogarage.com`,
              role: 'ADMIN',
            };
            localStorage.setItem('nag_user', JSON.stringify(profile));
            localStorage.setItem('nag_token', 'nag_auth_token_' + profile.username);
            return profile;
          } else {
            // Correct username, but wrong password -> strictly block
            throw new Error('Incorrect password. Please enter your valid admin password.');
          }
        }
      }
    } catch (e) {
      if (e.message && e.message.includes('Incorrect password')) {
        throw e;
      }
    }

    // 2. Direct Firebase Cloud Authentication attempt (for registered Firebase Auth users)
    let email = rawId;
    if (!email.includes('@')) {
      email = `${email}@nationalautogarage.com`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, rawPassword);
      const user = userCredential.user;

      const userProfile = {
        id: user.uid,
        username: rawId.includes('@') ? rawId.split('@')[0] : rawId,
        email: user.email,
        role: 'ADMIN',
      };

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...userProfile,
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (dbErr) {}

      localStorage.setItem('nag_user', JSON.stringify(userProfile));
      localStorage.setItem('nag_token', 'nag_auth_token_' + user.uid);
      return userProfile;
    } catch (error) {
      // 3. Fresh installation default check ONLY if admin credentials were NEVER configured
      if (
        !customAdminConfigured &&
        (rawId === 'admin' ||
          rawId === 'admin@nag.com' ||
          rawId === 'admin@nationalautogarage.com') &&
        rawPassword === 'admin123'
      ) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            const newUserCred = await createUserWithEmailAndPassword(auth, email, 'admin123');
            const user = newUserCred.user;
            const profile = {
              id: user.uid,
              username: 'admin',
              email: user.email,
              role: 'ADMIN',
            };
            await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
            localStorage.setItem('nag_user', JSON.stringify(profile));
            localStorage.setItem('nag_token', 'nag_auth_token_' + user.uid);
            return profile;
          } catch (createErr) {}
        }

        const localAdminProfile = {
          id: 'nag_admin_master',
          username: 'admin',
          email: 'admin@nationalautogarage.com',
          role: 'ADMIN',
        };
        localStorage.setItem('nag_user', JSON.stringify(localAdminProfile));
        localStorage.setItem('nag_token', 'nag_auth_token_admin');
        return localAdminProfile;
      }

      // Strictly deny access on any credential mismatch
      const message =
        error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
          ? 'Incorrect username or password. Please try again.'
          : error.code === 'auth/user-not-found'
          ? 'Admin account not found with this username.'
          : error.message || 'Login failed. Invalid credentials.';
      throw new Error(message);
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (e) {}
    localStorage.removeItem('nag_token');
    localStorage.removeItem('nag_user');
  },

  async verifyPassword(currentPassword) {
    let customPass = null;
    try {
      const adminCredsDoc = await getDoc(doc(db, 'settings', 'admin_credentials'));
      if (adminCredsDoc.exists() && adminCredsDoc.data().password) {
        customPass = adminCredsDoc.data().password;
      }
    } catch (e) {}

    if (customPass) {
      if (currentPassword === customPass) return true;
      throw new Error('Current password is incorrect.');
    }

    if (currentPassword === 'admin123') return true;

    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      try {
        await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);
        return true;
      } catch (e) {}
    }

    throw new Error('Current password is incorrect.');
  },

  async updateCredentials({ newUsername, currentPassword, newPassword }) {
    // 1. Verify current password
    if (currentPassword) {
      await this.verifyPassword(currentPassword);
    }

    const cleanUsername = (newUsername || 'admin').trim();
    const cleanPassword = (newPassword || '').trim();

    if (cleanPassword && cleanPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    // 2. Update in Firebase Auth if user session is active
    const currentUser = auth.currentUser;
    if (currentUser && cleanPassword) {
      try {
        await fbUpdatePassword(currentUser, cleanPassword);
      } catch (e) {
        console.warn('Firebase updatePassword note:', e);
      }
    }

    // 3. Update Firestore settings/admin_credentials
    const adminDocData = {
      username: cleanUsername,
      updatedAt: new Date().toISOString(),
    };
    if (cleanPassword) {
      adminDocData.password = cleanPassword;
    }

    await setDoc(doc(db, 'settings', 'admin_credentials'), adminDocData, { merge: true });

    // 4. Update current profile in localStorage
    const savedUser = this.getCurrentUser() || {};
    const updatedProfile = {
      ...savedUser,
      username: cleanUsername,
      role: 'ADMIN',
    };
    localStorage.setItem('nag_user', JSON.stringify(updatedProfile));

    return {
      success: true,
      user: updatedProfile,
      message: 'Admin username and password updated successfully!',
    };
  },

  async updatePassword(newPassword) {
    return this.updateCredentials({ newPassword });
  },

  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        id: user.uid,
        username: user.email ? user.email.split('@')[0] : 'admin',
        email: user.email,
        role: 'ADMIN',
      };
    }
    try {
      const saved = localStorage.getItem('nag_user');
      const token = localStorage.getItem('nag_token');
      if (saved && token && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.username)) return parsed;
      }
    } catch (e) {}
    return null;
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        let profile = {
          id: user.uid,
          username: user.email ? user.email.split('@')[0] : 'admin',
          email: user.email,
          role: 'ADMIN',
        };
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            profile = { ...profile, ...userDoc.data() };
          }
        } catch (e) {}
        callback(profile);
      } else {
        const saved = localStorage.getItem('nag_user');
        const token = localStorage.getItem('nag_token');
        if (saved && token && saved !== 'null' && saved !== 'undefined') {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.id || parsed.username)) {
              callback(parsed);
              return;
            }
          } catch (e) {}
        }
        callback(null);
      }
    });
  },
};
