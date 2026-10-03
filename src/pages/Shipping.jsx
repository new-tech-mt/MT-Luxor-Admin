import { useEffect, useState } from "react";

import {
  Truck,
  Save,
  LoaderCircle,
  CircleDollarSign,
  ShoppingBag
} from "lucide-react";

import api from "../api/client";

import {
  PageHeading,
  PageLoader
} from "./Dashboard";

export default function Shipping() {
  const [shipping, setShipping] = useState({
    delivery_charges: "",
    free_shipping_threshold: "",
    is_enabled: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadShipping();
  }, []);

  async function loadShipping() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response =
        await api.get("/shipping/admin");

      const data =
        response.data?.shipping;

      if (data) {
        setShipping({
          delivery_charges:
            data.delivery_charges ?? "",
          free_shipping_threshold:
            data.free_shipping_threshold ?? "",
          is_enabled:
            data.is_enabled === true
        });
      }
    } catch (err) {
      console.error(
        "Shipping load error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load shipping settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setShipping((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response =
        await api.put(
          "/shipping",
          {
            delivery_charges:
              Number(
                shipping.delivery_charges
              ),

            free_shipping_threshold:
              Number(
                shipping.free_shipping_threshold
              ),

            is_enabled:
              shipping.is_enabled
          }
        );

      const data =
        response.data?.shipping;

      if (data) {
        setShipping({
          delivery_charges:
            data.delivery_charges ?? "",
          free_shipping_threshold:
            data.free_shipping_threshold ?? "",
          is_enabled:
            data.is_enabled === true
        });
      }

      setMessage(
        "Shipping settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Shipping save error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to save shipping settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="admin-page">

      <PageHeading
        title="Shipping"
        description="Manage delivery charges and free shipping rules for your MT Luxor store."
      />

      <form
        className="settings-form"
        onSubmit={handleSubmit}
      >

        <section className="settings-section">

          <div className="settings-section-heading">
            <div>
              <h2>
                Delivery Settings
              </h2>

              <p>
                Control how delivery charges are
                calculated for customer orders.
              </p>
            </div>
          </div>

          <div className="settings-grid">

            <div className="settings-field">

              <label htmlFor="delivery_charges">
                <Truck size={16} />
                Delivery Charges
              </label>

              <div className="settings-input-wrap">

                <CircleDollarSign size={18} />

                <input
                  id="delivery_charges"
                  name="delivery_charges"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    shipping.delivery_charges
                  }
                  onChange={handleChange}
                  placeholder="Enter delivery charges"
                  required
                />

              </div>

              <span className="settings-help">
                This amount will be added to orders
                when free shipping does not apply.
              </span>

            </div>


            <div className="settings-field">

              <label htmlFor="free_shipping_threshold">
                <ShoppingBag size={16} />
                Free Shipping Threshold
              </label>

              <div className="settings-input-wrap">

                <CircleDollarSign size={18} />

                <input
                  id="free_shipping_threshold"
                  name="free_shipping_threshold"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    shipping.free_shipping_threshold
                  }
                  onChange={handleChange}
                  placeholder="Enter order amount"
                  required
                />

              </div>

              <span className="settings-help">
                Orders at or above this amount will
                qualify for free delivery.
              </span>

            </div>

          </div>

        </section>


        <section className="settings-section">

          <div className="settings-section-heading">

            <div>
              <h2>
                Shipping Status
              </h2>

              <p>
                Enable or disable delivery charges
                across the storefront.
              </p>
            </div>

          </div>


          <label className="shipping-toggle">

            <input
              type="checkbox"
              name="is_enabled"
              checked={
                shipping.is_enabled
              }
              onChange={handleChange}
            />

            <span className="shipping-toggle-track">
              <span className="shipping-toggle-thumb" />
            </span>

            <span className="shipping-toggle-content">

              <strong>
                Shipping Enabled
              </strong>

              <small>
                {shipping.is_enabled
                  ? "Delivery charges are active for customer orders."
                  : "Shipping charges are currently disabled."
                }
              </small>

            </span>

          </label>

        </section>


        <section className="settings-section">

          <div className="settings-section-heading">

            <div>
              <h2>
                How It Works
              </h2>

              <p>
                The storefront automatically applies
                these rules during checkout.
              </p>
            </div>

          </div>


          <div className="shipping-info-grid">

            <div className="shipping-info-card">

              <div className="shipping-info-icon">
                <Truck size={20} />
              </div>

              <div>
                <strong>
                  Standard Delivery
                </strong>

                <p>
                  The configured delivery charge
                  is added when an order does not
                  qualify for free shipping.
                </p>
              </div>

            </div>


            <div className="shipping-info-card">

              <div className="shipping-info-icon">
                <ShoppingBag size={20} />
              </div>

              <div>
                <strong>
                  Free Shipping
                </strong>

                <p>
                  Orders meeting the configured
                  threshold automatically receive
                  free delivery.
                </p>
              </div>

            </div>

          </div>

        </section>


        {error && (
          <div className="settings-alert settings-alert-error">
            {error}
          </div>
        )}


        {message && (
          <div className="settings-alert settings-alert-success">
            {message}
          </div>
        )}


        <div className="settings-actions">

          <button
            type="submit"
            className="admin-primary-btn"
            disabled={saving}
          >

            {saving ? (
              <>
                <LoaderCircle
                  size={18}
                  className="spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={18} />

                Save Shipping
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
}
