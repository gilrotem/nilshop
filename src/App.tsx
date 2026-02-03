import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCouponCreate from './pages/admin/AdminCouponCreate';
import AdminSettings from './pages/admin/AdminSettings';

// Layout
import AdminLayout from './components/admin/AdminLayout';
import AuthGuard from './components/admin/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        richColors 
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: 'Heebo, sans-serif',
          },
        }}
      />
      
      <Routes>
        {/* Public Admin Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id" element={<AdminProductEdit />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="coupons/new" element={<AdminCouponCreate />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
