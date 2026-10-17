import {
  Link,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingCart,
  User,
  LogOut,
  Package,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}

          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            E-Commerce
          </Link>

          {/* Navigation */}

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Products
            </Link>
          </nav>

          {/* Right side */}

          <div className="flex items-center gap-3">

            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ShoppingCart size={21} />
                </Link>

                <Link
                  to="/orders"
                  className="hidden rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
                  title="Orders"
                >
                  <Package size={21} />
                </Link>

                <Link
                  to="/profile"
                  className="hidden rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
                  title="Profile"
                >
                  <User size={21} />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 lg:block"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} E-Commerce. All rights reserved.
        </div>
      </footer>
    </div>
  );
}