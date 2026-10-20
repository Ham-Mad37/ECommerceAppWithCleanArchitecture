import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Warehouse,
  ArrowLeft,
} from "lucide-react";

import ThemeToggle from "../components/common/ThemeToggle";
import PageBoundary from "../components/common/PageBoundary";

const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Inventory",
    path: "/admin/inventory",
    icon: Warehouse,
  },
];

export default function AdminLayout() {
  const location =
    useLocation();

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block print:hidden">
          <div className="sticky top-0 flex h-screen flex-col">

            <div className="border-b border-slate-200 px-6 py-5">
              <Link
                to="/"
                className="text-xl font-bold text-slate-900"
              >
                E-Commerce
              </Link>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                Administration
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navigation.map(
                item => {
                  const Icon =
                    item.icon;

                  const active =
                    location.pathname ===
                      item.path ||
                    (
                      item.path !==
                        "/admin" &&
                      location.pathname.startsWith(
                        item.path
                      )
                    );

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={19} />

                      {item.name}
                    </Link>
                  );
                }
              )}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft size={19} />
                Back to Store
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white print:hidden">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Admin Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  to="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Store
                </Link>
              </div>
            </div>

            {/* below lg the sidebar is hidden, so show the sections as a scrollable strip */}
            <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 px-3 py-2 lg:hidden" aria-label="Admin sections">
              {navigation.map((item) => {
                const active =
                  location.pathname === item.path ||
                  (item.path !== "/admin" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${
                      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 print:p-0">
            <PageBoundary><Outlet /></PageBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}