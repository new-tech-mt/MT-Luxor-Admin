import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

import api from "../api/client";

const METHOD_ICONS = {
  cod: Banknote,
  jazzcash: Smartphone,
  easypaisa: Smartphone,
  bank_transfer: Building2
};

const emptyMethods = [];

function Payments() {
  const [methods, setMethods] =
    useState(emptyMethods);

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/payments/all");

      const paymentMethods =
        response.data?.payment_methods ||
        response.data?.methods ||
        [];

      setMethods(paymentMethods);

    } catch (err) {
      console.error(
        "Payment methods fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load payment methods."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateMethod = (
    id,
    field,
    value
  ) => {
    setMethods((current) =>
      current.map((method) =>
        method.id === id
          ? {
              ...method,
              [field]: value
            }
          : method
      )
    );
  };

  const saveMethod = async (method) => {
    try {
      setSavingId(method.id);
      setMessage("");
      setError("");

      const response =
        await api.put(
          `/payments/${method.id}`,
          {
            is_enabled:
              method.is_enabled,

            account_title:
              method.account_title ||
              null,

            account_number:
              method.account_number ||
              null,

            bank_name:
              method.bank_name ||
              null,

            iban:
              method.iban ||
              null,

            instructions:
              method.instructions ||
              null
          }
        );

      const updatedMethod =
        response.data?.payment_method ||
        response.data?.method;

      if (updatedMethod) {
        setMethods((current) =>
          current.map((item) =>
            item.id === method.id
              ? updatedMethod
              : item
          )
        );
      }

      setMessage(
        `${method.method_name} updated successfully.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3500);

    } catch (err) {
      console.error(
        "Payment method update error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update payment method."
      );

    } finally {
      setSavingId(null);
    }
  };

  const getMethodDescription = (
    methodKey
  ) => {
    switch (methodKey) {
      case "cod":
        return "Accept payment when the order is delivered.";

      case "jazzcash":
        return "Receive payments through JazzCash.";

      case "easypaisa":
        return "Receive payments through Easypaisa.";

      case "bank_transfer":
        return "Accept direct bank account transfers.";

      default:
        return "Configure this payment method for your store.";
    }
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div className="payments-loading">
          <LoaderCircle
            size={22}
            className="spin"
          />

          <span>
            Loading payment methods...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">

      {/* HEADER */}
      <div className="page-header payments-page-header">
        <div>
          <span className="page-eyebrow">
            CHECKOUT
          </span>

          <h1>
            Payment Methods
          </h1>

          <p>
            Manage the payment options available
            to your customers.
          </p>
        </div>
      </div>

      {/* ALERTS */}
      {message && (
        <div className="payments-alert payments-success">
          <CheckCircle2 size={18} />

          <span>
            {message}
          </span>
        </div>
      )}

      {error && (
        <div className="payments-alert payments-error">
          <AlertCircle size={18} />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* INFO */}
      <div className="payments-info">
        <div className="payments-info-icon">
          <ShieldCheck size={20} />
        </div>

        <div>
          <strong>
            Payment settings
          </strong>

          <span>
            Only enabled payment methods will
            appear during checkout.
          </span>
        </div>
      </div>

      {/* METHODS */}
      <div className="payments-list">

        {methods.length === 0 ? (
          <div className="payments-empty">
            <CreditCard size={30} />

            <strong>
              No payment methods found
            </strong>

            <span>
              Payment methods have not been
              configured yet.
            </span>
          </div>
        ) : (
          methods.map((method) => {
            const Icon =
              METHOD_ICONS[
                method.method_key
              ] || CreditCard;

            const isSaving =
              savingId === method.id;

            return (
              <section
                className="payment-card"
                key={method.id}
              >

                {/* CARD HEADER */}
                <div className="payment-card-header">

                  <div className="payment-method-title">

                    <div className="payment-method-icon">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h2>
                        {method.method_name}
                      </h2>

                      <p>
                        {getMethodDescription(
                          method.method_key
                        )}
                      </p>
                    </div>

                  </div>

                  <label className="payment-toggle">
                    <input
                      type="checkbox"
                      checked={
                        method.is_enabled ===
                        true
                      }
                      onChange={(event) =>
                        updateMethod(
                          method.id,
                          "is_enabled",
                          event.target.checked
                        )
                      }
                    />

                    <span className="payment-toggle-track">
                      <span className="payment-toggle-thumb" />
                    </span>

                    <strong>
                      {method.is_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </strong>
                  </label>

                </div>

                {/* SETTINGS */}
                <div className="payment-card-body">

                  {method.method_key !==
                    "cod" && (
                    <>
                      <div className="payment-field">
                        <label>
                          Account Title
                        </label>

                        <input
                          type="text"
                          value={
                            method.account_title ||
                            ""
                          }
                          onChange={(event) =>
                            updateMethod(
                              method.id,
                              "account_title",
                              event.target.value
                            )
                          }
                          placeholder="Enter account title"
                        />
                      </div>

                      <div className="payment-field">
                        <label>
                          Account Number
                        </label>

                        <input
                          type="text"
                          value={
                            method.account_number ||
                            ""
                          }
                          onChange={(event) =>
                            updateMethod(
                              method.id,
                              "account_number",
                              event.target.value
                            )
                          }
                          placeholder="Enter account number"
                        />
                      </div>
                    </>
                  )}

                  {method.method_key ===
                    "bank_transfer" && (
                    <>
                      <div className="payment-field">
                        <label>
                          Bank Name
                        </label>

                        <input
                          type="text"
                          value={
                            method.bank_name ||
                            ""
                          }
                          onChange={(event) =>
                            updateMethod(
                              method.id,
                              "bank_name",
                              event.target.value
                            )
                          }
                          placeholder="Enter bank name"
                        />
                      </div>

                      <div className="payment-field">
                        <label>
                          IBAN
                        </label>

                        <input
                          type="text"
                          value={
                            method.iban ||
                            ""
                          }
                          onChange={(event) =>
                            updateMethod(
                              method.id,
                              "iban",
                              event.target.value
                            )
                          }
                          placeholder="Enter IBAN"
                        />
                      </div>
                    </>
                  )}

                  <div className="payment-field payment-field-full">
                    <label>
                      Customer Instructions
                    </label>

                    <textarea
                      value={
                        method.instructions ||
                        ""
                      }
                      onChange={(event) =>
                        updateMethod(
                          method.id,
                          "instructions",
                          event.target.value
                        )
                      }
                      placeholder="Instructions shown to customers during checkout"
                      rows={4}
                    />
                  </div>

                </div>

                {/* FOOTER */}
                <div className="payment-card-footer">

                  <span>
                    {method.is_enabled
                      ? "This method is available at checkout."
                      : "This method is currently hidden from checkout."}
                  </span>

                  <button
                    type="button"
                    className="payment-save-btn"
                    onClick={() =>
                      saveMethod(method)
                    }
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />

                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </section>
            );
          })
        )}

      </div>
    </div>
  );
}

export default Payments;