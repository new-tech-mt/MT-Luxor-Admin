import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Truck,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import { useState } from "react";

import {
  useAdminAuth
} from "../context/AdminAuthContext";

const navigation = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard
  },
  {
    label: "Products",
    to: "/products",
    icon: Package
  },
  {
    label: "Categories",
    to: "/categories",
    icon: Tags
  },
  {
    label: "Orders",
    to: "/orders",
    icon: ShoppingCart
  },
  {
    label: "Shipping",
    to: "/shipping",
    icon: Truck
  },
  {
    label: "Payments",
    to: "/payments",
    icon: CreditCard
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings
  }
];

export default function AdminLayout() {
  const {
    user,
    logout
  } = useAdminAuth();

  const navigate =
    useNavigate();

  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);

  const handleLogout =
    async () => {
      await logout();

      navigate(
        "/login",
        {
          replace: true
        }
      );
    };

  return (
    <div className="admin-shell">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Close menu"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >

        {/* BRAND */}
        <div className="admin-brand">

          <div className="brand-mark">
            MT
          </div>

          <div>
            <strong>
              MT LUXOR
            </strong>

            <span>
              CONTROL PANEL
            </span>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        {/* SECTION TITLE */}
        <div className="admin-sidebar-title">
          MANAGEMENT
        </div>

        {/* NAVIGATION */}
        <nav className="admin-nav">

          {navigation.map(
            ({
              label,
              to,
              icon: Icon
            }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={({
                  isActive
                }) =>
                  `admin-nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >

                <Icon size={19} />

                <span>
                  {label}
                </span>

              </NavLink>
            )
          )}

        </nav>

        {/* BOTTOM */}
        <div className="sidebar-bottom">

          {/* STORE */}
          <NavLink
            to="/store"
            className="admin-nav-link"
            onClick={() =>
              setMobileOpen(false)
            }
          >

            <Store size={19} />

            <span>
              View Store
            </span>

            <ExternalLink
              size={14}
              className="nav-external"
            />

          </NavLink>

          {/* LOGOUT */}
          <button
            className="logout-btn"
            onClick={
              handleLogout
            }
          >

            <LogOut size={18} />

            <span>
              Logout
            </span>

          </button>

          <div className="admin-sidebar-footer">
            MT Luxor Administration
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="admin-main">

        {/* TOPBAR */}
        <header className="admin-topbar">

          <div className="topbar-left">

            <button
              className="menu-btn"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <span>
                ADMINISTRATION
              </span>

              <strong>
                MT Luxor
              </strong>
            </div>

          </div>

          {/* USER */}
          <div className="admin-user">

            <div className="user-avatar">
              {(
                user?.email ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">

              <strong>
                Administrator
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <section className="admin-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}