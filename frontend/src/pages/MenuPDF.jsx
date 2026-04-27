import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import html2pdf from 'html2pdf.js';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function MenuPDF() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'guest';
  const lang = searchParams.get('lang') || 'en';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('loading'); // loading, generating, complete, error

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
        setStatus('generating');
      } catch (err) {
        console.error('Failed to load menu data', err);
        setErrorMsg(err.message || 'Failed to fetch menu data');
        setStatus('error');
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

  useEffect(() => {
    if (status === 'generating') {
      const timer = setTimeout(() => {
        generatePDF();
      }, 1500); // Wait for fonts and styles to settle
      return () => clearTimeout(timer);
    }
  }, [status]);

  const generatePDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Menu-${type === 'staff' ? 'Staff' : 'Guest'}-${lang.toUpperCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      setStatus('complete');
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMsg(err.message || 'Failed to generate PDF');
      setStatus('error');
    }
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 rotate-180" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('SomethingWentWrong')}</h2>
          <p className="text-slate-500 mb-2">{t('CouldNotGenerate')}</p>
          <p className="text-red-400 text-sm bg-red-50 p-2 rounded mb-6 font-mono break-words">{errorMsg}</p>
          <Button onClick={() => navigate(-1)} variant="primary" className="w-full">
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4 ml-2 rotate-180" /> : <ArrowLeft className="w-4 h-4 mr-2" />} {t('BackToMenu')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-0 px-0">
      {/* Overlay Loading/Status UI */}
      {!status || status !== 'complete' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in zoom-in duration-300">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              {status === 'loading' ? t('FetchingMenu') : t('GeneratingPDF')}
            </h2>
            <p className="text-slate-500 font-medium">{t('PleaseWait')}</p>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in scale-in duration-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">{t('ReadyForDownload')}</h2>
            <p className="text-slate-500 font-medium mb-8">{t('MenuGenerated')}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full font-bold">
                {t('DownloadAgain')}
              </Button>
              <Button onClick={() => navigate(-1)} variant="primary" className="w-full font-bold shadow-lg shadow-blue-500/20">
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4 ml-2 rotate-180" /> : <ArrowLeft className="w-4 h-4 mr-2" />} {t('BackToMenu')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Content Container - Exactly A4 size, no outer margins */}
      <div className="flex justify-center bg-white">
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
                fontFamily: "'Cairo', sans-serif",
                fontSize: '38px',
                fontWeight: '900',
                color: '#5AC6D8',
                marginBottom: '4px',
                letterSpacing: 'normal',
                wordSpacing: 'normal'
              }}>
                Alexandria AUH Hospital
              </h1>
              <h2 style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: '32px',
                fontWeight: '700',
                color: '#70B62E',
                marginBottom: '24px',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
                lineHeight: '1.2'
              }}>
                مستشفى الأسكندرية
              </h2>

              <div style={{
                display: 'inline-block',
                padding: '10px 32px',
                background: '#f8fafc',
                borderRadius: '50px',
                border: '1px solid #f1f5f9',
                fontSize: '16px',
                fontWeight: '900',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: lang === 'ar' ? 'normal' : '0.05em',
                wordSpacing: 'normal'
              }}>
                {type === 'staff' ? (lang === 'ar' ? 'قائمة الموظفين' : 'STAFF MENU') : (lang === 'ar' ? 'قائمة الضيوف' : 'GUEST MENU')}
              </div>
            </div>
          </header>

          {/* Menu Sections */}
          <main style={{ paddingLeft: '60px', paddingRight: '60px', paddingBottom: '60px' }}>
            {groupedProducts.map(group => (
              <div key={group.id} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
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
                            {type === 'staff' ? item.price_staff : item.price_guest} {lang === 'ar' ? 'ج.م' : 'EGP'}
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
              <div>{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div>
              <div>{lang === 'ar' ? 'مستشفى AUH الأسكندرية' : 'Alexandria AUH Hospital'}</div>
              <div>{lang === 'ar' ? 'استمتع بوجبتك' : 'Enjoy your meal'}</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
