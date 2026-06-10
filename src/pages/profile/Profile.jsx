import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./Profile.css";

export default function Profile() {
  const [admin, setAdmin]               = useState(null);
  const [activeTab, setActiveTab]       = useState("info");
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState({ text: "", type: "" });

  // Formulaires
  const [infoForm, setInfoForm]         = useState({ name: "", phone: "" });
  const [emailForm, setEmailForm]       = useState({ new_email: "" });
  const [passForm, setPassForm]         = useState({
    current_password: "", new_password: "", new_password_confirmation: ""
  });

  // Charger le profil au montage
  useEffect(() => {
    api.get("/admin/profile").then((res) => {
      setAdmin(res.data);
      setInfoForm({ name: res.data.name, phone: res.data.phone || "" });
    });
  }, []);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // Mettre à jour nom/téléphone
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/admin/profile", infoForm);
      setAdmin(res.data.admin);
      localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
      notify("Profil mis à jour avec succès ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  // Demander changement d'email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/profile/request-email-change", emailForm);
      notify("Email de confirmation envoyé à votre nouvelle adresse ✓");
      setEmailForm({ new_email: "" });
    } catch (err) {
      notify(err.response?.data?.message || "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  // Changer mot de passe
  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/profile/password", passForm);
      notify("Mot de passe modifié avec succès ✓");
      setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      notify(err.response?.data?.message || "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return <div className="pf-loading">Chargement...</div>;

  return (
    <div className="pf-wrapper">
      <div className="pf-header">
        <div className="pf-avatar">
          {admin.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="pf-name">{admin.name}</h1>
          <p className="pf-email">{admin.email}</p>
        </div>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div className={`pf-alert pf-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="pf-tabs">
        {[
          { key: "info",     label: "Informations" },
          { key: "email",    label: "Changer l'email" },
          { key: "password", label: "Mot de passe" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pf-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Informations ── */}
      {activeTab === "info" && (
        <form className="pf-form" onSubmit={handleInfoSubmit}>
          <div className="pf-field">
            <label>Nom complet</label>
            <input
              type="text"
              value={infoForm.name}
              onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
              required
            />
          </div>
          <div className="pf-field">
            <label>Téléphone</label>
            <input
              type="tel"
              value={infoForm.phone}
              onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
              placeholder="+212 6 xx xx xx xx"
            />
          </div>
          <button className="pf-btn" type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      {/* ── Tab Email ── */}
      {activeTab === "email" && (
        <form className="pf-form" onSubmit={handleEmailSubmit}>
          <div className="pf-info-box">
            Email actuel : <strong>{admin.email}</strong>
          </div>
          <div className="pf-field">
            <label>Nouvel email</label>
            <input
              type="email"
              value={emailForm.new_email}
              onChange={(e) => setEmailForm({ new_email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <p className="pf-hint">
            Un email de confirmation sera envoyé à votre nouvelle adresse.
          </p>
          <button className="pf-btn" type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer la confirmation"}
          </button>
        </form>
      )}

      {/* ── Tab Mot de passe ── */}
      {activeTab === "password" && (
        <form className="pf-form" onSubmit={handlePassSubmit}>
          <div className="pf-field">
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={passForm.current_password}
              onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
              required
            />
          </div>
          <div className="pf-field">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={passForm.new_password}
              onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div className="pf-field">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={passForm.new_password_confirmation}
              onChange={(e) => setPassForm({ ...passForm, new_password_confirmation: e.target.value })}
              required
            />
          </div>
          <button className="pf-btn" type="submit" disabled={loading}>
            {loading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}
