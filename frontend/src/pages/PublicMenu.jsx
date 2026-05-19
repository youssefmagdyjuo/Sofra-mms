import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Search, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function PublicMenu({ type, hideNavbar = false }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { categories, products, fetchCategories, fetchProducts } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
      } catch (err) {
        console.error('Failed silently to refresh menu');
      }
    };
    loadMenuData();
  }, []);

  const lang = i18n.language; // 'en' or 'ar'

  const availableCategories = useMemo(() => {
    return categories.filter(c => c.isAvailable);
  }, [categories]);

  const availableProducts = useMemo(() => {
    return products.filter(p => p.isAvailable);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p => {
      const matchesSearch = p[`name_${lang}`].toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [availableProducts, search, activeCategory, lang]);

  const displayCategories = useMemo(() => {
    return availableCategories.filter(c => availableProducts.some(p => p.category_id === c.id));
  }, [availableCategories, availableProducts]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    availableCategories.forEach(c => {
      groups[c.id] = { ...c, items: [] };
    });
    filteredProducts.forEach(p => {
      if (groups[p.category_id]) {
        groups[p.category_id].items.push(p);
      }
    });
    return Object.values(groups).filter(g => g.items.length > 0);
  }, [availableCategories, filteredProducts]);

  const handleDownloadPDF = () => {
    navigate(`/menu-pdf?type=${type}&lang=${lang}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-2">
            <img src="/auhLogo.png" alt="AUH Logo" className="h-20 w-auto" />
          </div>
          <section className="flex flex-col items-center text-center gap-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <h1 className="text-4xl md:text-5xl font-black text-[#5AC6D8] tracking-tight">
              Alexandria AUH Hospital
            </h1>
            <h1 className="text-3xl md:text-4xl font-bold text-[#70B62E]">
              مستشفى الأسكندرية
            </h1>
          </section>

          <div className="w-full flex justify-center mt-6">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md h-12 px-8 rounded-xl font-bold group"
            >
              <Download className="w-5 h-5 group-hover:bounce-y" />
              {t('DownloadPDF')}
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('Search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Button
              variant={activeCategory === 'all' ? 'primary' : 'secondary'}
              onClick={() => setActiveCategory('all')}
              className="whitespace-nowrap"
            >
              {t('AllCategories')}
            </Button>
            {displayCategories.map(c => (
              <Button
                key={c.id}
                variant={activeCategory === c.id ? 'primary' : 'secondary'}
                onClick={() => setActiveCategory(c.id)}
                className="whitespace-nowrap"
              >
                {c[`name_${lang}`]}
              </Button>
            ))}
          </div>
        </div>

        {/* Web UI: Cards View */}
        <div className="space-y-12">
          {groupedProducts.map(group => (
            <section key={group.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b-2 border-blue-100 inline-block pr-8 pb-2">
                {group[`name_${lang}`]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-200 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700"></div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-500 transition-colors duration-300">
                        {item[`name_${lang}`]}
                      </h3>
                      <span className="text-lg font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                        {lang === 'ar' ? 'ج.م' : 'EGP'} {type === 'staff' ? item.price_staff : item.price_guest}
                      </span>
                    </div>
                    {item[`description_${lang}`] && (
                      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                        {item[`description_${lang}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {groupedProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">{t('NoItemsFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
