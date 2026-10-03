import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  AdminAuthProvider
} from "./context/AdminAuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Shipping from "./pages/Shipping";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import StoreRedirect from "./pages/StoreRedirect";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>

      <AdminAuthProvider>

        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* PROTECTED ADMIN */}
          <Route
            element={
              <ProtectedRoute />
            }
          >

            <Route
              element={
                <AdminLayout />
              }
            >

              <Route
                path="/"
                element={
                  <Dashboard />
                }
              />

              <Route
                path="/products"
                element={
                  <Products />
                }
              />

              <Route
                path="/categories"
                element={
                  <Categories />
                }
              />

              <Route
                path="/orders"
                element={
                  <Orders />
                }
              />

              <Route
                path="/shipping"
                element={
                  <Shipping />
                }
              />

              <Route
                path="/payments"
                element={
                  <Payments />
                }
              />

              <Route
                path="/settings"
                element={
                  <Settings />
                }
              />

              <Route
                path="/store"
                element={
                  <StoreRedirect />
                }
              />

            </Route>

          </Route>

          {/* FALLBACK */}
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

      </AdminAuthProvider>

    </BrowserRouter>
  );
}