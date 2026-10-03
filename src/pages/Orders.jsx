import { useEffect, useState } from "react";
import { Eye, X, MessageCircle } from "lucide-react";
import api from "../api/client";
import {
  PageHeading,
  PageLoader,
  Status,
  formatCurrency,
} from "./Dashboard";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setError("");

      const res = await api.get("/orders");

      setOrders(res.data?.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


  /* =========================================================
     UPDATE ORDER STATUS
     Backend:
     PUT /api/orders/:id/status
  ========================================================= */

  const updateStatus = async (id, status) => {
    try {
      setError("");
      setUpdatingId(id);

      const res = await api.put(
        `/orders/${id}/status`,
        {
          status,
        }
      );

      const updatedOrder =
        res.data?.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status:
                  updatedOrder?.status ||
                  status,
                updated_at:
                  updatedOrder?.updated_at ||
                  order.updated_at,
              }
            : order
        )
      );

      if (selected?.id === id) {
        setSelected((current) => ({
          ...current,
          status:
            updatedOrder?.status ||
            status,
          updated_at:
            updatedOrder?.updated_at ||
            current.updated_at,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update order."
      );
    } finally {
      setUpdatingId(null);
    }
  };


  /* =========================================================
     UPDATE PAYMENT STATUS
     Backend:
     PUT /api/orders/:id/payment-status
  ========================================================= */

  const updatePaymentStatus = async (
    id,
    payment_status
  ) => {
    try {
      setError("");
      setUpdatingId(id);

      const res = await api.put(
        `/orders/${id}/payment-status`,
        {
          payment_status,
        }
      );

      const updatedOrder =
        res.data?.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                payment_status:
                  updatedOrder?.payment_status ||
                  payment_status,
                updated_at:
                  updatedOrder?.updated_at ||
                  order.updated_at,
              }
            : order
        )
      );

      if (selected?.id === id) {
        setSelected((current) => ({
          ...current,
          payment_status:
            updatedOrder?.payment_status ||
            payment_status,
          updated_at:
            updatedOrder?.updated_at ||
            current.updated_at,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };


  /* =========================================================
     WHATSAPP CUSTOMER
  ========================================================= */

  const openCustomerWhatsApp = (order) => {
    if (!order?.customer_phone) {
      return;
    }

    let phone =
      String(order.customer_phone)
        .replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone =
        `92${phone.slice(1)}`;
    }

    if (!phone) {
      return;
    }

    const message = [
      `Hello ${order.customer_name || "Customer"},`,
      "",
      `Regarding your MT LUXOR order ${order.order_number || ""}.`,
      `Current order status: ${order.status || "pending"}.`,
      "",
      "Thank you for shopping with MT LUXOR.",
    ].join("\n");

    const url =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  if (loading) {
    return <PageLoader />;
  }


  return (
    <>
      <PageHeading
        eyebrow="SALES"
        title="Orders"
        description="View and manage customer orders."
      />


      {error && (
        <div className="alert">
          {error}
        </div>
      )}


      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>


            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>

                  <td>
                    <strong>
                      {order.order_number ||
                        order.orderNumber ||
                        order.id}
                    </strong>
                  </td>


                  <td>
                    {order.customer_name ||
                      order.customer?.name ||
                      "Customer"}
                  </td>


                  <td>
                    {formatCurrency(
                      order.total ??
                        order.total_amount ??
                        0,
                      order.currency
                    )}
                  </td>


                  <td>
                    <select
                      className="status-select"
                      value={
                        order.status ||
                        "pending"
                      }
                      disabled={
                        updatingId ===
                        order.id
                      }
                      onChange={(e) =>
                        updateStatus(
                          order.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </td>


                  <td>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-PK",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </td>


                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      {order.customer_phone && (
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() =>
                            openCustomerWhatsApp(
                              order
                            )
                          }
                          title="WhatsApp customer"
                        >
                          <MessageCircle
                            size={17}
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() =>
                          setSelected(order)
                        }
                        title="View order"
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}


              {orders.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      No orders have been
                      received yet.
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>


      {selected && (
        <div className="modal-backdrop">

          <div className="modal order-modal">

            <div className="modal-header">

              <div>
                <span>
                  ORDER DETAILS
                </span>

                <h2>
                  {selected.order_number ||
                    selected.orderNumber ||
                    selected.id}
                </h2>
              </div>


              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>


            <div className="order-detail-grid">

              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {selected.customer_name ||
                    selected.customer?.name ||
                    "-"}
                </strong>
              </div>


              <div>
                <span>
                  Phone
                </span>

                <strong>
                  {selected.customer_phone ||
                    selected.customer?.phone ||
                    "-"}
                </strong>
              </div>


              <div>
                <span>
                  Email
                </span>

                <strong>
                  {selected.customer_email ||
                    selected.customer?.email ||
                    "-"}
                </strong>
              </div>


              <div>
                <span>
                  Payment
                </span>

                <strong>
                  {selected.payment_method ||
                    "-"}
                </strong>
              </div>


              <div className="detail-wide">
                <span>
                  Address
                </span>

                <strong>
                  {selected.customer_address ||
                    selected.customer?.address ||
                    "-"}
                </strong>
              </div>


              <div>
                <span>
                  City
                </span>

                <strong>
                  {selected.customer_city ||
                    "-"}
                </strong>
              </div>


              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    selected.subtotal ??
                      0,
                    selected.currency
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Delivery
                </span>

                <strong>
                  {formatCurrency(
                    selected.shipping_fee ??
                      0,
                    selected.currency
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    selected.total ??
                      selected.total_amount ??
                      0,
                    selected.currency
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Status
                </span>

                <select
                  className="status-select"
                  value={
                    selected.status ||
                    "pending"
                  }
                  disabled={
                    updatingId ===
                    selected.id
                  }
                  onChange={(e) =>
                    updateStatus(
                      selected.id,
                      e.target.value
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="shipped">
                    Shipped
                  </option>

                  <option value="delivered">
                    Delivered
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>


              <div>
                <span>
                  Payment Status
                </span>

                <select
                  className="status-select"
                  value={
                    selected.payment_status ||
                    "pending"
                  }
                  disabled={
                    updatingId ===
                    selected.id
                  }
                  onChange={(e) =>
                    updatePaymentStatus(
                      selected.id,
                      e.target.value
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                  <option value="refunded">
                    Refunded
                  </option>
                </select>
              </div>


              {selected.customer_notes && (
                <div className="detail-wide">
                  <span>
                    Customer Notes
                  </span>

                  <strong>
                    {selected.customer_notes}
                  </strong>
                </div>
              )}


              <div className="detail-wide">
                <span>
                  Order Items
                </span>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  {Array.isArray(
                    selected.order_items
                  ) &&
                  selected.order_items.length >
                    0 ? (
                    selected.order_items.map(
                      (item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            padding:
                              "10px 0",
                            borderBottom:
                              "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          <span>
                            {item.product_name}
                            {" × "}
                            {item.quantity}
                          </span>

                          <strong>
                            {formatCurrency(
                              item.total_price ??
                                0,
                              selected.currency
                            )}
                          </strong>
                        </div>
                      )
                    )
                  ) : (
                    <span>
                      No item details available.
                    </span>
                  )}
                </div>
              </div>

            </div>


            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}
            >

              {selected.customer_phone && (
                <button
                  type="button"
                  className="login-btn"
                  onClick={() =>
                    openCustomerWhatsApp(
                      selected
                    )
                  }
                >
                  <MessageCircle
                    size={18}
                  />
                  WhatsApp Customer
                </button>
              )}

              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  setSelected(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}