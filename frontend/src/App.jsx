import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicMenu from './pages/PublicMenu';
import MenuPDF from './pages/MenuPDF';
import TestMenuUI from './pages/TestMenuUI';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminViewMenu from './pages/admin/AdminViewMenu';
import './i18n/config';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicMenu type="guest" />} />
        <Route path="/staff" element={<PublicMenu type="staff" />} />
        <Route path="/menu-pdf" element={<MenuPDF />} />
        <Route path="/test-menu-ui" element={<TestMenuUI />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="view-menu" element={<AdminViewMenu />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
