import { useEffect, useState } from "react";
import {
  Package,
  Tags,
  ShoppingCart,
  CheckCircle2,
  ArrowUpRight,
  Clock3
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Dashboard() {
  const [data, setData] = useState({
    products: [],
    categories: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [products, categories, orders] = await Promise.all([
          api.get("/products/all"),
          api.get("/categories/all"),
          api.get("/orders")
        ]);

        setData({
          products: products.data?.products || [],
          categories: categories.data?.categories || [],
          orders: orders.data?.orders || []
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <PageLoader />;

  const activeProducts = data.products.filter(
    (product) => product.active !== false
  ).length;

  const pendingOrders = data.orders.filter((order) =>
    ["pending", "confirmed", "processing"].includes(
      String(order.status || "").toLowerCase()
    )
  ).length;

  const completedOrders = data.orders.filter((order) =>
    ["delivered", "completed"].includes(
      String(order.status || "").toLowerCase()
    )
  ).length;

  return (
    <>
      <PageHeading
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Manage your MT Luxor store from one place."
      />

      {error && <div className="alert">{error}</div>}

      <div className="stats-grid">
        <Stat
          icon={Package}
          label="Total Products"
          value={data.products.length}
          note={`${activeProducts} active`}
        />

        <Stat
          icon={Tags}
          label="Categories"
          value={data.categories.length}
          note="Store categories"
        />

        <Stat
          icon={ShoppingCart}
          label="Total Orders"
          value={data.orders.length}
          note={`${pendingOrders} pending`}
        />

        <Stat
          icon={CheckCircle2}
          label="Completed"
          value={completedOrders}
          note="Delivered orders"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span>QUICK ACCESS</span>
              <h2>Store Management</h2>
            </div>
          </div>

          <div className="quick-grid">
            <Quick
              to="/products"
              icon={Package}
              title="Products"
              text="Add, edit and manage watches."
            />

            <Quick
              to="/categories"
              icon={Tags}
              title="Categories"
              text="Organize your watch collection."
            />

            <Quick
              to="/orders"
              icon={ShoppingCart}
              title="Orders"
              text="View and update customer orders."
            />

            <Quick
              to="/settings"
              icon={Clock3}
              title="Store Settings"
              text="Manage store information and links."
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span>RECENT</span>
              <h2>Latest Orders</h2>
            </div>

            <Link to="/orders" className="view-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>

          {data.orders.length === 0 ? (
            <div className="empty-state">
              No orders have been received yet.
            </div>
          ) : (
            <div className="order-list">
              {data.orders.slice(0, 6).map((order) => (
                <div className="mini-order" key={order.id}>
                  <div>
                    <strong>
                      {order.order_number || order.orderNumber || order.id}
                    </strong>
                    <span>
                      {order.customer_name ||
                        order.customer?.name ||
                        "Customer"}
                    </span>
                  </div>

                  <div className="order-right">
                    <strong>
                      {formatCurrency(
                        order.total ?? order.total_amount ?? 0,
                        order.currency
                      )}
                    </strong>
                    <Status status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Quick({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="quick-link">
      <div className="quick-icon">
        <Icon size={19} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <ArrowUpRight size={17} />
    </Link>
  );
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action}
    </div>
  );
}

export function Status({ status }) {
  const value = String(status || "pending").toLowerCase();

  return (
    <span className={`status status-${value}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function formatCurrency(value, currency = "PKR") {
  return `${currency || "PKR"} ${Number(value || 0).toLocaleString("en-PK")}`;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-ring" />
      <span>Loading...</span>
    </div>
  );
}
