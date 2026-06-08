import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./CmsStats.css";

export default function CmsStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des statistiques", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleChange = (key, field, value) => {
    setStats((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/cms/stats", { stats });
      notify("Statistiques mises à jour avec succès ✓");
    } catch (err) {
      console.error(err);
      notify("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const getLabelForKey = (key) => {
    const labels = {
      doctors: "Médecins Spécialistes",
      operations: "Opérations réussies",
      experience: "Années d'expérience",
      patients: "Patients guéris",
    };
    return labels[key] || key;
  };

  const getIconForKey = (key) => {
    switch (key) {
      case "doctors":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "operations":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        );
      case "experience":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case "patients":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading && stats.length === 0) {
    return <div className="st-loading">Chargement des statistiques...</div>;
  }

  return (
    <div className="st-wrapper">
      <div className="st-header">
        <h1 className="st-page-title">Statistiques</h1>
        <p className="st-page-subtitle">
          Modifiez les compteurs clés affichés sur la page d'accueil.
        </p>
      </div>

      {message.text && (
        <div className={`st-alert st-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="st-grid">
          {stats.map((s) => (
            <div className="st-card" key={s.key}>
              <div className="st-card-header">
                <div className="st-card-icon">{getIconForKey(s.key)}</div>
                <span className="st-card-key">{getLabelForKey(s.key)}</span>
              </div>

              <div className="st-field">
                <label>Valeur (e.g. 10+, 1000+)</label>
                <input
                  type="text"
                  value={s.value || ""}
                  onChange={(e) => handleChange(s.key, "value", e.target.value)}
                  required
                />
              </div>

              <div className="st-field">
                <label>Label (Français)</label>
                <input
                  type="text"
                  value={s.label_fr || ""}
                  onChange={(e) => handleChange(s.key, "label_fr", e.target.value)}
                  required
                />
              </div>

              <div className="st-field">
                <label>Label (Anglais)</label>
                <input
                  type="text"
                  value={s.label_en || ""}
                  onChange={(e) => handleChange(s.key, "label_en", e.target.value)}
                  required
                />
              </div>

              <div className="st-field st-field-rtl">
                <label>Label (Arabe)</label>
                <input
                  type="text"
                  value={s.label_ar || ""}
                  onChange={(e) => handleChange(s.key, "label_ar", e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="st-actions">
          <button className="st-btn" type="submit" disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer les statistiques"}
          </button>
        </div>
      </form>
    </div>
  );
}
