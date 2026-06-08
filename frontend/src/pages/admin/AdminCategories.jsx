import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Edit2, Trash2, Plus, Tags, X } from 'lucide-react';

export default function AdminCategories() {
  const { t } = useTranslation();
  const { categories, fetchCategories, invalidateCache } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name_en: '', name_ar: '', isAvailable: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCategories().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name_en: '', name_ar: '', isAvailable: true });
      invalidateCache();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name_en: cat.name_en, name_ar: cat.name_ar, isAvailable: cat.isAvailable });
    setEditingId(cat.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('ConfirmDelete'))) {
      try {
        await api.delete(`/categories/${id}`);
        invalidateCache();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">{t('Categories')}</h1>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ name_en: '', name_ar: '', isAvailable: true });
          setShowModal(true);
        }} className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/10">
          <Plus className="w-4 h-4" />
          {t('AddCategory')}
        </Button>
      </div>

      <Table className="min-w-[600px] sm:min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>{t('EnglishName')}</TableHead>
            <TableHead>{t('ArabicName')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('Status')}</TableHead>
            <TableHead className="w-[100px] sm:w-[150px] text-right">{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton cols={4} rows={5} />
          ) : (
            <>
              {categories.map((cat, index) => (
                <TableRow key={cat.id} index={index}>
                  <TableCell className="font-semibold text-slate-800">{cat.name_en}</TableCell>
                  <TableCell className="font-arabic">{cat.name_ar}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {cat.isAvailable ? t('Active') : t('Hidden')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleEdit(cat)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Tags className="w-8 h-8 text-slate-200" />
                      <p>{t('NoCategoriesFound')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl mt-auto sm:mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? t('EditCategory') : t('AddCategory')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors sm:hidden">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 pb-8 sm:pb-0">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('EnglishName')}</label>
                <input
                  type="text" required
                  value={formData.name_en}
                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('ArabicName')}</label>
                <input
                  type="text" required dir="rtl"
                  value={formData.name_ar}
                  onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-arabic"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 cursor-pointer hover:bg-blue-100/50 transition-colors group">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    className="sr-only peer"
                    checked={formData.isAvailable}
                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 group-hover:ring-4 group-hover:ring-blue-500/10"></div>
                </div>
                <span className="text-sm font-bold text-slate-700 select-none">{t('VisibleToPublic')}</span>
              </label>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <Button type="button" variant="ghost" className="w-full sm:w-auto order-2 sm:order-1" onClick={() => setShowModal(false)}>{t('Cancel')}</Button>
                <Button type="submit" className="w-full sm:w-auto shadow-lg shadow-blue-500/20 order-1 sm:order-2">{t('Save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
