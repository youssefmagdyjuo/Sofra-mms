import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Trash2, Plus, Users, X, UserCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users/create', formData);
      setShowModal(false);
      setFormData({ username: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, role, email) => {
    // Safety check in frontend
    if (role === 'super_admin' || email === 'admin@mms.com' || id === currentUser.id) {
      alert('Cannot delete this user for safety reasons.');
      return;
    }

    if (window.confirm(t('ConfirmDeleteUser') || 'Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t('UserManagement')}</h1>
          <p className="text-slate-500 font-medium text-lg">Manage system users and access controls</p>
        </div>
        <Button 
          onClick={() => {
            setError('');
            setFormData({ username: '', email: '', password: '', role: 'admin' });
            setShowModal(true);
          }} 
          className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/10 rounded-2xl h-12"
        >
          <Plus className="w-5 h-5" />
          {t('CreateUser')}
        </Button>
      </motion.div>

      <Table className="min-w-[600px] sm:min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>{t('Username')}</TableHead>
            <TableHead>{t('Email')}</TableHead>
            <TableHead>{t('Role')}</TableHead>
            <TableHead className="w-[100px] sm:w-[150px] text-right">{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => {
            const isProtected = user.role === 'super_admin' || user.email === 'admin@mms.com' || user.id === currentUser.id;
            return (
              <TableRow key={user.id} index={index}>
                <TableCell className="font-semibold text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${user.role === 'super_admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">{user.email}</TableCell>
                <TableCell>
                  <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-200/50' : 'bg-slate-100 text-slate-700 border border-slate-200/50'}`}>
                    {user.role === 'super_admin' ? t('SuperAdmin') : t('Admin')}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {isProtected ? (
                      <span className="p-2 text-slate-300 cursor-not-allowed" title="Protected Account">
                        <UserCheck className="w-5 h-5 text-slate-300" />
                      </span>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 hover:bg-red-50 hover:text-red-600" 
                        onClick={() => handleDelete(user.id, user.role, user.email)}
                        title={t('DeleteUser')}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-slate-200" />
                  <p>No users found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{t('CreateUser')}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold border border-red-100/50">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Username')}</label>
                <input
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder={t('EnterUsername')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Email')}</label>
                <input
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder={t('EnterEmail')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Password')}</label>
                <input
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder={t('EnterPassword')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Role')}</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="admin">{t('Admin')}</option>
                  <option value="super_admin">{t('SuperAdmin')}</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full sm:w-auto order-2 sm:order-1 rounded-2xl" 
                  onClick={() => setShowModal(false)}
                >
                  {t('Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto shadow-lg shadow-blue-500/20 order-1 sm:order-2 rounded-2xl" 
                  isLoading={loading}
                >
                  {t('Save')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
