import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { updateMe, deleteMe } from '../services/api';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        organization: user.organization || '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Build payload, only send password if it's not empty
      const payload: any = {
        name: formData.name,
        organization: formData.organization,
      };
      
      if (formData.password.trim()) {
        if (!formData.currentPassword.trim()) {
          setErrorMsg('Current password is required to change password.');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('New passwords do not match.');
          setLoading(false);
          return;
        }
        payload.password = formData.password;
        payload.current_password = formData.currentPassword;
      }

      const res = await updateMe(payload);
      
      // Update global context so Sidebar instantly reflects changes
      setUser(res.data);
      
      setSuccessMsg('Profile updated successfully!');
      setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' })); 
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you entirely sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteMe();
        logout();
        navigate('/');
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to delete account.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#7c3aed]/20 via-[#0a0a1a] to-[#0a0a1a] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-8 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Account Settings
            </h1>
            <p className="text-gray-400 mt-2">Update your personal and organizational information.</p>
          </div>

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">{successMsg}</p>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
            >
              <p className="font-medium">{errorMsg}</p>
            </motion.div>
          )}

          <motion.form 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#13132b] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-[#7c3aed]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="email" 
                      name="email"
                      disabled
                      value={formData.email}
                      className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-gray-500 cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Organization (Optional)</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-white"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 ml-1">Change Password</label>
                  <p className="text-xs text-gray-500 ml-1 mb-4">Leave blank if you don't want to change your password.</p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-white"
                        placeholder="Current Password"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-white"
                          placeholder="New Password"
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/50 transition-all text-white"
                          placeholder="Confirm New Password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-3.5 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.form>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-8 pb-10">
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                <p className="text-gray-400 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="whitespace-nowrap px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all font-semibold shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
