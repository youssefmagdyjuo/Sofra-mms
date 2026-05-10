import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PublicMenu from '../PublicMenu';
import { Button } from '@/components/ui/Button';
import { Eye } from 'lucide-react';

export default function AdminViewMenu() {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState('guest');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-500" />
            {t('ViewMenu')}
          </h1>
          <p className="text-slate-500 mt-1">{t('StoreOverview')}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewType('guest')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              viewType === 'guest' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('GuestMenu')}
          </button>
          <button
            onClick={() => setViewType('staff')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              viewType === 'staff' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('StaffMenu')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
        <PublicMenu type={viewType} hideNavbar={true} />
      </div>
    </div>
  );
}
