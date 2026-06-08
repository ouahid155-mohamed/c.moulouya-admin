import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";

const statCards = [
  {
    key: "unread_messages",
    label: "Messages non lus",
    tone: "red",
    path: "/messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
  {
    key: "total_messages",
    label: "Total messages",
    tone: "blue",
    path: "/messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "total_admins",
    label: "Administrateurs",
    tone: "violet",
    path: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const quickActions = [
  { label: "Modifier les textes", path: "/cms/texts" },
  { label: "Gérer les médias", path: "/cms/media" },
  { label: "Contact & réseaux", path: "/cms/contact" },
  { label: "FAQ", path: "/cms/faq" },
];

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    total_messages: 0,
    unread_messages: 0,
    total_admins: 0,
    recent_messages: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin_user");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }

    Promise.allSettled([
      api.get("/admin/me"),
      api.get("/admin/contact/dashboard/stats"),
    ]).then(([adminResult, statsResult]) => {
      if (adminResult.status === "fulfilled") {
        setAdmin(adminResult.value.data);
        localStorage.setItem("admin_user", JSON.stringify(adminResult.value.data));
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      }

      setLoading(false);
    });
  }, []);

  const readMessages = Math.max(stats.total_messages - stats.unread_messages, 0);
  const readRate = stats.total_messages
    ? Math.round((readMessages / stats.total_messages) * 100)
    : 0;

  const latestMessage = useMemo(() => stats.recent_messages?.[0] || null, [stats.recent_messages]);

  return (
    <div className="db-page">
      <header className="db-hero">
        <div>
          <span className="db-eyebrow">Tableau de bord</span>
          <h1 className="db-title">Bonjour, {admin?.name || "Admin"}</h1>
          <p className="db-subtitle">
            Vue rapide des messages, du contenu CMS et des actions importantes.
          </p>
        </div>
        <div className="db-hero-actions">
          <button className="db-btn db-btn-primary" onClick={() => navigate("/messages")}>
            Voir les messages
          </button>
          <button className="db-btn" onClick={() => navigate("/cms/media")}>
            Médias
          </button>
        </div>
      </header>

      <section className="db-stats-grid" aria-label="Statistiques principales">
        {statCards.map((card) => (
          <button
            type="button"
            className={`db-stat-card db-stat-${card.tone}`}
            key={card.key}
            onClick={() => navigate(card.path)}
          >
            <span className="db-stat-icon">{card.icon}</span>
            <span className="db-stat-body">
              <span className="db-stat-label">{card.label}</span>
              <span className="db-stat-value">{stats[card.key]}</span>
            </span>
          </button>
        ))}
        <div className="db-stat-card db-stat-green">
          <span className="db-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="db-stat-body">
            <span className="db-stat-label">Messages traités</span>
            <span className="db-stat-value">{readRate}%</span>
          </span>
        </div>
      </section>

      <div className="db-main-grid">
        <section className="db-panel db-messages-panel">
          <div className="db-panel-head">
            <div>
              <h2>Messages récents</h2>
              <p>{latestMessage ? `Dernier message de ${latestMessage.nom}` : "Aucun message pour le moment"}</p>
            </div>
            <button className="db-link-btn" onClick={() => navigate("/messages")}>
              Tout voir
            </button>
          </div>

          {loading ? (
            <div className="db-loading">Chargement des donnees...</div>
          ) : stats.recent_messages.length === 0 ? (
            <div className="db-empty">Aucun message reçu pour le moment.</div>
          ) : (
            <div className="db-message-list">
              {stats.recent_messages.map((msg) => (
                <button className="db-message-row" key={msg.id} onClick={() => navigate("/messages")}>
                  <span className={`db-message-dot ${msg.is_read ? "is-read" : "is-unread"}`} />
                  <span className="db-message-content">
                    <span className="db-message-top">
                      <strong>{msg.nom}</strong>
                      <span>
                        {new Date(msg.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span className="db-message-snippet">{msg.message}</span>
                  </span>
                  <span className={`db-status ${msg.is_read ? "read" : "unread"}`}>
                    {msg.is_read ? "Lu" : "Non lu"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="db-side-stack">
          <section className="db-panel">
            <div className="db-panel-head db-panel-head-simple">
              <h2>Actions rapides</h2>
            </div>
            <div className="db-action-list">
              {quickActions.map((action) => (
                <button key={action.path} className="db-action-row" onClick={() => navigate(action.path)}>
                  <span>{action.label}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          </section>

          <section className="db-panel db-health-panel">
            <h2>Etat de suivi</h2>
            <div className="db-progress-line">
              <span style={{ width: `${readRate}%` }} />
            </div>
            <p>
              {readMessages} message{readMessages > 1 ? "s" : ""} traité{readMessages > 1 ? "s" : ""} sur {stats.total_messages}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
