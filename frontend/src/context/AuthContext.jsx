import React, { createContext, useContext, useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import api from '../api/client.js';
import { AuthService } from '../services/authService.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nag_user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = AuthService.onAuthStateChanged((fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        localStorage.setItem('nag_user', JSON.stringify(fbUser));
        localStorage.setItem('nag_token', 'fb_token_' + fbUser.id);
      } else {
        const saved = localStorage.getItem('nag_user');
        if (saved && saved !== 'null' && saved !== 'undefined') {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      username: identifier,
      email: identifier,
      password,
    });

    const userData = res.user || res.data?.user || res;
    if (userData && (userData.id || userData.username)) {
      localStorage.setItem('nag_token', 'fb_token_' + (userData.id || 'admin'));
      localStorage.setItem('nag_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    throw new Error('Invalid authentication response.');
  };

  /**
   * Request Logout opens the confirmation modal
   */
  const requestLogout = () => {
    setShowLogoutModal(true);
  };

  /**
   * Confirms & executes logout
   */
  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await AuthService.logout();
    localStorage.removeItem('nag_token');
    localStorage.removeItem('nag_user');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('nag_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout: requestLogout,
        confirmLogout,
        updateUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}

      {/* Global Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Logout"
          size="sm"
        >
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="p-3 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Are you sure you want to log out?
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Aapka active admin session close ho jayega aur login page par redirect kar diya jayega.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmLogout}
                className="px-6 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/20"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Confirm Logout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
