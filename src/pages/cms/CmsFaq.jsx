import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./CmsFaq.css";

const GROUP_TITLES = {
  group_clinique: {
    fr: "À propos de la clinique",
    en: "About the clinic",
    ar: "حول المصحة",
  },
  group_consultation: {
    fr: "Préparer votre consultation",
    en: "Prepare your consultation",
    ar: "التحضير للاستشارة",
  },
  group_services: {
    fr: "Services & soins",
    en: "Services & care",
    ar: "الخدمات والرعاية",
  },
};

const emptyForm = {
  group_key: "group_clinique",
  question_fr: "",
  question_en: "",
  question_ar: "",
  answer_fr: "",
  answer_en: "",
  answer_ar: "",
  order: 0,
  active: true,
};

export default function CmsFaq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/faq");
      setFaqs(res.data);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleOpenAddModal = () => {
    const groupKey = activeFilter === "all" ? "group_clinique" : activeFilter;
    setEditingFaq(null);
    setForm({
      ...emptyForm,
      group_key: groupKey,
      order: faqs.filter((faq) => faq.group_key === groupKey).length,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setForm({
      group_key: faq.group_key,
      question_fr: faq.question_fr || "",
      question_en: faq.question_en || "",
      question_ar: faq.question_ar || "",
      answer_fr: faq.answer_fr || "",
      answer_en: faq.answer_en || "",
      answer_ar: faq.answer_ar || "",
      order: faq.order ?? 0,
      active: !!faq.active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) return;
    try {
      await api.delete(`/admin/cms/faq/${id}`);
      notify("FAQ supprimée avec succès");
      fetchFaqs();
    } catch (err) {
      console.error(err);
      notify("Erreur lors de la suppression", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const selectedGroup = GROUP_TITLES[form.group_key] || GROUP_TITLES.group_clinique;
    const payload = {
      ...form,
      group_title_fr: selectedGroup.fr,
      group_title_en: selectedGroup.en,
      group_title_ar: selectedGroup.ar,
    };

    try {
      if (editingFaq) {
        await api.put(`/admin/cms/faq/${editingFaq.id}`, payload);
        notify("FAQ modifiée avec succès");
      } else {
        await api.post("/admin/cms/faq", payload);
        notify("FAQ ajoutée avec succès");
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error(err);
      notify("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredFaqs = activeFilter === "all"
    ? faqs
    : faqs.filter((faq) => faq.group_key === activeFilter);

  if (loading && faqs.length === 0) {
    return <div className="fq-loading">Chargement de la FAQ...</div>;
  }

  return (
    <div className="fq-wrapper">
      <div className="fq-header-row">
        <div>
          <h1 className="fq-page-title">FAQ</h1>
          <p className="fq-page-subtitle">
            Gérez les questions fréquentes en français, anglais et arabe.
          </p>
        </div>
        <button className="fq-add-btn" onClick={handleOpenAddModal}>
          + Ajouter une FAQ
        </button>
      </div>

      {message.text && (
        <div className={`fq-alert fq-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="fq-filters">
        <button
          className={`fq-filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Toutes ({faqs.length})
        </button>
        {Object.entries(GROUP_TITLES).map(([key, obj]) => (
          <button
            key={key}
            className={`fq-filter-btn ${activeFilter === key ? "active" : ""}`}
            onClick={() => setActiveFilter(key)}
          >
            {obj.fr} ({faqs.filter((faq) => faq.group_key === key).length})
          </button>
        ))}
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="fq-empty-box">Aucune FAQ dans cette catégorie.</div>
      ) : (
        <div className="fq-list">
          {filteredFaqs.map((faq) => (
            <div className={`fq-item-card ${!faq.active ? "inactive-card" : ""}`} key={faq.id}>
              <div className="fq-item-header">
                <div>
                  <span className="fq-group-badge">{GROUP_TITLES[faq.group_key]?.fr || faq.group_key}</span>
                  <span className="fq-order-badge">Ordre: {faq.order}</span>
                  <span className={`fq-status-dot ${faq.active ? "active" : "inactive"}`} title={faq.active ? "Actif" : "Inactif"} />
                </div>
                <div className="fq-item-actions">
                  <button className="fq-edit-btn" onClick={() => handleOpenEditModal(faq)}>Modifier</button>
                  <button className="fq-delete-btn" onClick={() => handleDelete(faq.id)}>Supprimer</button>
                </div>
              </div>

              <div className="fq-item-content">
                <div className="fq-qa-block">
                  <p className="fq-question"><strong>FR:</strong> {faq.question_fr}</p>
                  <p className="fq-answer">{faq.answer_fr}</p>
                </div>
                <div className="fq-qa-block">
                  <p className="fq-question"><strong>EN:</strong> {faq.question_en || "-"}</p>
                  <p className="fq-answer">{faq.answer_en || "-"}</p>
                </div>
                <div className="fq-qa-block ar-text" dir="rtl">
                  <p className="fq-question"><strong>AR:</strong> {faq.question_ar}</p>
                  <p className="fq-answer">{faq.answer_ar}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fq-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="fq-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fq-modal-header">
              <h3>{editingFaq ? "Modifier la FAQ" : "Ajouter une FAQ"}</h3>
              <button className="fq-close-modal" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="fq-modal-form">
              <div className="fq-modal-fields-row">
                <div className="fq-modal-field">
                  <label>Groupe / catégorie</label>
                  <select
                    value={form.group_key}
                    onChange={(e) => setForm({ ...form, group_key: e.target.value })}
                    required
                  >
                    {Object.entries(GROUP_TITLES).map(([key, obj]) => (
                      <option key={key} value={key}>{obj.fr}</option>
                    ))}
                  </select>
                </div>
                <div className="fq-modal-field">
                  <label>Ordre d'affichage</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              <div className="fq-modal-fields-row">
                <div className="fq-modal-field">
                  <label>Question (FR)</label>
                  <input
                    type="text"
                    value={form.question_fr}
                    onChange={(e) => setForm({ ...form, question_fr: e.target.value })}
                    required
                  />
                </div>
                <div className="fq-modal-field">
                  <label>Question (EN)</label>
                  <input
                    type="text"
                    value={form.question_en}
                    onChange={(e) => setForm({ ...form, question_en: e.target.value })}
                    required
                  />
                </div>
                <div className="fq-modal-field">
                  <label>Question (AR)</label>
                  <input
                    type="text"
                    value={form.question_ar}
                    onChange={(e) => setForm({ ...form, question_ar: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="fq-modal-field">
                <label>Réponse (FR)</label>
                <textarea
                  value={form.answer_fr}
                  onChange={(e) => setForm({ ...form, answer_fr: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="fq-modal-field">
                <label>Réponse (EN)</label>
                <textarea
                  value={form.answer_en}
                  onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="fq-modal-field">
                <label>Réponse (AR)</label>
                <textarea
                  value={form.answer_ar}
                  onChange={(e) => setForm({ ...form, answer_ar: e.target.value })}
                  required
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="fq-modal-field-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <span>Actif (visible sur le site)</span>
                </label>
              </div>

              <div className="fq-modal-actions">
                <button type="button" className="fq-cancel-btn" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="fq-save-btn" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
