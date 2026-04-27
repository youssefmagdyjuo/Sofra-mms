import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Loader2, ArrowLeft, Layout } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TestMenuUI() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'guest';
  const lang = searchParams.get('lang') || 'en';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catsRes.data.filter(c => c.isAvailable));
        setProducts(prodsRes.data.filter(p => p.isAvailable));
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load menu data', err);
        setErrorMsg(err.message || 'Failed to fetch menu data');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedProducts = useMemo(() => {
    const groups = {};
    categories.forEach(c => {
      groups[c.id] = { ...c, items: [] };
    });
    products.forEach(p => {
      if (groups[p.category_id]) {
        groups[p.category_id].items.push(p);
      }
    });
    return Object.values(groups).filter(g => g.items.length > 0);
  }, [categories, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading UI Preview...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-red-400 text-sm bg-red-50 p-2 rounded mb-6 font-mono">{errorMsg}</p>
          <Button onClick={() => navigate(-1)} variant="primary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-12 px-4 flex flex-col items-center">
      {/* Control Panel */}
      <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200 border-white/50 max-w-4xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            <span className="font-black text-slate-900 tracking-tight">PREVIEW PANEL</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-200"></div>

          {/* Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => navigate(`?type=guest&lang=${lang}`)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${type === 'guest' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Guest
            </button>
            <button
              onClick={() => navigate(`?type=staff&lang=${lang}`)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${type === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Staff
            </button>
          </div>

          {/* Lang Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => navigate(`?type=${type}&lang=en`)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              English
            </button>
            <button
              onClick={() => navigate(`?type=${type}&lang=ar`)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              العربية
            </button>
          </div>
        </div>

        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
      </div>

      <div className="mt-20"></div>

      {/* PDF Content Container - Exactly A4 size */}
      <div className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden mb-12">
        <div
          id="pdf-content"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{
            width: '210mm',
            minHeight: '297mm',
            background: '#ffffff',
            margin: '0',
            padding: '0',
            overflow: 'hidden',
            fontFamily: lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif",
            color: '#1e293b'
          }}
        >
          {/* Header */}
          <header style={{
            position: 'relative',
            paddingTop: '60px',
            paddingBottom: '40px',
            paddingLeft: '60px',
            paddingRight: '60px',
            borderBottom: '12px solid #5AC6D8',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Centered Logo */}
              <div style={{ marginBottom: '24px' }}>
                <img src="/auhLogo.png" alt="AUH Logo" style={{ height: '80px', width: 'auto' }} />
              </div>

              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#5AC6D8',
                marginBottom: '4px',
                letterSpacing: 'normal',
                wordSpacing: 'normal'
              }}>
                Alexandria AUH Hospital
              </h1>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#70B62E',
                marginBottom: '20px',
                letterSpacing: 'normal',
                wordSpacing: 'normal'
              }}>
                مستشفى الأسكندرية
              </h2>

              <div style={{
                display: 'inline-block',
                padding: '6px 24px',
                background: '#f8fafc',
                borderRadius: '50px',
                border: '1px solid #f1f5f9',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: 'normal',
                wordSpacing: 'normal'
              }}>
                {type === 'staff' ? (lang === 'ar' ? 'قائمة الموظفين' : 'Staff Menu') : (lang === 'ar' ? 'قائمة الضيوف' : 'Guest Menu')}
              </div>
            </div>
          </header>

          {/* Menu Sections */}
          <main style={{ paddingLeft: '60px', paddingRight: '60px', paddingBottom: '60px' }}>
            {groupedProducts.map(group => (
              <div key={group.id} style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ width: '10px', height: '24px', background: '#5AC6D8', borderRadius: '4px' }}></div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                    {group[`name_${lang}`]}
                  </h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '12px 15px', textAlign: 'inherit', color: '#64748b', fontSize: '11px', fontWeight: 'bold', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                        {lang === 'ar' ? 'اسم المنتج' : 'PRODUCT NAME'}
                      </th>
                      <th style={{ padding: '12px 15px', textAlign: 'inherit', color: '#64748b', fontSize: '11px', fontWeight: 'bold', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                        {lang === 'ar' ? 'الوصف' : 'DESCRIPTION'}
                      </th>
                      <th style={{ padding: '12px 15px', textAlign: 'right', color: '#64748b', fontSize: '11px', fontWeight: 'bold', width: '100px', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                        {lang === 'ar' ? 'السعر' : 'PRICE'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a', fontSize: '14px', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                          {item[`name_${lang}`]}
                        </td>
                        <td style={{ padding: '15px', color: '#64748b', fontSize: '13px', lineHeight: '1.5', letterSpacing: 'normal', wordSpacing: 'normal' }}>
                          {item[`description_${lang}`] || '—'}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <span style={{ fontWeight: '900', color: '#5AC6D8', fontSize: '14px' }}>
                            {type === 'staff' ? item.price_staff : item.price_guest} EGP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </main>

          {/* Footer */}
          <footer style={{ marginTop: 'auto', padding: '40px 60px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <div>{new Date().toLocaleDateString()}</div>
              <div>{lang === 'ar' ? 'مستشفى AUH الأسكندرية' : 'Alexandria AUH Hospital'}</div>
              <div>{lang === 'ar' ? 'استمتع بوجبتك' : 'Enjoy your meal'}</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
