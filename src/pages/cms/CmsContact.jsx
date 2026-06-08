import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./CmsContact.css";

export default function CmsContact() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [contact, setContact] = useState({
    phone_1: "",
    phone_2: "",
    email: "",
    address_fr: "",
    address_en: "",
    address_ar: "",
    hours_fr: "",
    hours_en: "",
    hours_ar: "",
  });

  const [socials, setSocials] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/contact");
      if (res.data.contact) {
        setContact({
          phone_1: res.data.contact.phone_1 || "",
          phone_2: res.data.contact.phone_2 || "",
          email: res.data.contact.email || "",
          address_fr: res.data.contact.address_fr || "",
          address_en: res.data.contact.address_en || "",
          address_ar: res.data.contact.address_ar || "",
          hours_fr: res.data.contact.hours_fr || "",
          hours_en: res.data.contact.hours_en || "",
          hours_ar: res.data.contact.hours_ar || "",
        });
      }
      if (res.data.socials) {
        setSocials({
          instagram: res.data.socials.instagram || "",
          facebook: res.data.socials.facebook || "",
          tiktok: res.data.socials.tiktok || "",
        });
      }
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des données de contact", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleContactChange = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setSocials((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/cms/contact", { contact, socials });
      notify("Informations de contact et réseaux mis à jour ✓");
    } catch (err) {
      console.error(err);
      notify("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="co-loading">Chargement des informations de contact...</div>;
  }

  return (
    <div className="co-wrapper">
      <div className="co-header">
        <h1 className="co-page-title">Contact & Réseaux</h1>
        <p className="co-page-subtitle">
          Gérez les coordonnées, horaires d'ouverture et liens sociaux de la clinique.
        </p>
      </div>

      {message.text && (
        <div className={`co-alert co-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="co-form">
        <div className="co-sections">
          
          {/* Section 1: Coordonnées de Contact */}
          <div className="co-card">
            <h2 className="co-card-title">Coordonnées de Contact</h2>
            <div className="co-card-divider" />

            <div className="co-fields-row">
              <div className="co-field">
                <label>Téléphone principal</label>
                <input
                  type="text"
                  value={contact.phone_1}
                  onChange={(e) => handleContactChange("phone_1", e.target.value)}
                  placeholder="+212 6 xx xx xx xx"
                  required
                />
              </div>

              <div className="co-field">
                <label>Téléphone secondaire (ou fixe)</label>
                <input
                  type="text"
                  value={contact.phone_2}
                  onChange={(e) => handleContactChange("phone_2", e.target.value)}
                  placeholder="+212 5 xx xx xx xx"
                />
              </div>
            </div>

            <div className="co-field">
              <label>Adresse e-mail</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
                placeholder="contact@cliniquemoulouya.ma"
                required
              />
            </div>

            <div className="co-fields-row">
              <div className="co-field">
                <label>Adresse postale (FR)</label>
                <textarea
                  value={contact.address_fr}
                  onChange={(e) => handleContactChange("address_fr", e.target.value)}
                  rows={2}
                  placeholder="7, Rue De La Paix, Berkane..."
                  required
                />
              </div>

              <div className="co-field co-field-rtl">
                <label>Adresse postale (AR)</label>
                <textarea
                  value={contact.address_ar}
                  onChange={(e) => handleContactChange("address_ar", e.target.value)}
                  rows={2}
                  dir="rtl"
                  placeholder="7، شارع السلام، بركان..."
                  required
                />
              </div>
              <div className="co-field">
                <label>Adresse postale (EN)</label>
                <textarea
                  value={contact.address_en}
                  onChange={(e) => handleContactChange("address_en", e.target.value)}
                  rows={2}
                  placeholder="7, Rue De La Paix, Berkane..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Horaires */}
          <div className="co-card">
            <h2 className="co-card-title">Horaires d'Ouverture</h2>
            <div className="co-card-divider" />

            <div className="co-fields-row">
              <div className="co-field">
                <label>Description horaires (FR)</label>
                <textarea
                  value={contact.hours_fr}
                  onChange={(e) => handleContactChange("hours_fr", e.target.value)}
                  rows={2}
                  placeholder="Disponibles 24h/24..."
                  required
                />
              </div>

              <div className="co-field co-field-rtl">
                <label>Description horaires (AR)</label>
                <textarea
                  value={contact.hours_ar}
                  onChange={(e) => handleContactChange("hours_ar", e.target.value)}
                  rows={2}
                  dir="rtl"
                  placeholder="متاحون 24/24..."
                  required
                />
              </div>
              <div className="co-field">
                <label>Description horaires (EN)</label>
                <textarea
                  value={contact.hours_en}
                  onChange={(e) => handleContactChange("hours_en", e.target.value)}
                  rows={2}
                  placeholder="Available 24/7..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Réseaux Sociaux */}
          <div className="co-card">
            <h2 className="co-card-title">Réseaux Sociaux</h2>
            <div className="co-card-divider" />

            <div className="co-social-grid">
              <div className="co-field">
                <label className="social-label">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  value={socials.instagram}
                  onChange={(e) => handleSocialChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="co-field">
                <label className="social-label">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="currentColor" />
                  </svg>
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  value={socials.facebook}
                  onChange={(e) => handleSocialChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="co-field">
                <label className="social-label">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>TikTok</span>
                </label>
                <input
                  type="text"
                  value={socials.tiktok}
                  onChange={(e) => handleSocialChange("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>

        </div>

        <div className="co-actions">
          <button className="co-btn" type="submit" disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
