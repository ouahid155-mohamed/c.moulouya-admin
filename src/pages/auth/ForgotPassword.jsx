import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/forgot-password", { email });
      setSent(true);
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
        <h1 className="auth-title">Mot de passe oublié</h1>
        <p className="auth-subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="auth-success">
            ✓ Si cet email existe, un lien vous a été envoyé.
            Vérifiez votre boîte mail.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <Link to="/login" className="auth-back">← Retour à la connexion</Link>
      </div>
    </div>
  );
}
