import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isStaff = location.pathname.includes('/staff');

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={isStaff ? "/staff" : "/"} className="text-xl flex items-center font-bold text-blue-500 gap-2">
          Sofra <span className="text-sm font-medium text-gray-500 whitespace-nowrap bg-none">{isStaff ? t('StaffMenu') : t('GuestMenu')}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleLanguageToggle} className="flex gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-semibold">{t('Language')}</span>
          </Button>
          <Link to="/admin/login">
            <Button variant="outline" size="sm">{t('Login')}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
