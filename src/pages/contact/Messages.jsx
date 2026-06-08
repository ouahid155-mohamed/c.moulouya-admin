import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./Messages.css";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState(null);

  const fetchMessages = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/contact/messages?page=${p}`);
      setMessages(res.data.data);
      setMeta(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(page); }, [page]);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      await api.put(`/admin/contact/messages/${msg.id}/read`);
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m)
      );
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Supprimer ce message ?")) return;
    await api.delete(`/admin/contact/messages/${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="msg-wrapper">

      {/* ── En-tête ── */}
      <div className="msg-header">
        <h1 className="msg-title">Messages de contact</h1>
        {unreadCount > 0 && (
          <span className="msg-badge">{unreadCount} non lu(s)</span>
        )}
      </div>

      <div className="msg-layout">

        {/* ── Liste ── */}
        <div className="msg-list">
          {loading ? (
            <p className="msg-empty">Chargement...</p>
          ) : messages.length === 0 ? (
            <p className="msg-empty">Aucun message reçu.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`msg-item ${selected?.id === msg.id ? "active" : ""} ${!msg.is_read ? "unread" : ""}`}
                onClick={() => openMessage(msg)}
              >
                <div className="msg-item-top">
                  <span className="msg-item-name">{msg.nom}</span>
                  <span className="msg-item-date">
                    {new Date(msg.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="msg-item-email">{msg.email}</p>
                <p className="msg-item-preview">
                  {msg.message.substring(0, 60)}...
                </p>
                {!msg.is_read && <span className="msg-dot" />}
              </div>
            ))
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="msg-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >← Précédent</button>
              <span>{page} / {meta.last_page}</span>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
              >Suivant →</button>
            </div>
          )}
        </div>

        {/* ── Détail ── */}
        <div className="msg-detail">
          {selected ? (
            <>
              <div className="msg-detail-header">
                <div>
                  <h2 className="msg-detail-name">{selected.nom}</h2>
                  <p className="msg-detail-meta">
                    {selected.email}
                    {selected.tel && ` • ${selected.tel}`}
                  </p>
                  <p className="msg-detail-date">
                    {new Date(selected.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <button
                  className="msg-delete-btn"
                  onClick={() => deleteMessage(selected.id)}
                >
                  Supprimer
                </button>
              </div>
              <hr className="msg-divider" />
              <p className="msg-detail-body">{selected.message}</p>

              {/* Répondre par email */}
              <a
                href={`mailto:${selected.email}`}
                className="msg-reply-btn"
              >
                Répondre par email →
              </a>
            </>
          ) : (
            <div className="msg-empty-detail">
              <p>Sélectionnez un message pour le lire</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
