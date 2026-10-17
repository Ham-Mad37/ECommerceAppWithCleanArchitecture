import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductsPage from "../pages/products/ProductsPage";
import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import OrderDetailsPage from "../pages/orders/OrderDetailsPage";

function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">
        Welcome to our store
      </h1>

      <p className="mt-4 text-slate-600">
        Your React e-commerce frontend is ready.
      </p>
    </div>
  );
}


function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        My Orders
      </h1>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Profile
      </h1>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        Dashboard
      </h2>
    </div>
  );
}

function AdminProducts() {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        Products
      </h2>
    </div>
  );
}

function AdminOrders() {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        Orders
      </h2>
    </div>
  );
}

function AdminCustomers() {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        Customers
      </h2>
    </div>
  );
}

function AdminCategories() {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        Categories
      </h2>
    </div>
  );
}

function AdminInventory() {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        Inventory
      </h2>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public + Store */}

        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />
          <Route
            path="/cart"
            element={<CartPage />}
          />
          {/* Customer protected routes */}

          <Route element={<ProtectedRoute />}>
            <Route
              path="/cart"
              element={<CartPage />}
            />

            <Route
              path="/orders"
              element={<OrdersPage />}
            />
            <Route
              path="/checkout"
              element={<CheckoutPage />}
            />
            
            <Route
              path="/profile"
              element={<ProfilePage />}
            />
          </Route>
        </Route>

        {/* Admin */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/products"
              element={<AdminProducts />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />
            <Route
              path="/orders/:orderId"
              element={<OrderDetailsPage />}
            />

            <Route
              path="/admin/customers"
              element={<AdminCustomers />}
            />

            <Route
              path="/admin/categories"
              element={<AdminCategories />}
            />

            <Route
              path="/admin/inventory"
              element={<AdminInventory />}
            />
          </Route>
        </Route>

        {/* Fallback */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}