import { useEffect, useState } from "react";

import {
  Mail,
  MapPin,
  Phone,
  Save,
  MessageCircle,
  Music,
  AtSign
} from "lucide-react";

import api from "../api/client";

import {
  PageHeading,
  PageLoader
} from "./Dashboard";


export default function Settings() {

  const [settings, setSettings] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    instagram_username: "",
    tiktok_username: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  useEffect(() => {
    loadSettings();
  }, []);


  async function loadSettings() {

    try {

      setLoading(true);
      setError("");
      setMessage("");


      const response =
        await api.get("/settings/admin");


      const data =
        response.data?.settings;


      if (data) {

        setSettings({
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          address: data.address || "",
          instagram_username:
            data.instagram_username || "",
          tiktok_username:
            data.tiktok_username || ""
        });

      }

    } catch (err) {

      console.error(
        "Settings load error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Unable to load store settings."
      );

    } finally {

      setLoading(false);

    }
  }


  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function handleChange(event) {

    const {
      name,
      value
    } = event.target;


    setSettings((current) => ({
      ...current,
      [name]: value
    }));


    setMessage("");
    setError("");
  }


  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  async function handleSubmit(event) {

    event.preventDefault();


    try {

      setSaving(true);
      setMessage("");
      setError("");


      const response =
        await api.put(
          "/settings",
          settings
        );


      const data =
        response.data?.settings;


      if (data) {

        setSettings({
          phone: data.phone || "",
          whatsapp:
            data.whatsapp || "",
          email:
            data.email || "",
          address:
            data.address || "",
          instagram_username:
            data.instagram_username || "",
          tiktok_username:
            data.tiktok_username || ""
        });

      }


      setMessage(
        "Store settings saved successfully."
      );

    } catch (err) {

      console.error(
        "Settings save error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Unable to save store settings."
      );

    } finally {

      setSaving(false);

    }
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <PageLoader />;
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="admin-page">

      <PageHeading
        title="Store Settings"
        description="Manage the contact information and social profiles shown across your MT Luxor store."
      />


      <form
        className="settings-form"
        onSubmit={handleSubmit}
      >


        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <h2>
                Contact Information
              </h2>

              <p>
                Manage the contact details that
                customers can use to reach MT Luxor.
              </p>

            </div>

          </div>


          <div className="settings-grid">


            {/* PHONE */}

            <div className="settings-field">

              <label htmlFor="phone">

                <Phone size={16} />

                Phone

              </label>


              <div className="settings-input-wrap">

                <Phone size={18} />

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="03XXXXXXXXX"
                  autoComplete="tel"
                />

              </div>

            </div>


            {/* WHATSAPP */}

            <div className="settings-field">

              <label htmlFor="whatsapp">

                <MessageCircle size={16} />

                WhatsApp

              </label>


              <div className="settings-input-wrap">

                <MessageCircle size={18} />

                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="text"
                  value={settings.whatsapp}
                  onChange={handleChange}
                  placeholder="03XXXXXXXXX"
                  autoComplete="tel"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="settings-field">

              <label htmlFor="email">

                <Mail size={16} />

                Email

              </label>


              <div className="settings-input-wrap">

                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="email"
                />

              </div>

            </div>


            {/* ADDRESS */}

            <div className="settings-field settings-field-full">

              <label htmlFor="address">

                <MapPin size={16} />

                Address

              </label>


              <div className="settings-input-wrap settings-textarea-wrap">

                <MapPin size={18} />

                <textarea
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="Your store address"
                  rows="4"
                />

              </div>

            </div>

          </div>

        </section>



        {/* =================================================
            SOCIAL MEDIA
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <h2>
                Social Media
              </h2>

              <p>
                Enter usernames only. Full social URLs
                are generated by the storefront.
              </p>

            </div>

          </div>


          <div className="settings-grid">


            {/* INSTAGRAM */}

            <div className="settings-field">

              <label htmlFor="instagram_username">

                <AtSign size={16} />

                Instagram Username

              </label>


              <div className="settings-input-wrap">

                <AtSign size={18} />

                <input
                  id="instagram_username"
                  name="instagram_username"
                  type="text"
                  value={
                    settings.instagram_username
                  }
                  onChange={handleChange}
                  placeholder="username"
                  autoComplete="off"
                />

              </div>

            </div>


            {/* TIKTOK */}

            <div className="settings-field">

              <label htmlFor="tiktok_username">

                <Music size={16} />

                TikTok Username

              </label>


              <div className="settings-input-wrap">

                <Music size={18} />

                <input
                  id="tiktok_username"
                  name="tiktok_username"
                  type="text"
                  value={
                    settings.tiktok_username
                  }
                  onChange={handleChange}
                  placeholder="username"
                  autoComplete="off"
                />

              </div>

            </div>

          </div>

        </section>



        {/* =================================================
            ALERTS
        ================================================= */}

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



        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <div className="settings-actions">

          <button
            type="submit"
            className="admin-primary-btn"
            disabled={saving}
          >

            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Settings"}

          </button>

        </div>


      </form>

    </div>

  );
}