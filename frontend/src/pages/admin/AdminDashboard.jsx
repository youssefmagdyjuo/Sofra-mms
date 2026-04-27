import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { Tags, UtensilsCrossed } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ categories: 0, products: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cats, prods] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setStats({
          categories: cats.data.length,
          products: prods.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t('AdminDashboard')}</h1>
        <p className="text-slate-500 font-medium text-lg">{t('StoreOverview')}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Magnetic>
          <div className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-slate-100 flex flex-col gap-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors duration-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:rotate-6">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">{t('TotalProducts')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-800 group-hover:text-blue-500 transition-colors duration-300">{stats.products}</p>
                <span className="text-blue-500 text-sm font-bold bg-blue-50 px-2.5 py-0.5 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">+12%</span>
              </div>
            </div>
          </div>
        </Magnetic>

        <Magnetic>
          <div className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-slate-100 flex flex-col gap-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors duration-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:-rotate-6">
              <Tags className="w-8 h-8" />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">{t('TotalCategories')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-800 group-hover:text-blue-500 transition-colors duration-300">{stats.categories}</p>
                <span className="text-slate-400 text-sm font-medium">{t('Standard')}</span>
              </div>
            </div>
          </div>
        </Magnetic>
      </div>
    </div>
  );
}
