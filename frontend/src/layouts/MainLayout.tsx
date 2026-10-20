import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Menu, Package, ShoppingCart, User, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ThemeToggle from "../components/common/ThemeToggle";
import PageBoundary from "../components/common/PageBoundary";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const iconBtn = "relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

export default function MainLayout() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // close the drawer whenever the route changes
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // lock page scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}`;
  const drawerLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button type="button" className={`${iconBtn} md:hidden`} onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">E-Commerce</Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={desktopLink}>{n.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            {isAuthenticated && !isAdmin && (
              <>
                <Link to="/cart" className={iconBtn} aria-label={`Cart, ${count} items`}>
                  <ShoppingCart size={21} />
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold text-white">{count}</span>
                  )}
                </Link>
                <Link to="/orders" className={`${iconBtn} hidden sm:block`} title="Orders" aria-label="Orders"><Package size={21} /></Link>
                <Link to="/profile" className={`${iconBtn} hidden sm:block`} title="Profile" aria-label="Profile"><User size={21} /></Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:block">Admin</Link>
            )}

            {isAuthenticated ? (
              <button onClick={handleLogout} className="rounded-lg p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600" title="Logout" aria-label="Logout">
                <LogOut size={20} />
              </button>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
                <Link to="/register" className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:block">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <div className="fade-in absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-lg font-bold text-slate-900">Menu</span>
              <button type="button" className={iconBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={21} /></button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={drawerLink}>{n.label}</NavLink>)}

              {isAuthenticated && !isAdmin && (
                <>
                  <div className="my-3 border-t border-slate-200" />
                  <NavLink to="/cart" className={drawerLink}><ShoppingCart size={19} /> Cart{count > 0 && <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{count}</span>}</NavLink>
                  <NavLink to="/orders" className={drawerLink}><Package size={19} /> My orders</NavLink>
                  <NavLink to="/addresses" className={drawerLink}><MapPin size={19} /> Addresses</NavLink>
                  <NavLink to="/profile" className={drawerLink}><User size={19} /> Profile</NavLink>
                </>
              )}
              {isAdmin && (
                <>
                  <div className="my-3 border-t border-slate-200" />
                  <NavLink to="/admin" className={drawerLink}>Admin dashboard</NavLink>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <div className="my-3 border-t border-slate-200" />
                  <NavLink to="/login" className={drawerLink}>Login</NavLink>
                  <NavLink to="/register" className={drawerLink}>Register</NavLink>
                </>
              )}
            </nav>
            {isAuthenticated && (
              <button onClick={handleLogout} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50">
                <LogOut size={19} /> Log out
              </button>
            )}
          </div>
        </div>
      )}

      <main id="main" tabIndex={-1} className="outline-none"><PageBoundary><Outlet /></PageBoundary></main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {NAV.map((n) => <Link key={n.to} to={n.to} className="text-slate-600 hover:text-slate-900">{n.label}</Link>)}
            </div>
            <div className="text-center text-sm text-slate-500">© {new Date().getFullYear()} E-Commerce. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
