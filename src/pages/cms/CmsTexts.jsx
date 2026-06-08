import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./CmsTexts.css";

export default function CmsTexts() {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/texts");
      setTexts(res.data);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des textes", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleChange = (key, field, value) => {
    setTexts((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );
  };

  const getTextsByTab = () => {
    switch (activeTab) {
      case "hero":
        return texts.filter((t) => t.key.startsWith("hero."));
      case "history":
        return texts.filter((t) => t.key.startsWith("history."));
      case "stats":
        return texts.filter((t) => t.key.startsWith("stats."));
      case "video":
        return texts.filter((t) => t.key.startsWith("video."));
      case "specialties":
        return texts.filter((t) => t.key.startsWith("specialties."));
      case "pages":
        return texts.filter(
          (t) => t.key.startsWith("faq_page.") || t.key.startsWith("contact_page.")
        );
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/cms/texts", { texts });
      notify("Textes enregistrés avec succès ✓");
    } catch (err) {
      console.error(err);
      notify("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const getLabelForKey = (key) => {
    const labels = {
      "hero.quote": "Citation de la section d'accueil (Hero)",
      "history.tag": "Badge Notre Histoire (e.g. NOTRE HISTOIRE)",
      "history.title": "Titre Notre Histoire",
      "history.desc": "Description Notre Histoire",
      "history.contact_btn": "Texte bouton Contactez-nous",
      "history.need_help": "Texte Besoin d'aide",
      "stats.tag": "Badge Succès (e.g. HISTOIRE DE RÉUSSITE)",
      "stats.title": "Titre Section Statistiques",
      "stats.desc": "Description Section Statistiques",
      "video.title": "Titre Section Vidéo",
      "video.subtitle": "Sous-titre Section Vidéo",
      "specialties.title": "Titre Section Spécialités (Desktop)",
      "specialties.desc": "Description Section Spécialités (Desktop)",
      "specialties.mobile_title": "Titre Section Spécialités (Mobile)",
      "specialties.mobile_desc": "Description Section Spécialités (Mobile)",
      "faq_page.title": "Titre Page FAQ",
      "faq_page.subtitle": "Sous-titre Page FAQ",
      "contact_page.title": "Titre Page Contact",
      "contact_page.subtitle": "Sous-titre Page Contact",
    };
    return labels[key] || key;
  };

  const isTextArea = (key) => {
    return key.endsWith(".desc") || key.endsWith(".subtitle") || key.endsWith(".quote");
  };

  if (loading && texts.length === 0) {
    return <div className="tx-loading">Chargement des textes...</div>;
  }

  const activeTexts = getTextsByTab();

  return (
    <div className="tx-wrapper">
      <div className="tx-header">
        <h1 className="tx-page-title">Textes & Titres</h1>
        <p className="tx-page-subtitle">
          Modifiez les textes, titres et descriptions affichés sur le site vitrine.
        </p>
      </div>

      {message.text && (
        <div className={`tx-alert tx-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="tx-tabs">
        {[
          { key: "hero", label: "Accueil (Hero)" },
          { key: "history", label: "Histoire" },
          { key: "stats", label: "Statistiques" },
          { key: "video", label: "Vidéo" },
          { key: "specialties", label: "Spécialités" },
          { key: "pages", label: "Autres Pages" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tx-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="tx-card-list">
          {activeTexts.map((t) => (
            <div className="tx-card" key={t.key}>
              <h3 className="tx-card-label">{getLabelForKey(t.key)}</h3>
              <span className="tx-card-key-badge">{t.key}</span>
              
              <div className="tx-fields-row">
                {/* Français */}
                <div className="tx-field">
                  <label>
                    <span className="flag-icon">🇫🇷</span> Version Française
                  </label>
                  {isTextArea(t.key) ? (
                    <textarea
                      value={t.value_fr || ""}
                      onChange={(e) => handleChange(t.key, "value_fr", e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={t.value_fr || ""}
                      onChange={(e) => handleChange(t.key, "value_fr", e.target.value)}
                    />
                  )}
                </div>

                {/* Anglais */}
                <div className="tx-field">
                  <label>Version Anglaise</label>
                  {isTextArea(t.key) ? (
                    <textarea
                      value={t.value_en || ""}
                      onChange={(e) => handleChange(t.key, "value_en", e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={t.value_en || ""}
                      onChange={(e) => handleChange(t.key, "value_en", e.target.value)}
                    />
                  )}
                </div>

                {/* Arabe */}
                <div className="tx-field tx-field-rtl">
                  <label>
                    Version Arabe <span className="flag-icon">🇲🇦</span>
                  </label>
                  {isTextArea(t.key) ? (
                    <textarea
                      value={t.value_ar || ""}
                      onChange={(e) => handleChange(t.key, "value_ar", e.target.value)}
                      rows={4}
                      dir="rtl"
                    />
                  ) : (
                    <input
                      type="text"
                      value={t.value_ar || ""}
                      onChange={(e) => handleChange(t.key, "value_ar", e.target.value)}
                      dir="rtl"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="tx-actions">
          <button className="tx-btn" type="submit" disabled={saving}>
            {saving ? "Enregistrement en cours..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
