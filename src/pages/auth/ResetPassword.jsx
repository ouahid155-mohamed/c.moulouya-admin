import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/reset-password", {
        email,
        token,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      });
      navigate("/login?reset=success");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-logo">CM</div>
        <h1 className="auth-title">Nouveau mot de passe</h1>
        <p className="auth-subtitle">Choisissez un nouveau mot de passe sécurisé.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required minLength={8}
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div className="auth-field">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Modification..." : "Réinitialiser le mot de passe"}
          </button>
        </form>

        <Link to="/login" className="auth-back">← Retour à la connexion</Link>
      </div>
    </div>
  );
}
