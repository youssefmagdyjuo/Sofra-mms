import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Edit2, Trash2, Plus, Download, Upload, FileSpreadsheet, UtensilsCrossed, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminProducts() {
  const { t } = useTranslation();
  const { products, categories, fetchProducts, fetchCategories, invalidateCache } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Excel Import/Export state
  const [previewData, setPreviewData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  const initialFormState = {
    name_en: '', name_ar: '',
    description_en: '', description_ar: '',
    price_staff: '', price_guest: '',
    category_id: '', isAvailable: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      invalidateCache();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      name_en: prod.name_en, name_ar: prod.name_ar,
      description_en: prod.description_en || '', description_ar: prod.description_ar || '',
      price_staff: prod.price_staff, price_guest: prod.price_guest,
      category_id: prod.category_id, isAvailable: prod.isAvailable
    });
    setEditingId(prod.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('ConfirmDelete'))) {
      try {
        await api.delete(`/products/${id}`);
        invalidateCache();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "product_name_en,product_name_ar,description_en,description_ar,price_staff,price_guest,category_name_en,category_name_ar,isAvailable\nEspresso,اسبريسو,A strong black coffee,قهوة سوداء قوية,2.50,4.00,Drinks,مشروبات,TRUE";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MMS_Products_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreviewData(data.slice(0, 5)); // Preview up to 5 rows
    };
    reader.readAsBinaryString(file);
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;
    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Success! Inserted: ${res.data.insertedProducts}, Created Categories: ${res.data.createdCategories}`);
      setPreviewData(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      invalidateCache();
    } catch (err) {
      alert(err.response?.data?.message || 'Error importing file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      const res = await api.get(`/products/export?format=${format}`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data]);
      // If CSV, we add the UTF-8 BOM in the backend successfully, so just download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Temporary toast replacement
      alert('Export successfully downloaded!');
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">{t('Products')}</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          {/* Export Feature */}
          <div className="relative flex-1 sm:flex-none">
            <Button onClick={() => setShowExportMenu(!showExportMenu)} variant="outline" className="w-full sm:w-auto gap-2 border-slate-300" isLoading={isExporting}>
              <Download className="w-4 h-4" />
              <span className="sm:inline">{t('ExportData')}</span>
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">{t('ExportCSV')}</button>
                <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-t border-slate-50">{t('ExportExcel')}</button>
              </div>
            )}
          </div>

          <Button onClick={handleDownloadTemplate} variant="outline" className="flex-1 sm:flex-none gap-2">
            <Download className="w-4 h-4" />
            <span className="sm:inline">{t('Template')}</span>
          </Button>

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1 sm:flex-none gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0" isLoading={isImporting} disabled={isImporting || isExporting}>
            <FileSpreadsheet className="w-4 h-4" />
            <span className="sm:inline">{t('ImportExcel')}</span>
          </Button>

          <Button onClick={() => {
            setEditingId(null);
            setFormData({ ...initialFormState, category_id: categories[0]?.id || '' });
            setShowModal(true);
          }} className="flex-1 sm:flex-none gap-2" disabled={isImporting || isExporting}>
            <Plus className="w-4 h-4" />
            <span className="sm:inline">{t('AddProduct')}</span>
          </Button>
        </div>
      </div>

      <Table className="min-w-[800px] sm:min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>{t('Product')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('Category')}</TableHead>
            <TableHead>{t('StaffPrice')}</TableHead>
            <TableHead>{t('GuestPrice')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('Status')}</TableHead>
            <TableHead className="w-[100px] sm:w-[150px] text-right">{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((prod, index) => (
            <TableRow key={prod.id} index={index}>
              <TableCell>
                <div className="font-medium text-slate-800 line-clamp-1">{prod.name_en}</div>
                <div className="text-xs text-slate-500 line-clamp-1">{prod.name_ar}</div>
                <div className="md:hidden mt-1 text-[10px] text-blue-500 font-medium">{prod.category?.name_en}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{prod.category?.name_en || 'None'}</TableCell>
              <TableCell className="font-semibold text-slate-700">${prod.price_staff}</TableCell>
              <TableCell className="font-semibold text-blue-600">${prod.price_guest}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prod.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {prod.isAvailable ? t('Active') : t('Hidden')}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 sm:gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleEdit(prod)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => handleDelete(prod.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <UtensilsCrossed className="w-8 h-8 text-slate-200" />
                  <p>{t('NoProductsFound')}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl p-6 shadow-2xl min-h-[50vh] sm:min-h-0 mt-auto sm:mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? t('EditProduct') : t('AddProduct')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 pb-8 sm:pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('EnglishName')}</label>
                  <input type="text" required value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('ArabicName')}</label>
                  <input type="text" required dir="rtl" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-arabic" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (English)</label>
                  <textarea value={formData.description_en} onChange={e => setFormData({ ...formData, description_en: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" rows="2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Arabic)</label>
                  <textarea dir="rtl" value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-arabic" rows="2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('StaffPrice')} ( ج.م )</label>
                  <div className="relative">
                    <input type="number" step="0.01" required value={formData.price_staff} onChange={e => setFormData({ ...formData, price_staff: e.target.value })} className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">EGP</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('GuestPrice')} ( ج.م )</label>
                  <div className="relative">
                    <input type="number" step="0.01" required value={formData.price_guest} onChange={e => setFormData({ ...formData, price_guest: e.target.value })} className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">EGP</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Category')}</label>
                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name_en} / {c.name_ar}</option>
                  ))}
                </select>
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

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Preview Excel Data</h2>
            <p className="text-sm text-slate-500 mb-6">Showing the first up to 5 rows of your uploaded file.</p>

            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Name EN</th>
                      <th className="px-4 py-3 whitespace-nowrap">Name AR</th>
                      <th className="px-4 py-3 whitespace-nowrap">Category EN</th>
                      <th className="px-4 py-3 whitespace-nowrap">Staff Price</th>
                      <th className="px-4 py-3 whitespace-nowrap">Guest Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3">{row.product_name_en}</td>
                        <td className="px-4 py-3 font-arabic">{row.product_name_ar}</td>
                        <td className="px-4 py-3">{row.category_name_en}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.price_staff}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{row.price_guest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => {
                setPreviewData(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}>Cancel</Button>
              <Button onClick={handleImportConfirm} isLoading={isImporting} className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                <Upload className="w-4 h-4" /> Confirm Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
