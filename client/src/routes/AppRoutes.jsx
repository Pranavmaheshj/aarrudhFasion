import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import RootLayout from '../components/layout/RootLayout';
import AdminLayout from '../components/layout/AdminLayout';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Customer & Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ShopPage from '../pages/ShopPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import WishlistPage from '../pages/WishlistPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import OrderFailurePage from '../pages/OrderFailurePage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';

// Admin Modules
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import LandingEditor from '../pages/admin/LandingEditor';
import ProductManager from '../pages/admin/ProductManager';
import CollectionManager from '../pages/admin/CollectionManager';
import OrderManager from '../pages/admin/OrderManager';
import CustomerManager from '../pages/admin/CustomerManager';
import AuditLogViewer from '../pages/admin/AuditLogViewer';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & Customer Storefront Routes */}
      <Route path="/" element={<RootLayout />}>
        {/* Public Landing Page */}
        <Route index element={<LandingPage />} />

        {/* Public Auth Pages */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />

        {/* Customer Protected Shopping Routes */}
        <Route
          path="shop"
          element={
            <ProtectedRoute>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="product/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success/:orderNumber"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-failure/:orderNumber"
          element={
            <ProtectedRoute>
              <OrderFailurePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="landing" element={<LandingEditor />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="collections" element={<CollectionManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="customers" element={<CustomerManager />} />
        <Route path="audit" element={<AuditLogViewer />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
