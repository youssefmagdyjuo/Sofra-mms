import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, LayoutDashboard, UtensilsCrossed, Tags, Menu, ChevronLeft, ChevronRight, Globe, X, Eye, Users, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };
  const token = localStorage.getItem('adminToken');

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const navItems = [
    { label: t('AdminDashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('Categories'), path: '/admin/categories', icon: Tags },
    { label: t('Products'), path: '/admin/products', icon: UtensilsCrossed },
    { label: t('ViewMenu'), path: '/admin/view-menu', icon: Eye },
    ...(user.role === 'super_admin' ? [{ label: t('UserManagement'), path: '/admin/users', icon: Users }] : []),
    { label: t('ChangePassword'), path: '/admin/change-password', icon: KeyRound },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1, display: 'flex' },
    closed: { x: i18n.language === 'ar' ? '100%' : '-100%', opacity: 0, transitionEnd: { display: 'none' } }
  };

  return (
    <div className="h-screen flex bg-[#F8FAFC] transition-colors duration-300 overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">Sofra<span className="text-blue-500">Admin</span></span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-500 transition-all border border-slate-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} 
          z-50 flex flex-col bg-white border-r border-slate-200/60 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)] transition-all duration-500
          ${isMobileMenuOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
          ${isSidebarOpen ? 'w-72' : 'w-24'}
          ${!isMobileMenuOpen && 'lg:flex lg:h-full flex-shrink-0'}
        `}
      >
        <div className="p-8 flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2 group transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">Sofra<span className="text-blue-500">Admin</span></span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-500 transition-all border border-transparent hover:border-slate-100"
          >
            {isSidebarOpen ? (
              <ChevronLeft className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          
          {/* Close button for mobile inside sidebar */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Info Card in Sidebar */}
        <div className={`px-6 py-4 border-b border-slate-100/80 mb-4 transition-all duration-300 flex items-center gap-3 overflow-hidden ${isSidebarOpen || isMobileMenuOpen ? 'opacity-100' : 'lg:justify-center'}`}>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner shrink-0 group relative cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-300">
            {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          {(isSidebarOpen || isMobileMenuOpen) && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-extrabold text-slate-800 text-sm truncate">{user.username || 'Admin User'}</span>
              <span className={`inline-flex items-center w-max px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${user.role === 'super_admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                {user.role === 'super_admin' ? t('SuperAdmin') : t('Admin')}
              </span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  title={!isSidebarOpen ? item.label : ''}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                      ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/30'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarOpen || isMobileMenuOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
                    }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} w-1.5 h-1.5 bg-white rounded-full`}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleLanguageToggle}
            className={`flex items-center gap-3 px-4 py-3.5 w-full text-left rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 group ${(!isSidebarOpen && !isMobileMenuOpen) && 'justify-center'}`}
            title={(!isSidebarOpen && !isMobileMenuOpen) ? t('Language') : ''}
          >
            <Globe className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            <span className={`font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarOpen || isMobileMenuOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
              }`}>
              {t('Language')}
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3.5 w-full text-left rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 group ${(!isSidebarOpen && !isMobileMenuOpen) && 'justify-center'}`}
            title={(!isSidebarOpen && !isMobileMenuOpen) ? t('Logout') : ''}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            <span className={`font-bold text-sm tracking-wide transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarOpen || isMobileMenuOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
              }`}>
              {t('Logout')}
            </span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-16 lg:pt-0">
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto bg-[#fafbfc]">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

