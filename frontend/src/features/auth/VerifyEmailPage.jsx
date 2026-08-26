import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react_router_dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import api from '../../api/client.js';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [updatedUser, setUpdatedUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setSuccess(false);
        setMessage('Invalid or missing verification token link.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email-token?token=${encodeURIComponent(token)}`);
        const payload = res.data || res;
        setSuccess(true);
        setMessage(payload.message || 'Email address successfully verified and updated!');
        if (payload.user) {
          setUpdatedUser(payload.user);
          localStorage.setItem('nag_user', JSON.stringify(payload.user));
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || 'Email verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0284C7] mx-auto" />
            <h2 className="text-lg font-black text-white">Verifying Your Email Address...</h2>
            <p className="text-xs text-slate-400 font-medium">
              Connecting to National Auto Garage Security Engine.
            </p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 font-black text-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Gmail Verification Successful! 🎉
              </h2>
              <p className="text-xs text-emerald-400 font-extrabold bg-emerald-950/60 p-3 rounded-2xl border border-emerald-900/60">
                {message}
              </p>
            </div>

            {updatedUser && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-1.5 text-xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Updated Active Admin Account:
                </span>
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0284C7]" />
                  <span>{updatedUser.email}</span>
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg shadow-sky-950/50 justify-center"
            >
              Continue to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 font-black text-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Verification Failed
              </h2>
              <p className="text-xs text-rose-400 font-medium bg-rose-950/60 p-3 rounded-2xl border border-rose-900/60">
                {message}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => navigate('/settings')}
              className="w-full py-3.5 text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 justify-center"
            >
              Back to System Settings
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
