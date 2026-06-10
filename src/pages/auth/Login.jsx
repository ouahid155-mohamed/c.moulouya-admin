import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      const { token, admin } = response.data;
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(admin));

      navigate("/", { replace: true });
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          general: err.response?.data?.message || "Une erreur est survenue lors de la connexion.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">C. Moulouya</span>
          <h2 className="login-subtitle">Espace Administration</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {searchParams.get("reset") === "success" && (
            <div style={{
              background: "#d1fae5",
              color: "#065f46",
              border: "1px solid #6ee7b7",
              borderRadius: "10px",
              padding: "11px 14px",
              fontSize: "13.5px",
              marginBottom: "5px",
              textAlign: "center",
              fontWeight: 500
            }}>
              ✓ Mot de passe réinitialisé. Connectez-vous.
            </div>
          )}

          {errors.general && (
            <div className="error-message">
              <span>⚠️</span>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Adresse e-mail
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="error-message">
                <span>⚠️</span>
                {errors.email[0]}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mot de passe
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            {errors.password && (
              <span className="error-message">
                <span>⚠️</span>
                {errors.password[0]}
              </span>
            )}
            <Link to="/forgot-password" className="auth-forgot">
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
