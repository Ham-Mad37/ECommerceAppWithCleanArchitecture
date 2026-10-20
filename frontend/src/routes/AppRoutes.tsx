import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PageBoundary from "../components/common/PageBoundary";

const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ProductsPage = lazy(() => import("../pages/products/ProductsPage"));
const ProductDetailsPage = lazy(() => import("../pages/products/ProductDetailsPage"));
const CartPage = lazy(() => import("../pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("../pages/checkout/CheckoutPage"));
const OrdersPage = lazy(() => import("../pages/orders/OrdersPage"));
const OrderDetailsPage = lazy(() => import("../pages/orders/OrderDetailsPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const AddressesPage = lazy(() => import("../pages/addresses/AddressesPage"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminInventory = lazy(() => import("../pages/admin/AdminInventory"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminCustomers = lazy(() => import("../pages/admin/AdminCustomers"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <PageBoundary>
      <Routes>
        {/* Public store */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Signed-in customers */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </PageBoundary>
    </BrowserRouter>
  );
}
